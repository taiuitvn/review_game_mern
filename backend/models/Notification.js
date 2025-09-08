import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  // Who receives the notification
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true,
    index: true 
  },
  // Who triggered the notification
  fromUserId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  // Type of notification
  type: { 
    type: String, 
    required: true,
    enum: ['like', 'comment', 'reply', 'follow', 'post_rating', 'mention'],
    index: true
  },
  // Related content references
  postId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Post" 
  },
  commentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Comment" 
  },
  // Notification content
  title: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  // Read status
  isRead: { 
    type: Boolean, 
    default: false,
    index: true 
  },
  // Additional data (JSON format for flexibility)
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for better performance
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ type: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);
