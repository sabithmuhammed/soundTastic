const User = require("../../model/userModel");
const Product = require("../../model/productModel");
const Order = require("../../model/orderModel");
const Coupon = require("../../model/couponModel");
const ReturnRequest = require("../../model/returnModel");

const cancelOrder = async (req, res) => {
  try {
    const { productId, orderId, reason } = req.body;

    //updating order (Setting the status of canceled products to 'Canceled' )
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

    //getting details of canceled Product (amount and quantity)
    const prodDetails = canceledOrder.products.find((item) => {
      return item.productId.equals(productId);
    });

    //Re-stocking canceled product
    await Product.findByIdAndUpdate(
      { _id: prodDetails.productId },
      {
        $inc: {
          quantity: prodDetails.quantity,
        },
      }
    );
    let refund = 0;
    const payment = canceledOrder.payment;
    let walletUsed = Number(canceledOrder.walletUsed);
    let finalAmount = Number(canceledOrder.finalAmount);
    let total = walletUsed + finalAmount;
    let prodAmount = prodDetails.unitPrice * prodDetails.quantity;
    let coupon = canceledOrder.coupon;
    let couponId = canceledOrder?.coupon?._id;
    
    if (coupon) {
      const { minimumSpend, discountAmount } = coupon;
      if (total + (Number(discountAmount)-prodAmount) < Number(minimumSpend)) {
        prodAmount -= Number(discountAmount);
        await Coupon.findByIdAndUpdate(
          { _id: couponId },
          {
            $pull: {
              usersUsed: req.session.userId,
            },
          }
        );
        couponId = null;
      }
    }
    if (prodAmount <= walletUsed) {
      walletUsed = walletUsed - prodAmount;
      refund = prodAmount;
    } else {
      if (payment === "ONLINE") {
        refund = prodAmount;
      } else {
        refund = walletUsed;
      }
      finalAmount -= prodAmount - walletUsed;
      walletUsed = 0;
    }

    const status = canceledOrder.products.every((item) => {
      return item.cancel?.status;
    })
      ? "Canceled"
      : canceledOrder.status;
    await Order.findByIdAndUpdate(
      { _id: orderId },
      { $set: { finalAmount, coupon: couponId, walletUsed, status } }
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
      .json({ status: "success", finalAmount, couponId, walletUsed });
  } catch (error) {
    console.log(error.message);
  }
};
const returnRequest = async (req, res) => {
  try {
    const { productId, orderId, reason } = req.body;
    const { userId } = req.session;
    const newRequest = await ReturnRequest({
      productId,
      userId,
      orderId,
      reason,
      date: Date.now(),
    }).save();
    if (newRequest) {
      await Order.findOneAndUpdate(
        { _id: orderId, "products.productId": productId },
        {
          $set: {
            "products.$.return": {
              status: "Pending",
              reason,
              date: Date.now(),
            },
          },
        }
      );
    }
    return res.status(200).json({ status: "success" });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  cancelOrder,
  returnRequest,
};
