const Cart = require("../../model/cartModel");
const Product = require("../../model/productModel");

const showCart = async (req, res) => {
  try {
    res.render("user/cart");
  } catch (error) {
    console.log(error.message);
  }
};

const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const userCart = await Cart.findOne({ userId: req.session.userId });
    if (userCart) {
      const exist = userCart.items.some((item) => {
        return item.productId === productId;
      });
      if (exist) {
        res
          .status(200)
          .json({ staus: "failed", message: "Item already in the cart" });
      } else {
        const updatedCart = await Cart.findOneAndUpdate(
          { userId: req.session.userId },
          {
            $push: {
              items: productId,
            },
          },
          { new: true }
        );
        if (updatedCart) {
          const count = updatedCart.items.length;
          res
            .status(200)
            .json({ status: "success", count, message: "Item added to cart" });
        }
      }
    } else {
      const product = await Product.findById({ _id: productId });

      const newCart = new Cart({
        userId: req.session.userId,
        items: [{ productId, quantity: 1 }],
        totalPrice: product.price,
      });
      const cartSave = await newCart.save();

      if (cartSave) {
        res
          .status(201)
          .json({ status: "success", count, message: "Item added to cart" });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  showCart,
  addToCart,
};
