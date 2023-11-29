const Order = require("../../model/orderModel");

const showOrders =async (req,res)=>{
    try {
        const orders=await Order.find().sort({_id:-1}).populate({path:"userId",select:"name"});
        res.render("admin/orders",{orders})
    } catch (error) {
        console.log(error.message)
    }
}

const showManageOrder=async(req,res)=>{
    try {
        const {orderId}=req.params;
        const order=await Order.findById({_id:orderId}).populate({path:"userId products.productId",select:"name images"})
        res.render("admin/manageOrder",{order})
    } catch (error) {
        console.log(error.message)
        
    }
}

module.exports={
    showOrders,
    showManageOrder,

}