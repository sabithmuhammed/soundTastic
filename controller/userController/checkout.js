const User = require("../../model/userModel");
const Cart = require("../../model/cartModel");

const showCheckout = async (req, res) => {
  try {
    const {user,userId} = req.session;
    const {address,defaultAddress} = await User.findById(
      { _id: userId },
      {
        address: 1,_id:0,defaultAddress:1
      }
    );
    const cart = await Cart.findOne({userId}).populate({
        path:"items.productId",
        select: "name price",
    }).exec();
    const cartCount =cart.items.length
    res.render("user/checkout",{user,address,cart,cartCount,defaultAddress});
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  showCheckout,
};
