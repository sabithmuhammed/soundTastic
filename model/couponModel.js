const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  valifFrom: { type: Date, required: true },
  expiry: { type: Date, required: true },
  discountAmount: { type: mongoose.Types.Decimal128, required: true },
  minimumSpend: { type: mongoose.Types.Decimal128, required: true },
  minimumSpend: { type: mongoose.Types.Decimal128, required: true },
  usersUsed: [
    {
      type: mongoose.Types.ObjectId,
      ref: "user",
    },
  ],
});

module.exports = mongoose.model("coupon", couponSchema);
