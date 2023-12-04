const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true },
  validFrom: { type: Date, required: true },
  expiry: { type: Date, required: true },
  discountAmount: { type: mongoose.Types.Decimal128, required: true },
  minimumSpend: { type: mongoose.Types.Decimal128, required: true },
  usersUsed: [
    {
      type: mongoose.Types.ObjectId,
      ref: "user",
    },
  ],
  listed:{type:Number,required:true,default:1}
});

module.exports = mongoose.model("coupon", couponSchema);
