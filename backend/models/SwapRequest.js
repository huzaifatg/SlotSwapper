import mongoose from 'mongoose';

const swapRequestSchema = new mongoose.Schema({
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Requester ID is required']
  },
  targetOwnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Target owner ID is required']
  },
  mySlotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'My slot ID is required']
  },
  theirSlotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Their slot ID is required']
  },
  status: {
    type: String,
    required: true,
    enum: {
      values: ['PENDING', 'ACCEPTED', 'REJECTED'],
      message: '{VALUE} is not a valid status'
    },
    default: 'PENDING'
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
swapRequestSchema.index({ requesterId: 1, status: 1 });
swapRequestSchema.index({ targetOwnerId: 1, status: 1 });

const SwapRequest = mongoose.model('SwapRequest', swapRequestSchema);

export default SwapRequest;
