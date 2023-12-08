const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, required: true ,ref:"user"},
  address:{type:Object, required: true},
  invoiceNo:{type:String, required: true},
  products: [
    {
      productId: { type: mongoose.Types.ObjectId, ref: "product" },
      unitPrice: { type: mongoose.Types.Decimal128 },
      quantity: { type: Number },
      cancel:{
        status:{type:String},
        reason:{type:String},
        date:{type:Date}
      },
      return:{
        status:{type:String},
        reason:{type:String},
        date:{type:Date}
      }
    },
  ],
  totalAmount: { type: mongoose.Types.Decimal128 },
  finalAmount: { type: mongoose.Types.Decimal128 }, 
  orderDate: { type: Date },
  walletUsed: { type: mongoose.Types.Decimal128 },
  coupon:{ type: mongoose.Types.ObjectId, ref: "coupon" },
  payment: { type: String },
  paymentStatus:{ type: String },
  status: { type: String },
});

module.exports = mongoose.model("order", orderSchema);
