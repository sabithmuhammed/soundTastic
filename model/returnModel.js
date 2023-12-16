const mongoose = require("mongoose");

const returnSchema = new mongoose.Schema({
  orderId: { type: mongoose.Types.ObjectId,ref:"order", required: true},
  productId:{ type: mongoose.Types.ObjectId,ref:"product", required: true},
  reason: { type: String, required: true },
  date: { type: Date, required: true},
  userId:{ type: mongoose.Types.ObjectId,ref:"user", required: true},
});

module.exports = mongoose.model("returnRequest", returnSchema);