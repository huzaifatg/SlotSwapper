import Event from '../models/Event.js';
import SwapRequest from '../models/SwapRequest.js';
import mongoose from 'mongoose';

// @desc    Get all swappable slots (marketplace)
// @route   GET /api/swappable-slots
// @access  Private
export const getSwappableSlots = async (req, res) => {
  try {
    // Find all swappable events that don't belong to the logged-in user
    const swappableSlots = await Event.find({
      status: 'SWAPPABLE',
      ownerId: { $ne: req.user._id }
    })
      .populate('ownerId', 'name email')
      .sort({ startTime: 1 });

    res.status(200).json({
      success: true,
      count: swappableSlots.length,
      data: swappableSlots
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Initiate swap request
// @route   POST /api/swap-request
// @access  Private
export const initiateSwap = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { mySlotId, theirSlotId } = req.body;

    // Validation
    if (!mySlotId || !theirSlotId) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Please provide both mySlotId and theirSlotId'
      });
    }

    // Find both slots
    const mySlot = await Event.findById(mySlotId).session(session);
    const theirSlot = await Event.findById(theirSlotId).session(session);

    // Validate slots exist
    if (!mySlot || !theirSlot) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'One or both slots not found'
      });
    }

    // Verify ownership of mySlot
    if (mySlot.ownerId.toString() !== req.user._id.toString()) {
      await session.abortTransaction();
      return res.status(403).json({
        success: false,
        message: 'You do not own the slot you are trying to swap'
      });
    }

    // Verify user doesn't own theirSlot
    if (theirSlot.ownerId.toString() === req.user._id.toString()) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'You cannot swap with your own slot'
      });
    }

    // Check if both slots are swappable
    if (mySlot.status !== 'SWAPPABLE' || theirSlot.status !== 'SWAPPABLE') {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Both slots must have SWAPPABLE status'
      });
    }

    // Create swap request
    const swapRequest = await SwapRequest.create([{
      requesterId: req.user._id,
      targetOwnerId: theirSlot.ownerId,
      mySlotId,
      theirSlotId,
      status: 'PENDING'
    }], { session });

    // Update both slots to SWAP_PENDING
    mySlot.status = 'SWAP_PENDING';
    theirSlot.status = 'SWAP_PENDING';
    
    await mySlot.save({ session });
    await theirSlot.save({ session });

    await session.commitTransaction();

    // Populate the swap request for response
    const populatedSwapRequest = await SwapRequest.findById(swapRequest[0]._id)
      .populate('requesterId', 'name email')
      .populate('targetOwnerId', 'name email')
      .populate('mySlotId')
      .populate('theirSlotId');

    res.status(201).json({
      success: true,
      data: populatedSwapRequest
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      success: false,
      message: error.message
    });
  } finally {
    session.endSession();
  }
};

// @desc    Respond to swap request (accept/reject)
// @route   POST /api/swap-response/:requestId
// @access  Private
export const respondToSwap = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { requestId } = req.params;
    const { accepted } = req.body;

    // Validation
    if (typeof accepted !== 'boolean') {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Please provide accepted status (true or false)'
      });
    }

    // Find swap request
    const swapRequest = await SwapRequest.findById(requestId).session(session);

    if (!swapRequest) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Swap request not found'
      });
    }

    // Verify user is the target owner
    if (swapRequest.targetOwnerId.toString() !== req.user._id.toString()) {
      await session.abortTransaction();
      return res.status(403).json({
        success: false,
        message: 'Not authorized to respond to this swap request'
      });
    }

    // Check if already responded
    if (swapRequest.status !== 'PENDING') {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Swap request already ${swapRequest.status.toLowerCase()}`
      });
    }

    // Get both slots
    const mySlot = await Event.findById(swapRequest.mySlotId).session(session);
    const theirSlot = await Event.findById(swapRequest.theirSlotId).session(session);

    if (!mySlot || !theirSlot) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'One or both slots not found'
      });
    }

    if (accepted) {
      // ACCEPT: Swap ownership and set both to BUSY
      swapRequest.status = 'ACCEPTED';

      // Exchange ownership
      const tempOwnerId = mySlot.ownerId;
      mySlot.ownerId = theirSlot.ownerId;
      theirSlot.ownerId = tempOwnerId;

      // Set both to BUSY
      mySlot.status = 'BUSY';
      theirSlot.status = 'BUSY';
    } else {
      // REJECT: Set both back to SWAPPABLE
      swapRequest.status = 'REJECTED';
      mySlot.status = 'SWAPPABLE';
      theirSlot.status = 'SWAPPABLE';
    }

    // Save all changes
    await swapRequest.save({ session });
    await mySlot.save({ session });
    await theirSlot.save({ session });

    await session.commitTransaction();

    // Populate and return
    const populatedSwapRequest = await SwapRequest.findById(swapRequest._id)
      .populate('requesterId', 'name email')
      .populate('targetOwnerId', 'name email')
      .populate('mySlotId')
      .populate('theirSlotId');

    res.status(200).json({
      success: true,
      data: populatedSwapRequest,
      message: accepted ? 'Swap accepted successfully' : 'Swap rejected successfully'
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      success: false,
      message: error.message
    });
  } finally {
    session.endSession();
  }
};

// @desc    Get incoming swap requests
// @route   GET /api/swaps/incoming
// @access  Private
export const getIncomingSwaps = async (req, res) => {
  try {
    const incomingSwaps = await SwapRequest.find({
      targetOwnerId: req.user._id,
      status: 'PENDING'
    })
      .populate('requesterId', 'name email')
      .populate('mySlotId')
      .populate('theirSlotId')
      .sort({ createdAt: -1 });

    // Filter out requests where slots have been deleted
    const validSwaps = incomingSwaps.filter(swap => swap.mySlotId && swap.theirSlotId);

    res.status(200).json({
      success: true,
      count: validSwaps.length,
      data: validSwaps
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get outgoing swap requests
// @route   GET /api/swaps/outgoing
// @access  Private
export const getOutgoingSwaps = async (req, res) => {
  try {
    const outgoingSwaps = await SwapRequest.find({
      requesterId: req.user._id
    })
      .populate('targetOwnerId', 'name email')
      .populate('mySlotId')
      .populate('theirSlotId')
      .sort({ createdAt: -1 });

    // Filter out requests where slots have been deleted
    const validSwaps = outgoingSwaps.filter(swap => swap.mySlotId && swap.theirSlotId);

    res.status(200).json({
      success: true,
      count: validSwaps.length,
      data: validSwaps
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
