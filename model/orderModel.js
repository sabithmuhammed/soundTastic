const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, required: true ,ref:"user"},
  address:{type:Object, required: true},
  products: [
    {
      productId: { type: mongoose.Types.ObjectId, ref: "product" },
      unitPrice: { type: mongoose.Types.Decimal128 },
      quantity: { type: Number },
    },
  ],
  totalAmount: { type: mongoose.Types.Decimal128 },
  finalAmount: { type: mongoose.Types.Decimal128 }, 
  orderDate: { type: Date },
  walletUsed: { type: mongoose.Types.Decimal128 },
  coupon:{ type: mongoose.Types.ObjectId, ref: "coupon" },
  payment: { type: String },
  status: { type: String },
  return: [
    {
      productId: { type: mongoose.Types.ObjectId, ref: "product" },
      quantity: { type: Number },
      reason: { type: String },
      status: { type: String },
      returnDate: { type: Date },
    },
  ],
});

module.exports = mongoose.model("order", orderSchema);
