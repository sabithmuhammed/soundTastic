const User = require("../../model/userModel");
const Cart = require("../../model/cartModel");
const Product = require("../../model/productModel");
const Order = require("../../model/orderModel");
const CancelRequest = require("../../model/cancelModel");
const cartUtils = require("../../utilities/cartUtilities");
const wishUtils = require("../../utilities/wishlistUtilities");
const showCheckout = async (req, res) => {
  try {
    const { user, userId } = req.session;
    const { address, defaultAddress ,wallet} = await User.findById(
      { _id: userId },
      {
        address: 1,
        _id: 0,
        defaultAddress: 1,
        wallet:1
      }
    );
    const cart = await Cart.findOne({ userId })
      .populate({
        path: "items.productId",
        select: "name price",
      })
      .exec();
    const cartCount = cart?.items?.length;
    const walletAmount=Number(wallet.balance);
    const { wishlistCount } = await wishUtils.wishlistDetails(userId);
    res.render("user/checkout", {
      user,
      address,
      cart,
      cartCount,
      defaultAddress,
      walletAmount,
      wishlistCount
    });
  } catch (error) {
    console.log(error.message);
  }
};

const placeOrder = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { addressId, coupon, payment ,useWallet} = req.body;
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
    let finalAmount = totalAmount;
    let walletUsed = 0;
    let walletAmount = wallet.balance;
    items.forEach((element) => {
      products.push({
        productId: element.productId._id,
        unitPrice: element.productId.price,
        quantity: element.quantity,
      });
    });

    // for using wallet amount
    if(useWallet){
      if (walletAmount !== 0) {
        if (walletAmount < parseFloat(totalAmount)) {
          finalAmount = totalAmount - walletAmount;
          walletUsed = walletAmount;
          walletAmount = 0;
        } else {
          finalAmount = 0;
          walletAmount = walletAmount - totalAmount;
          walletUsed = wallet.balance - walletAmount;
        }
      }
    }
  
    const orderObj = {
      userId,
      address: address[0],
      products,
      totalAmount,
      finalAmount,
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
          { $inc: { quantity: -element.quantity } }
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
                type: "Debit",
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

const showOrderSuccess=async(req,res)=>{
  try {
    const { userId, user } = req.session;
    const cartCount = await cartUtils.getCartCount(userId);
    const { wishlistCount } = await wishUtils.wishlistDetails(userId);
    res.render('user/orderSuccess',{user,cartCount,wishlistCount})
  } catch (error) {
    console.log(error.message);
    
  }
}

const showOrders = async (req, res) => {
  try {
    const { userId, user } = req.session;
    const cartCount = await cartUtils.getCartCount(userId);
    const orders = await Order.find({ userId }).sort({_id:-1}).populate({
      path: "products.productId",
      select: "name",
    }).exec();
    const { wishlistCount } = await wishUtils.wishlistDetails(userId);
    res.render("user/orders", { orders, user, cartCount,wishlistCount });
  } catch (error) {
    console.log(error.message);
  }
};

const showOrderDetails = async (req,res)=>{
  try {
    const {orderId} = req.params;
    const { user,userId } = req.session;
    const cartCount = await cartUtils.getCartCount(userId);
    const { wishlistCount } = await wishUtils.wishlistDetails(userId);
    const order=await Order.findById({_id:orderId}).populate({path:"products.productId",select:"name images"}).exec()
    res.render('user/orderDetails',{order,user,cartCount,wishlistCount})


  } catch (error) {
    console.log(error.message);
    
  }
}

const requestCancel=async(req,res)=>{
  try {
    const {userId}=req.session;
    const {reason,orderId}=req.body
    const checkCancel=await CancelRequest.findOne({orderId});
    if(checkCancel){
     return res.status(409).json({message:"Request is proccessing, please be patient"})
    }
    const newCancelRequest = await new CancelRequest({
      orderId,
      userId,
      date:Date.now(),
      reason,
    }).save();
    if(newCancelRequest){
      res.status(200).json({status:"success",message:"Cancel request has been sent"})
    }
  } catch (error) {
    console.log(error.message);
    
  }
}


module.exports = {
  showCheckout,
  placeOrder,
  showOrderSuccess,
  showOrders,
  showOrderDetails,
  requestCancel
  
  
};
