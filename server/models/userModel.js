let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let UserSchema = new Schema({
  user_name: {
    type: String,
  },

  user_image: {
    type: String,
  },

  phone_no: {
    type: Number,
    unique: true,
    required: true
  },

  country_code: {
    type: Number,
    required: true
  },

  country: {
    type: String,
  },


  about: {
    type: String,
  },

  privacy_last_seen: {
    type: String,
  },

  privacy_profile_image: {
    type: String,
  },

  privacy_about: {
    type: String,
  },
  token: {
    type: String
  },
  livestatus: {
    type: String /* online (or) offline */
  },
  status: {
    type: String
  },
   lastseen: {
       type: String
  },
  contactstatus: {
    type: String
  },
  join_at: {
    type: Date,
    default: Date.now
  },

  chat_image_count: {
      type: Number,
      default: 0
    },
  chat_video_count: {
      type: Number,
      default: 0
    },
  chat_audio_count: {
      type: Number,
      default: 0
    },
  chat_file_count: {
      type: Number,
      default: 0
    },
  chat_text_count: {
      type: Number,
      default: 0
    },
  chat_location_count: {
      type: Number,
      default: 0
    },
  chat_contact_count: {
      type: Number,
      default: 0
    },

  status_image_count: {
      type: Number,
      default: 0
    },
  status_video_count: {
      type: Number,
      default: 0
    },

  call_audio_count: {
      type: Number,
      default: 0
    },
  call_video_count: {
      type: Number,
      default: 0
    },

});
module.exports = mongoose.model('User', UserSchema);
