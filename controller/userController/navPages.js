const Category = require("../../model/categoryModel");
const Product = require("../../model/productModel");

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
    if (products) {
      res.render("user/home", { products, user });
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
    res.render("user/shop", {
      products,
      user,
      page,
      totalPages,
      search,
      category,
    });
  } catch (error) {
    console.log(error);
  }
  const user = req.session.user ?? null;
  const products = await Product.find();
  res.render("user/shop", { products });
};


const showProductPage = async (req, res) => {
  try {
    const user = req.session.userId ? req.session.user : null;
    const id = req.params.id;
    const product = await Product.findById({ _id: id });
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
      res.render("user/productPage", { product, stock, user });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadHome,
  showShop,
  showProductPage,
  home,
};
