const Order = require("../model/orderModel");
const Product = require("../model/productModel");

const deletePendingingOrders = async () => {
  const time = new Date(Date.now() - 13000 * 60);
  const pendingOrders = await Order.find({
    payment: "ONLINE",
    paymentStatus: "Unpaid",
    orderDate: {
      $lt: time,
    },
  });
  const deletedOrders = await Order.deleteMany({
    payment: "ONLINE",
    paymentStatus: "Unpaid",
    orderDate: {
      $lt: time,
    },
  });
  const productsArray = pendingOrders.map((item)=>{
    return item.products
  })
  const products = productsArray.flat()
  products.forEach(async item=>{
    await Product.findByIdAndUpdate({_id:item.productId},{$inc:{quantity:item.quantity}})
    
  })
  console.log("Removed Pending Online Orders"); 
};
module.exports = deletePendingingOrders
