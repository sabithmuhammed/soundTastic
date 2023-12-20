const User = require("../../model/userModel");
const Product = require("../../model/productModel");
const Order = require("../../model/orderModel");
const Coupon = require("../../model/couponModel");
const ReturnRequest = require("../../model/returnModel");
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

  const returnRequest =async(req,res)=>{
    try {
      const {productId,orderId,reason}=req.body
      const {userId}=req.session
      const newRequest = await ReturnRequest({
        productId,
        userId,
        orderId,
        reason,
        date:Date.now()
      }).save()
      if(newRequest){
        await Order.findOneAndUpdate({_id:orderId,"products.productId":productId},{$set:{
          "products.$.return":{status:"Pending",reason,date:Date.now()}
        }})
      }
      return res.status(200).json({status:"success"});
    } catch (error) {
      console.log(error.message);
    }
  }

  


  module.exports={
  cancelOrder,
  returnRequest,

  }