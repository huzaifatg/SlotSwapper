import Event from '../models/Event.js';
import SwapRequest from '../models/SwapRequest.js';
import mongoose from 'mongoose';

// @desc    Get all events for logged-in user
// @route   GET /api/events/mine
// @access  Private
export const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ ownerId: req.user._id }).sort({ startTime: 1 });
    
    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private
export const createEvent = async (req, res) => {
  try {
    const { title, startTime, endTime } = req.body;

    // Validation
    if (!title || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, start time, and end time'
      });
    }

    // Check if end time is after start time
    if (new Date(endTime) <= new Date(startTime)) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }

    const event = await Event.create({
      ownerId: req.user._id,
      title,
      startTime,
      endTime,
      status: 'BUSY'
    });

    res.status(201).json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update event status
// @route   PUT /api/events/:id/status
// @access  Private
export const updateEventStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Validation
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide status'
      });
    }

    if (!['BUSY', 'SWAPPABLE', 'SWAP_PENDING'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be BUSY, SWAPPABLE, or SWAP_PENDING'
      });
    }

    // Find event
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user owns the event
    if (event.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event'
      });
    }

    // Update status
    event.status = status;
    await event.save();

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private
export const deleteEvent = async (req, res) => {
  try {
    // Find event
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user owns the event
    if (event.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this event'
      });
    }

    // Don't allow deletion if event has pending swap
    if (event.status === 'SWAP_PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete event with pending swap request. Please resolve the swap first.'
      });
    }

    // Check if event is referenced in any swap requests
    const swapRequests = await SwapRequest.find({
      $or: [
        { mySlotId: req.params.id },
        { theirSlotId: req.params.id }
      ],
      status: 'PENDING'
    });

    if (swapRequests.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete event that is part of pending swap requests.'
      });
    }

    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
