const Admin = require("../model/adminModel");
const User = require("../model/userModel");
const Category = require("../model/categoryModel");
const Product = require("../model/productModel");
const bcrypt = require("bcrypt");
const securePassword = require("../services/securePassword");
const adminSignup = (req, res) => {
  try {
    res.render("admin/signup");
  } catch (error) {
    console.log(error.message);
  }
};

const createAdmin = async (req, res) => {
  try {
    const { password, email, name } = req.body;
    const adminCheck = await Admin.findOne({ email });
    if (adminCheck) {
      return res.render("admin/signup", {
        message: "Admin already exist",
        color: "red",
      });
    }
    const hashPassword = await securePassword(password);
    const admin = new Admin({
      name,
      email,
      isVerified: false,
      password: hashPassword,
    });
    const adminData = await admin.save();
    if (adminData) {
      res.render("admin/signup", {
        message: "Admin created successfully, Try login",
        color: "green",
      });
    } else {
      res.render("admin/signup", {
        message: "Something went wrong, Try login",
        color: "red",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const loginLoad = (req, res) => {
  try {
    res.render("admin/login");
  } catch (error) {}
};

const verifyLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const adminData = await Admin.findOne({ email });
    if (adminData) {
      const passwordMatch = await bcrypt.compare(password, adminData.password);
      if (passwordMatch) {
        if (adminData.isVerified) {
          req.session.admin = adminData.name;
          res.redirect("/admin/dashboard");
        } else {
          res.render("admin/login", {
            message: "Verification is pending",
            color: "green",
          });
        }
      } else {
        res.render("admin/login", {
          message: "Username or Password is incorrect!",
          color: "red",
        });
      }
    } else {
      res.render("admin/login", {
        message: "Username or Password is incorrect!",
        color: "red",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadDashboard = async (req, res) => {
  try {
    const name = req.session.admin;
    res.render("admin/dashboard");
  } catch (error) {
    console.log(error.message);
  }
};

const seeCustomers = async (req, res) => {
  try {
    const customers = await User.find();
    res.render("admin/customers", { customers });
  } catch (error) {
    console.log(error.message);
  }
};
const updateCustomers = async (req, res) => {
  try {
    const userData = await User.findByIdAndUpdate(
      { _id: req.params.id },
      { $bit: { blocked: { xor: 1 } } },
      { new: true }
    );
    if (userData) {
      const message = userData.blocked ? "Unblock" : "Block";
      res.json({ message });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// category controllers start

const seeCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.render("admin/categories", { categories });
  } catch (error) {
    console.log(error.message);
  }
};

const addCategory = async (req, res) => {
  try {
    const name = req.body.categoryName;
    const category = new Category({ name });
    const result = await category.save();
    if (result) {
      res.json({ status: "success", result });
    } else {
      res.json({ status: "failed" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const updateCategories = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      { _id: req.params.id },
      { $bit: { listed: { xor: 1 } } },
      { new: true }
    );
    if (category) {
      const message = category.listed ? "Unlist" : "List";
      res.json({ message });
    }
  } catch (error) {
    console.log(error.message);
  }
};
// category controllers end

// product controllers start
const seeProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("category").exec();
    console.log(products);
    res.render("admin/products", { products });
  } catch (error) {
    console.log(error.message);
  }
};
const showAddProduct = async (req, res) => {
  try {
    const categories = await Category.find();
    if (categories) {
      res.render("admin/addProduct", { categories });
    }
  } catch (error) {
    console.log(error.message);
  }
};
const addProduct = async (req, res) => {
  try {
    const { name, md_price, price, category, quantity, description, brand } =
      req.body;
    const images = [];
    for (let key in req.files) {
      images.push(req.files[key][0].filename);
    }
    const newProduct = new Product({
      name,
      md_price,
      price,
      images,
      quantity,
      category,
      description,
      brand,
    });
    const product = await newProduct.save();
    if (product) {
      res.redirect("/admin/products");
    } else {
      res.redirect("/admin/add-product");
    }
  } catch (error) {
    console.log(error.message);
  }
};
const updateProducts = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      { _id: req.params.id },
      { $bit: { listed: { xor: 1 } } },
      { new: true }
    );
    if (product) {
      const message = product.listed ? "Unlist" : "List";
      res.json({ message });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// product controllers end

module.exports = {
  createAdmin,
  adminSignup,
  loginLoad,
  verifyLogin,
  loadDashboard,
  seeCustomers,
  seeProducts,
  updateCustomers,
  seeCategories,
  addCategory,
  updateCategories,
  showAddProduct,
  addProduct,
  updateProducts,
};
