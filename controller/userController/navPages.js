const Category = require("../../model/categoryModel");
const Product = require("../../model/productModel");
const Wishlist = require("../../model/wishlistModel");
const cartUtils = require("../../utilities/cartUtilities");
const wishUtils = require("../../utilities/wishlistUtilities");

const home = async (req, res) => {
  res.redirect("/home");
};
const loadHome = async (req, res) => {
  try {
    const user = req.session.userId ? req.session.user : null;
    const userId = req.session.userId;
    const products = await Product.find({ listed: 1 })
      .limit(4)
      .populate("category")
      .exec();
    const { wishlist, wishlistCount } = await wishUtils.wishlistDetails(userId);
    const cartCount = await cartUtils.getCartCount(userId);
    if (products) {
      res.render("user/home", {
        products,
        user,
        cartCount,
        wishlist,
        wishlistCount,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const showShop = async (req, res) => {
  try {
    const user = req.session.user ?? null;
    const userId = req.session.userId;
    let search = "";
    if (req.query.search) {
      search = req.query.search;
    }
    const dbQuery = {
      listed: 1,
      $or: [
        {
          name: { $regex: ".*" + search + ".*", $options: "i" },
        },
        {
          description: { $regex: ".*" + search + ".*", $options: "i" },
        },
        {
          brand: { $regex: ".*" + search + ".*", $options: "i" },
        },
      ],
    };
    let category = "";
    if (req.query.category) {
      const catDetails = await Category.findOne({ name: req.query.category });
      if (catDetails) {
        category = catDetails.name;
        dbQuery.category = catDetails._id;
      }
    }
    let sort = "1";
    if (req.query.sort) {
      sort = req.query.sort;
    }

    const categories = await Category.find();

    const PAGE_SIZE = 8;
    const page = parseInt(req.query.page) || 1;
    const totalCount = await Product.countDocuments(dbQuery);
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    const products = await Product.find(dbQuery)
      .sort({ price: sort })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .populate("category")
      .exec();
    const { wishlist, wishlistCount } = await wishUtils.wishlistDetails(userId);
    const cartCount = await cartUtils.getCartCount(userId);
    res.render("user/shop", {
      products,
      user,
      page,
      totalPages,
      search,
      category,
      cartCount,
      wishlist,
      wishlistCount,
      categories,
      sort,
    });
  } catch (error) {
    console.log(error);
  }
};

const showProductPage = async (req, res) => {
  try {
    const user = req.session.userId ? req.session.user : null;
    const id = req.params.id;
    const userId = req.session.userId;
    const product = await Product.findById({ _id: id });
    const cartCount = await cartUtils.getCartCount(req.session.userId);
    if (product) {
      const stock = {};
      if (product.quantity === 0) {
        stock.lowStock = true;
        stock.status = "Out of stock";
      } else if (product.quantity <= 5) {
        stock.lowStock = true;
        stock.status = `Only ${product.quantity} left`;
      } else {
        stock.lowStock = false;
        stock.status = "In stock";
      }
      const { wishlist, wishlistCount } = await wishUtils.wishlistDetails(
        userId
      );
      res.render("user/productPage", {
        product,
        stock,
        user,
        cartCount,
        wishlist,
        wishlistCount,
      });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const showUserBlock = async (req, res) => {
  try {
    res.render("user/userBlocked");
  } catch (error) {
    console.log(error.message);
  }
};

const showWishlist = async (req, res) => {
  try {
    const { user, userId } = req.session;
    const cartCount = await cartUtils.getCartCount(userId);
    const wishlist = await Wishlist.findOne({ userId })
      .populate("products")
      .exec();
    const wishlistCount = wishlist?.products?.length;

    res.render("user/wishlist", { user, wishlistCount, cartCount, wishlist });
  } catch (error) {
    console.log(error.message);
  }
};

const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const { userId } = req.session;
    const checkWishlist = await Wishlist.findOne({ userId });
    if (!checkWishlist) {
      const newWishlist = await new Wishlist({
        userId,
        products: [productId],
      }).save();
      return res.status(200).json({ status: "success", wishlistCount: 1 });
    }

    const exist = checkWishlist.products.find((product) => {
      return product.equals(productId);
    });
    if (exist) {
      return res.status(200).json({
        status: "success",
        wishlistCount: checkWishlist.products.length,
      });
    }
    const updatedWishList = await Wishlist.findOneAndUpdate(
      { userId: req.session.userId },
      {
        $push: {
          products: productId,
        },
      },
      { new: true }
    );
    return res.status(200).json({
      status: "success",
      wishlistCount: updatedWishList.products.length,
    });
  } catch (error) {
    console.log(error.message);
  }
};
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const { userId } = req.session;
    const updatedWishList = await Wishlist.findOneAndUpdate(
      { userId },
      {
        $pull: {
          products: productId,
        },
      },
      { new: true }
    );

    return res.status(200).json({
      status: "success",
      wishlistCount: updatedWishList.products.length,
    });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadHome,
  showShop,
  showProductPage,
  home,
  showUserBlock,
  showWishlist,
  addToWishlist,
  removeFromWishlist,
};
