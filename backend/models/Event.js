import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner ID is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required'],
    validate: {
      validator: function(value) {
        return value > this.startTime;
      },
      message: 'End time must be after start time'
    }
  },
  status: {
    type: String,
    required: true,
    enum: {
      values: ['BUSY', 'SWAPPABLE', 'SWAP_PENDING'],
      message: '{VALUE} is not a valid status'
    },
    default: 'BUSY'
  }
}, {
  timestamps: true
});

// Index for efficient queries
eventSchema.index({ ownerId: 1, status: 1 });
eventSchema.index({ status: 1 });

const Event = mongoose.model('Event', eventSchema);

export default Event;
