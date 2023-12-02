const Cart = require("../../model/cartModel");
const Product = require("../../model/productModel");
const cartUtils = require("../../utilities/cartUtilities");
const wishUtils = require("../../utilities/wishlistUtilities");

const showCart = async (req, res) => {
  try {
    const user = req.session.user;
    const userId=req.session.userId
    const cartItems = await Cart.findOne({ userId })
      .populate({
        path: "items.productId",
        select: "name price quantity images",
      })
      .exec();
    const { wishlistCount } = await wishUtils.wishlistDetails(userId);
    const cartCount = await cartUtils.getCartCount(userId);

    res.render("user/cart", { cartItems, user, cartCount,wishlistCount });
  } catch (error) {
    console.log(error.message);
  }
};

const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await Product.findById({ _id: productId });
    //checking if product with this id exist or not
    if (!product) {
      return res.status(404).json({
        status: "failed",
        message: "Product not found",
      });
    }
    // checking product is listed or not
    if (product.listed === 0) {
      return res.status(400).json({
        status: "failed",
        message: "Product currently unavailable",
      });
    }
    //checking product stock is grater than 0
    if (!product.quantity > 0) {
      return res.status(400).json({
        status: "failed",
        message: "Product currently out of stock",
      });
    }
    const userCart = await Cart.findOne({ userId: req.session.userId });
    // create new cart if user doesn't have a cart
    if (!userCart) {
      const newCart = new Cart({
        userId: req.session.userId,
        items: [{ productId, quantity: 1 }],
        totalPrice: product.price,
      });
      const cartSave = await newCart.save();

      if (cartSave) {
        const count = cartSave.items.length;
        return res
          .status(201)
          .json({ status: "success", count, message: "Item added to cart" });
      }
    }
    const exist = userCart.items.find((item) => {
      return item.productId.equals(productId);
    });
    console.log(exist);
    // adding product to the cart if that product is not already in cart
    if (!exist) {
      const updatedCart = await Cart.findOneAndUpdate(
        { userId: req.session.userId },
        {
          $push: {
            items: { productId, quantity: 1 },
          },
          $inc: {
            totalPrice: product.price,
          },
        },
        { new: true }
      );
      if (updatedCart) {
        const count = updatedCart.items.length;
        return res
          .status(200)
          .json({ status: "success", count, message: "Item added to cart" });
      }
    }
    // product already in cart
    return res
      .status(409)
      .json({ status: "failed", message: "Item already in the cart" });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      error: "Inrernal Server Error",
      message: "An unexpected error occured in server! please try again",
    });
  }
};

const changeQuantity = async (req, res) => {
  try {
    const { productId, operation, curQuantity } = req.body;
    const productDetails = await Product.findById({ _id: productId });
    if (!productDetails) {
      return res
        .status(404)
        .json({ status: "failed", message: "product not found" });
    }
    if (productDetails.quantity <= curQuantity && operation === 1) {
      return res
        .status(422)
        .json({ status: "failed", message: "Stock unavailable" });
    }
    const updatedCart = await Cart.findOneAndUpdate(
      {
        userId: req.session.userId,
        "items.productId": productId,
      },
      {
        $inc: {
          "items.$.quantity": operation,
          totalPrice: productDetails.price * operation,
        },
      },
      { new: true }
    );
    if (updatedCart) {
      const product = updatedCart.items.find((item) => {
        return item.productId.equals(productId);
      });
      const data = {
        product,
        total: parseFloat(updatedCart.totalPrice),
        price: productDetails.price * product.quantity,
      };
      return res.status(200).json({ status: "success", data });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      error: "Inrernal Server Error",
      message: "An unexpected error occured in server! please try again",
    });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const product = await Product.findById({ _id: productId });
    const reduceTotal = product.price * quantity;
    const updatedCart = await Cart.findOneAndUpdate(
      { userId: req.session.userId },
      {
        $pull: {
          items: {
            productId,
          },
        },
        $inc: {
          totalPrice: -reduceTotal,
        },
      },
      {
        new: true,
      }
    );
    const data = {
      items: updatedCart.items.length,
      total: updatedCart.totalPrice,
    };

    res.status(200).json({ status: "success", data });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      error: "Inrernal Server Error",
      message: "An unexpected error occured in server! please try again",
    });
  }
};

const checkStock = async (req, res) => {
  try {
    const { userId } = req.session;
    const cart = await Cart.findOne({ userId })
      .populate({
        path: "items.productId",
        select: "name quantity listed",
      })
      .exec();
    if (!cart) {
      return res
        .status(404)
        .json({ status: "failed", message: "Cart not found" });
    }
    const data = [];
    cart.items.forEach((item) => {
      const product = item.productId;
      if (!product.listed) {
        return data.push({ name: product.name, stock: 0 });
      }
      if (item.quantity > product.quantity) {
        return data.push({ name: product.name, stock: product.quantity });
      }
    });

    res.status(200).json({ status: "success", data });
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Inrernal Server Error",
        message: "An unexpected error occured in server! please try again",
      });

    console.log(error.message);
  }
};


module.exports = {
  showCart,
  addToCart,
  changeQuantity,
  removeFromCart,
  checkStock,

};
