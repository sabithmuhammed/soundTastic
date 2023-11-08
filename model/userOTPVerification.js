const mongoose = require("mongoose");

const OTPSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  email:{
    type:String,
    required:true
  }
});

module.exports = mongoose.model("userOTP", OTPSchema);
