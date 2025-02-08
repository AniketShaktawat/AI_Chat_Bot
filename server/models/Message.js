import mongoose from 'mongoose';
import moment from 'moment';

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    enum: ['user', 'assistant']
  },
  content: {
    type: String,
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

messageSchema.methods.formatDate = function() {
  return moment(this.timestamp).format('MMM D, h:mm a');
};

export default mongoose.model('Message', messageSchema);
