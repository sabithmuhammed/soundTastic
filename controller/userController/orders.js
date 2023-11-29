const User = require("../../model/userModel");
const Cart = require("../../model/cartModel");
const Product = require("../../model/productModel");
const Order = require("../../model/orderModel");
const cartUtils = require("../../utilities/cartUtilities");

const showCheckout = async (req, res) => {
  try {
    const { user, userId } = req.session;
    const { address, defaultAddress } = await User.findById(
      { _id: userId },
      {
        address: 1,
        _id: 0,
        defaultAddress: 1,
      }
    );
    const cart = await Cart.findOne({ userId })
      .populate({
        path: "items.productId",
        select: "name price",
      })
      .exec();
    const cartCount = cart.items.length;
    res.render("user/checkout", {
      user,
      address,
      cart,
      cartCount,
      defaultAddress,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const placeOrder = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { addressId, coupon, payment } = req.body;
    const { wallet, address } = await User.findById(
      { _id: userId },
      { wallet: 1, address: { $elemMatch: { _id: addressId } } }
    );
    const { items, totalPrice: totalAmount } = await Cart.findOne({
      userId,
    }).populate({
      path: "items.productId",
      select: "price",
    });
    const products = [];
    let finalAmout = totalAmount;
    let walletUsed = 0;
    let walletAmount = wallet.balance;
    items.forEach((element) => {
      products.push({
        productId: element.productId._id,
        unitPrice: element.productId.price,
        quantity: element.quantity,
      });
    });
    if (walletAmount !== 0) {
      if (walletAmount < parseFloat(totalAmount)) {
        finalAmout = totalAmount - walletAmount;
        walletUsed = walletAmount;
        walletAmount = 0;
      } else {
        finalAmout = 0;
        walletAmount = walletAmount - totalAmount;
        walletUsed = wallet.balance - walletAmount;
      }
    }
    const orderObj = {
      userId,
      address: address[0],
      products,
      totalAmount,
      finalAmout,
      orderDate: Date.now(),
      walletUsed,
      payment,
      status: "Pending",
    };
    const order = await new Order(orderObj).save();
    if (order) {
      products.forEach(async (element) => {
        await Product.findByIdAndUpdate(
          { _id: element.productId },
          { $inc: { quantity: element.quantity } }
        );
      });
      if (walletUsed) {
        await User.findByIdAndUpdate(
          { _id: userId },
          {
            $set: {
              "wallet.balance": walletAmount,
            },
            $push: {
              "wallet.history": {
                amount: walletUsed,
                type: "debit",
                date: Date.now(),
                details: `Ordered ${products.length} item(s)`,
              },
            },
          }
        );
      }
      await Cart.findOneAndDelete({ userId });
      return res.status(200).json({ status: "success" });
    }
    return res.status(500).json({
      error: "Inrernal Server Error",
      message: "An unexpected error occured in server! please try again",
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      error: "Inrernal Server Error",
      message: "An unexpected error occured in server! please try again",
    });
  }
};

const showOrders = async (req, res) => {
  try {
    const { userId, user } = req.session;
    const cartCount = await cartUtils.getCartCount(userId);
    const orders = await Order.find({ userId }).sort({_id:-1}).populate({
      path: "products.productId",
      select: "name",
    }).exec();
    res.render("user/orders", { orders, user, cartCount });
  } catch (error) {
    console.log(error.message);
  }
};

const showOrderDetails = async (req,res)=>{
  try {
    res.render('user/orderDetails')


  } catch (error) {
    console.log(error.message);
    
  }
}

module.exports = {
  showCheckout,
  placeOrder,
  showOrders,
  showOrderDetails,
  
};
