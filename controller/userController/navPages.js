const Category = require("../../model/categoryModel");
const Product = require("../../model/productModel");
const Wishlist = require("../../model/wishlistModel");
const cartUtils = require("../../utilities/cartUtilities");

const home = async (req, res) => {
  res.redirect("/home");
};
const loadHome = async (req, res) => {
  try {
    const user = req.session.userId ? req.session.user : null;
    const products = await Product.find({ listed: 1 })
      .limit(4)
      .populate("category")
      .exec();
    const cartCount = await cartUtils.getCartCount(req.session.userId);
    if (products) {
      res.render("user/home", { products, user,cartCount });
    }
  } catch (error) {}
};

const showShop = async (req, res) => {
  try {
    const user = req.session.user ?? null;
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

    const PAGE_SIZE = 8;
    const page = parseInt(req.query.page) || 1;
    const totalCount = await Product.countDocuments(dbQuery);
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    const products = await Product.find(dbQuery)
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .populate("category")
      .exec();
    const cartCount = await cartUtils.getCartCount(req.session.userId);
    res.render("user/shop", {
      products,
      user,
      page,
      totalPages,
      search,
      category,
      cartCount,
    });
  } catch (error) {
    console.log(error);
  }
};

const showProductPage = async (req, res) => {
  try {
    const user = req.session.userId ? req.session.user : null;
    const id = req.params.id;
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
      res.render("user/productPage", { product, stock, user,cartCount });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const showUserBlock = async(req,res)=>{
  try {
    res.render('user/userBlocked');
  } catch (error) {
    console.log(error.message);
  }
}

const addToWishlist =async(req,res)=>{
  try {
    const {productId} = req.body
    const {userId}=req.session
    const checkWishlist = await Wishlist.findOne({userId})
    if(!checkWishlist){
      const newWishlist=await new Wishlist({userId,products:[productId]}).save()
      return res.status(200).json({status:"success",wishlistCount:1})
    }

    const exist = checkWishlist.products.find((product) => {
      return product.equals(productId);
    });
    if(exist){
      return res.status(200).json({status:"success",wishlistCount:checkWishlist.products.length})
    }
    const updatedWishList = await Wishlist.findOneAndUpdate(
      { userId: req.session.userId },
      {
        $push: {
          items: productId,
        },
      },
      { new: true }
    );
    return res.status(200).json({status:"success",wishlistCount:updatedWishList.products.length})
  } catch (error) {
    console.log(error.message);
    
  }
  }

module.exports = {
  loadHome,
  showShop,
  showProductPage,
  home,
  showUserBlock,
  addToWishlist,

};
