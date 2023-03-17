let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let UserdevicesSchema = new Schema({
  user_id: {
    type: String,
    required: true,
  },
  device_token: {
    type: String,
    required: true
  },
    apns_token: {
    type: String,
   
  },
  device_type: {
    type: String,
    required: true,
  },
  device_id: {
    type: String,
    unique: true,
    required: true,
  },
  onesignal_id: {
    type: String,
  },
  device_mode: {
    type: String,
  },
   unread_count: {
    type: Number,
  },
  notified_at: {
    type: String,
  },
    lang_type: {
    type: String,
  },
});

module.exports = mongoose.model('Userdevices', UserdevicesSchema);
