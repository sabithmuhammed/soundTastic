const Order = require("../../model/orderModel");
const Product = require("../../model/productModel");
const User = require("../../model/userModel");
const ReturnRequest = require("../../model/returnModel");


const showOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ _id: -1 })
      .populate({ path: "userId", select: "name" });
    res.render("admin/orders", { orders });
  } catch (error) {
    console.log(error.message);
  }
};

const showManageOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById({ _id: orderId }).populate({
      path: "userId products.productId",
      select: "name images",
    });
    res.render("admin/manageOrder", { order });
  } catch (error) {
    console.log(error.message);
  }
};



const changeStatus = async (req,res)=>{
    try {
        const {orderId,status}=req.body;
        const updatedOrder =await Order.findByIdAndUpdate({_id:orderId},{$set:{status}},{new:true})
        if(updatedOrder){
            res.status(200).json({status:"success",orderStatus:updatedOrder.status})
        }

    } catch (error) {
    console.log(error.message);
        
    }
}

const showReturnRequests=async(req,res)=>{
  try {
    const requests = await ReturnRequest.find().populate({
      path:"productId orderId",
      select:"invoiceNo orderDate name"
    })
    return res.render('admin/returnRequests',{requests})
  } catch (error) {
    
  }
}

module.exports = {
  showOrders,
  showManageOrder,
  changeStatus,
  showReturnRequests,

};
