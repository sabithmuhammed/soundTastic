const Cart = require("../model/cartModel");

const getCartCount = async (userId) => {
  try {
    const cart = await Cart.findOne({ userId });
    if(cart){
        return cart.items.length;
    }
    return null;
    
  } catch (error) {
    console.log(error.message);
  }
};


module.exports={
    getCartCount
}
