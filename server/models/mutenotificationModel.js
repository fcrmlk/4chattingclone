const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const MuteNotificationSchema = new Schema({
  user_id: {
    type: String,
    required: true
  },
  chat_id: {
    type: String,
    required: true
  },
  chat_type: {
    type: String,
    enum: ["single", "group","channel"],
    default: "single"
  },
},{timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }});


module.exports = mongoose.model('MuteNotifications', MuteNotificationSchema);