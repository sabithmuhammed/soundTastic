const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Types.ObjectId,
        ref:'user',
        required:true
    },
    items:[
        {
            productId:{
                type:mongoose.Types.ObjectId,
                ref:'product',
                required:true
            },
            quantity:{
                type:Number,
                required:true,
                default:1
            }
        }
    ],
    totalPrice:{
        type:mongoose.Types.Decimal128,
        required:true
    }
})

module.exports = mongoose.model("cart", cartSchema);
