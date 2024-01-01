const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    
    name: { type: String, required: true },
    description: { type: String, required: true },
    md_price: { type: mongoose.Types.Decimal128, required: true },
    price: { type: mongoose.Types.Decimal128, required: true },
    category: { type: mongoose.Types.ObjectId, required: true ,ref:'category'},
    images: [{ type: String, required: true,  }],
    quantity: { type: Number, required: true },
    brand:{type:String,required:true},
    reviews: [{
       rating: { type: Number },
       userId: { type: mongoose.Types.ObjectId,ref:'user'},
    }],
    listed: { type: Number, required: true ,default:1},
});

module.exports = mongoose.model("product", productSchema);