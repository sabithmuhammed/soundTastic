const Razorpay = require("razorpay");
const crypto = require("crypto");
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;
var instance = new Razorpay({
  key_id: RAZORPAY_ID_KEY,
  key_secret: RAZORPAY_SECRET_KEY,
});

const onlinePayment = async (amount,invoiceNo) => {
  var options = {
    amount: amount * 100, // amount in the smallest currency unit
    currency: "INR",
    receipt: invoiceNo,
  };
  return instance.orders.create(options);
};

const verifyPayment = async (details) => {
  let hmac = crypto.createHmac("sha256", RAZORPAY_SECRET_KEY);
  hmac.update(details.razorpay_order_id + "|" + details.razorpay_payment_id);
  hmac = hmac.digest("hex");
  if (hmac === details.razorpay_signature) {
    return true;
  } else {
    return false;
  }
};

module.exports = { onlinePayment, verifyPayment };
