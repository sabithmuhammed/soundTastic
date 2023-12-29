const Order = require("../../model/orderModel");
const Product = require("../../model/productModel");
const User = require("../../model/userModel");
const ReturnRequest = require("../../model/returnModel");
const Coupon = require("../../model/couponModel");

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
      path: "userId products.productId coupon",
      select: "name images discountAmount",
    });
    res.render("admin/manageOrder", { order });
  } catch (error) {
    console.log(error.message);
  }
};

const changeStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    console.log(status);
    const updateObj = { status };
    if (status === "Delivered") {
      updateObj.paymentStatus = "Paid";
    }
    const updatedOrder = await Order.findByIdAndUpdate(
      { _id: orderId },
      { $set: updateObj },
      { new: true }
    );
    if (updatedOrder) {
      res
        .status(200)
        .json({ status: "success", orderStatus: updatedOrder.status });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const showReturnRequests = async (req, res) => {
  try {
    const requests = await ReturnRequest.find().populate({
      path: "productId orderId",
      select: "invoiceNo orderDate name",
    });
    return res.render("admin/returnRequests", { requests });
  } catch (error) {
    console.log(error.message);
  }
};

const acceptReturn = async (req, res) => {
  try {
    const { reqId } = req.body;
    const { orderId, productId, reason, userId } =
      await ReturnRequest.findByIdAndDelete(reqId);

    let { products, walletUsed, coupon, finalAmount } =
      await Order.findOneAndUpdate(
        { _id: orderId, "products.productId": productId },
        {
          $set: {
            "products.$.return": {
              status: "Returned",
              reason,
              date: Date.now(),
            },
          },
        },
        {
          new: true,
        }
      );

    const product = products.find((item) => {
      return item.productId.equals(productId);
    });

    if (reason !== "Defective" || reason !== "Damaged") {
      await Product.findByIdAndUpdate(
        { _id: product.productId },
        {
          $inc: {
            quantity: product.quantity,
          },
        }
      );
    }
    let refund = 0;
    let prodPrice = product.quantity * product.unitPrice;
    if (!coupon) {
      refund = prodPrice;
      if (prodPrice >= walletUsed) {
        walletUsed = 0;
        prodPrice = prodPrice - walletUsed;
      }
      finalAmount = finalAmount - prodPrice;
    }
    if (coupon) {
      const { discountAmount, minimumSpend } = await Coupon.findById(coupon);
      let total =
        Number(walletUsed) + Number(finalAmount) + Number(discountAmount);
      if (Number(minimumSpend) <= total - prodPrice) {
        refund = prodPrice;
        if (prodPrice >= walletUsed) {
          walletUsed = 0;
          prodPrice = prodPrice - walletUsed;
        }
        finalAmount = finalAmount - prodPrice;
      } else {
        refund = prodPrice - discountAmount;
        prodPrice = prodPrice - discountAmount;
        if (prodPrice >= walletUsed) {
          walletUsed = 0;
        }
        finalAmount = finalAmount - prodPrice;
        await Coupon.findByIdAndUpdate(
          { _id: coupon },
          {
            $pull: {
              usersUsed: userId,
            },
          }
        );
        coupon = null;
      }
    }
    finalAmount = finalAmount < 0 ? 0 : finalAmount;
    await Order.findByIdAndUpdate(
      { _id: orderId },
      {
        $set: {
          finalAmount,
          walletUsed,
          coupon,
        },
      }
    );
    
    await User.findByIdAndUpdate(
      { _id: userId },
      {
        $inc: {
          "wallet.balance": refund,
        },
        $push: {
          "wallet.history": {
            amount: refund,
            type: "Credit",
            date: Date.now(),
            details: "Refund for returned product",
          },
        },
      }
    );

    res.status(204).send();
  } catch (error) {
    console.log(error.message);
  }
};

const rejectReturn = async (req, res) => {
  try {
    const { reqId } = req.body;
    await ReturnRequest.findByIdAndDelete(reqId);
    res.status(204).send();
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  showOrders,
  showManageOrder,
  changeStatus,
  showReturnRequests,
  acceptReturn,
  rejectReturn,
};
