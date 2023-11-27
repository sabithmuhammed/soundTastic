const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  verified: {
    type: Boolean,
    required: true,
    default: false,
  },
  blocked: {
    type: Number,
    required: true,
    default: 0,
  },
  defaultAddress: {
    type: mongoose.Types.ObjectId,
    default: null,
  },
  address: [
    {
      name: { type: String, required: true },
      mobile: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, required: true },
      pincode: { type: String, required: true },
      state: { type: String, required: true },
    },
  ],
  wallet: {
    balance: {
      type: mongoose.Types.Decimal128,
      required: true,
      default: 0,
    },
    history: [
      {
        amount: {
          type: mongoose.Types.Decimal128,
        },
        type: {
          type: String,
        },
        date: {
          type: Date,
        },
        details: {
          type: String,
        },
      },
    ],
  },
});

module.exports = mongoose.model("user", userSchema);
