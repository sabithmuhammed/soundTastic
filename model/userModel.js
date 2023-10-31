const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true},
  name: { type: String, required: true },
  phone: { type: String, required: true},
  password: { type: String, required: true},
  address: [
    {
      address: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, required: true },
      pincode: { type: String, required: true },
      state: { type: String, required: true },
    },
  ],
});

module.exports = mongoose.model("user", userSchema);
