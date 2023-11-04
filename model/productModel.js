const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    
    name: { type: String, required: true },
    description: { type: String, required: true },
    md_price: { type: Double, required: true },
    price: { type: Double, required: true },
    category: { type: Schema.Types.ObjectId, required: true ,ref:'category'},
    images: [{ type: String, required: true,  }],
    quantity: { type: Number, required: true },
    reviews: [{
       comment: { type: String },
       rating: { type: Number },
       userId: { type: Schema.Types.ObjectId },
    }],
    listed: { type: Number, required: true ,default:1},
});

module.exports = mongoose.model("product", productSchema);