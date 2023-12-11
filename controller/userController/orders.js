const User = require("../../model/userModel");
const Cart = require("../../model/cartModel");
const Product = require("../../model/productModel");
const Order = require("../../model/orderModel");
const Coupon = require("../../model/couponModel");
const CancelRequest = require("../../model/cancelModel");
const cartUtils = require("../../utilities/cartUtilities");
const wishUtils = require("../../utilities/wishlistUtilities");
const {
  onlinePayment,
  verifyPayment,
} = require("../../services/onlinePayment");
const generateInvoiceNumber = require("../../services/invoiceNumber");

const showCheckout = async (req, res) => {
  try {
    const { user, userId } = req.session;
    const { address, defaultAddress, wallet } = await User.findById(
      { _id: userId },
      {
        address: 1,
        _id: 0,
        defaultAddress: 1,
        wallet: 1,
      }
    );
    const cart = await Cart.findOne({ userId })
      .populate({
        path: "items.productId",
        select: "name price",
      })
      .exec();
    const cartCount = cart?.items?.length;
    const walletAmount = Number(wallet.balance);
    const { wishlistCount } = await wishUtils.wishlistDetails(userId);
    res.render("user/checkout", {
      user,
      address,
      cart,
      cartCount,
      defaultAddress,
      walletAmount,
      wishlistCount,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const placeOrder = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { addressId, coupon, payment, useWallet } = req.body;
    const { wallet, address, name, email, phone } = await User.findById(
      { _id: userId },
      {
        wallet: 1,
        address: {
          $elemMatch: { _id: addressId },
          name: 1,
          email: 1,
          phone: 1,
        },
      }
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
    //coupon
    const couponCheck = await Coupon.findOne({ code: coupon });
    if (couponCheck) {
      finalAmount -= couponCheck.discountAmount;
      await Coupon.findByIdAndUpdate(
        { _id: couponCheck._id },
        {
          $push: {
            usersUsed: userId,
          },
        }
      );
    }

    // for using wallet amount
    if (useWallet) {
      if (walletAmount !== 0) {
        if (walletAmount < parseFloat(totalAmount)) {
          finalAmount = finalAmount - walletAmount;
          walletUsed = walletAmount;
          walletAmount = 0;
        } else {
          walletAmount = walletAmount - finalAmount;
          walletUsed = wallet.balance - walletAmount;
          finalAmount = 0;
        }
      }
    }
    const invoiceNo = generateInvoiceNumber();
    const orderObj = {
      userId,
      address: address[0],
      invoiceNo,
      products,
      coupon: couponCheck?._id,
      totalAmount,
      finalAmount,
      orderDate: Date.now(),
      walletUsed,
      payment,
      status: "Pending",
      paymentStatus: "Unpaid",
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

      if (payment === "ONLINE") {
        const userData = {
          name,
          email,
          phone,
        };
        const paymentOrder = await onlinePayment(finalAmount, invoiceNo);
        return res
          .status(200)
          .json({ status: "pending", order: paymentOrder, userData });
      }

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

const showOrderSuccess = async (req, res) => {
  try {
    const { userId, user } = req.session;
    const cartCount = await cartUtils.getCartCount(userId);
    const { wishlistCount } = await wishUtils.wishlistDetails(userId);
    res.render("user/orderSuccess", { user, cartCount, wishlistCount });
  } catch (error) {
    console.log(error.message);
  }
};

const showOrders = async (req, res) => {
  try {
    const { userId, user } = req.session;
    const cartCount = await cartUtils.getCartCount(userId);
    const orders = await Order.find({ userId })
      .sort({ _id: -1 })
      .populate({
        path: "products.productId",
        select: "name",
      })
      .exec();
    const { wishlistCount } = await wishUtils.wishlistDetails(userId);
    res.render("user/orders", { orders, user, cartCount, wishlistCount });
  } catch (error) {
    console.log(error.message);
  }
};

const showOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { user, userId } = req.session;
    const cartCount = await cartUtils.getCartCount(userId);
    const { wishlistCount } = await wishUtils.wishlistDetails(userId);
    const order = await Order.findById({ _id: orderId })
      .populate({
        path: "products.productId coupon",
        select: "name images discountAmount",
      })
      .exec();
    res.render("user/orderDetails", { order, user, cartCount, wishlistCount });
  } catch (error) {
    console.log(error.message);
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { productId, orderId, reason } = req.body;
    const data = await Order.findByIdAndUpdate({
      _id: orderId,
      products: {
        $elemMatch: {
          productId: productId,
        },
      },
    });
    console.log(data);
    console.log(productId, orderId, reason);
    const canceledOrder = await Order.findOneAndUpdate(
      {
        _id: orderId,
        products: {
          $elemMatch: {
            productId: productId,
          },
        },
      },
      {
        $set: {
          "products.$.cancel.status": "Canceled",
          "products.$.cancel.reason": reason,
          "products.$.cancel.date": Date.now(),
        },
      },
      { new: true }
    ).populate({ path: "coupon", select: "discountAmount minimumSpend" });
    if (canceledOrder) {
      const prodDetails = canceledOrder.products.find((item) => {
        return item.productId.equals(productId);
      });
      console.log(prodDetails);
      await Product.findByIdAndUpdate(
        { _id: prodDetails.productId },
        {
          $inc: {
            quantity: prodDetails.quantity,
          },
        }
      );
      let refund = 0;
      let finalAmount = Number(canceledOrder.finalAmount);
      let wallet = canceledOrder.walletUsed
      let couponUpdate = canceledOrder.coupon?._id;
      if (!Number(canceledOrder.walletUsed) && !canceledOrder.coupon) {
        if (canceledOrder.payment === "ONLINE") {
          refund = prodDetails.unitPrice * prodDetails.quantity;
        }
        finalAmount -= prodDetails.unitPrice * prodDetails.quantity;
        console.log(finalAmount, "condition");
      }
      if (canceledOrder.coupon && !Number(canceledOrder.walletUsed)) {
        const coupon = canceledOrder.coupon;
        let temp = finalAmount + Number(coupon.discountAmount);
        temp -= Number(prodDetails.unitPrice) * prodDetails.quantity;
        if (temp >= coupon.minimumSpend) {
          if (finalAmount < prodDetails.unitPrice * prodDetails.quantity) {
            if (canceledOrder.payment === "ONLINE") {
              refund = finalAmount;
            }
            finalAmount = 0;
            await Coupon.findByIdAndUpdate(
              { _id: couponUpdate },
              {
                $pull: {
                  usersUsed: req.session.userId,
                },
              }
            );
            couponUpdate = null;
          } else {
            finalAmount -= prodDetails.unitPrice * prodDetails.quantity;
            if (canceledOrder.payment === "ONLINE") {
              refund = prodDetails.unitPrice * prodDetails.quantity;
            }
          }
        } else {
          finalAmount -=
            (prodDetails.unitPrice * prodDetails.quantity -
            coupon.discountAmount);
          if (canceledOrder.payment === "ONLINE") {
            refund =
              prodDetails.unitPrice * prodDetails.quantity -
              coupon.discountAmount;
          }
          await Coupon.findByIdAndUpdate(
            { _id: couponUpdate },
            {
              $pull: {
                usersUsed: req.session.userId,
              },
            }
          );
          couponUpdate = null;
        }
      }

      if(!canceledOrder.coupon && Number(canceledOrder.walletUsed)){
        if(canceledOrder.walletUsed >= prodDetails.unitPrice * prodDetails.quantity){
         wallet -= prodDetails.unitPrice * prodDetails.quantity
         refund=prodDetails.unitPrice * prodDetails.quantity
        }else{
          if (canceledOrder.payment === "ONLINE") {
            refund = prodDetails.unitPrice * prodDetails.quantity;
          }else{
            refund=wallet
          }
          finalAmount=(finalAmount + Number(wallet)) - (prodDetails.unitPrice * prodDetails.quantity)
          wallet =0;
        }
        if(finalAmount<0){
          finalAmount=0
        }
      }
////////////

      if (canceledOrder.coupon && Number(canceledOrder.walletUsed)) {
        const coupon = canceledOrder.coupon;
        let temp = finalAmount +Number(wallet)+ Number(coupon.discountAmount);
        temp -= Number(prodDetails.unitPrice) * prodDetails.quantity;
        if (temp >= coupon.minimumSpend) {
          if (finalAmount < prodDetails.unitPrice * prodDetails.quantity) {
            await Coupon.findByIdAndUpdate(
              { _id: couponUpdate },
              {
                $pull: {
                  usersUsed: req.session.userId,
                },
              }
            );
            couponUpdate = null;
            if(canceledOrder.walletUsed >= prodDetails.unitPrice * prodDetails.quantity){
              wallet -= prodDetails.unitPrice * prodDetails.quantity
              refund=prodDetails.unitPrice * prodDetails.quantity
             }else{
               if (canceledOrder.payment === "ONLINE") {
                 refund = prodDetails.unitPrice * prodDetails.quantity;
               }else{
                 refund=wallet
               }
               finalAmount=(finalAmount + Number(wallet)) - (prodDetails.unitPrice * prodDetails.quantity)
               wallet =0;
             }
          } else {
            if(canceledOrder.walletUsed >= prodDetails.unitPrice * prodDetails.quantity){
              wallet -= prodDetails.unitPrice * prodDetails.quantity
              refund=prodDetails.unitPrice * prodDetails.quantity
             }else{
               if (canceledOrder.payment === "ONLINE") {
                 refund = prodDetails.unitPrice * prodDetails.quantity;
               }else{
                 refund=wallet
               }
               finalAmount=(finalAmount + Number(wallet)) - (prodDetails.unitPrice * prodDetails.quantity)
               wallet =0;
             }
          }
        } else {
          finalAmount -=
            (prodDetails.unitPrice * prodDetails.quantity -
            coupon.discountAmount);
          await Coupon.findByIdAndUpdate(
            { _id: couponUpdate },
            {
              $pull: {
                usersUsed: req.session.userId,
              },
            }
          );
          couponUpdate = null;
        }

        if(canceledOrder.walletUsed >= prodDetails.unitPrice * prodDetails.quantity-coupon.discountAmount){
          wallet -= prodDetails.unitPrice * prodDetails.quantity - coupon.discountAmount;
          refund=prodDetails.unitPrice * prodDetails.quantity - coupon.discountAmount
         }else{
           if (canceledOrder.payment === "ONLINE") {
             refund = prodDetails.unitPrice * prodDetails.quantity - coupon.discountAmount;
           }else{
             refund=wallet - coupon.discountAmount
           }
           finalAmount=(finalAmount + Number(wallet)) - (prodDetails.unitPrice * prodDetails.quantity)- coupon.discountAmount
           wallet =0;
         }
      }

      const status = canceledOrder.products.every((item) => {
        return item.cancel?.status;
      })
        ? "Canceled"
        : canceledOrder.status;
      

      await Order.findByIdAndUpdate(
        { _id: orderId },
        { $set: { finalAmount: finalAmount, coupon: couponUpdate,walletUsed:wallet,status } }
      );

      if (refund) {
        const { userId } = req.session;
        await User.findByIdAndUpdate(
          { _id: userId },
          {
            $inc: { "wallet.balance": refund },
            $push: {
              "wallet.history": {
                amount: refund,
                type: "Credit",
                date: Date.now(),
                details: `Refund for canceled order`,
              },
            },
          }
        );
      }
      return res
        .status(200)
        .json({ status: "success", finalAmount, couponUpdate,wallet });
    }
    return res.status(404).json({ status: "failed", message: "Not found" });
  } catch (error) {
    console.log(error.message);
  }
};

const verifyOnlinePayment = async (req, res) => {
  try {
    const { details, order } = req.body;
    if (await verifyPayment(details)) {
      const orderStatus = await Order.findOneAndUpdate(
        { invoiceNo: order.receipt },
        { paymentStatus: "Paid" },
        { new: true }
      );
      console.log(orderStatus, order);
      res.status(200).json({ status: "success" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({ listed: 1 });
    res.status(200).json({ status: "success", coupons });
  } catch (error) {
    console.log(error.message);
  }
};
const verifyCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const couponCheck = await Coupon.findOne({ code });
    if (!couponCheck) {
      return res.status(404).json({ message: "Invalid coupon code" });
    }
    const used = couponCheck.usersUsed.includes(req.session.userId);
    if (used) {
      return res
        .status(422)
        .json({ error: "unavailable", message: "Coupon already used" });
    }
    const curDate = Date.now();
    if (
      couponCheck.validFrom.getTime() > curDate ||
      couponCheck.expiry.getTime() < curDate
    ) {
      console.log("date problem");
      return res.status(422).json({
        error: "unavailable",
        message: "Coupon is currently unavailable",
      });
    }
    const couponData = {
      discount: Number(couponCheck.discountAmount),
      minimum: Number(couponCheck.minimumSpend),
      code: couponCheck.code,
    };
    res.status(200).json({ status: "success", couponData });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  showCheckout,
  placeOrder,
  showOrderSuccess,
  showOrders,
  showOrderDetails,
  cancelOrder,
  verifyOnlinePayment,
  getCoupons,
  verifyCoupon,
};
