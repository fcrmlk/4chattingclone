let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let userStatusSchema = new Schema({

  posted_year: {
    type: String,
    required: true
  },
  posted_month: {
    type: String,
    required: true
  },
  posted_date: {
      type: String,
    required: true
  },
  status_image_count: {
      type: Number,
      default: 0
    },
  status_video_count: {
      type: Number,
      default: 0
    },
  
});
module.exports = mongoose.model("Userstatus", userStatusSchema);
