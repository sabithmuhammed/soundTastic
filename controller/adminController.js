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
    let search = "";
    if (req.query.search) {
      search = req.query.search;
    }
    const customers = await User.find({
      $or: [
        {
          name: { $regex: ".*" + search + ".*", $options: "i" },
        },
        {
          email: { $regex: ".*" + search + ".*", $options: "i" },
        },
        {
          phone: { $regex: ".*" + search + ".*" },
        },
      ],
    });
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
    let search = "";
    if (req.query.search) {
      search = req.query.search;
    }
    const categories = await Category.find({
      name: { $regex: ".*" + search + ".*", $options: "i" },
    });
    res.render("admin/categories", { categories });
  } catch (error) {
    console.log(error.message);
  }
};

const addCategory = async (req, res) => {
  try {
    let name = req.body.categoryName;
    name = name[0].toUpperCase() + name.slice(1).toLowerCase();
    const check = await Category.findOne({ name });
    if (!check) {
      const category = new Category({ name });
      const result = await category.save();
      if (result) {
        res.json({ status: "success", result });
      }
    } else {
      res.json({ status: "failed",message:"Cannot add duplicate categories" });
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
const editCategory = async (req, res) => {
  try {
    const { id, name } = req.body;
    const category = await Category.findByIdAndUpdate(
      { _id: id },
      { name },
      { new: true }
    );
    if (category) {
      res.json({ status: "success", message: category.name });
    } else {
      res.json({ status: "failed" });
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
    res.render("admin/products", { products });
  } catch (error) {
    console.log(error.message);
  }
};
const showAddProduct = async (req, res) => {
  try {
    const categories = await Category.find({ listed: 1 });
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
const showEditProduct = async (req, res) => {
  try {
    const categories = await Category.find({ listed: 1 });

    const id = req.params.id;
    const product = await Product.findById({ _id: id })
      .populate("category")
      .exec();
    if (product) {
      res.render("admin/editProduct", { product, categories });
    } else {
      res.redirect("/admin/products");
    }
  } catch (error) {
    console.log(error.message);
  }
};
const editProduct = async (req, res) => {
  try {
    const {
      name,
      md_price,
      price,
      category,
      quantity,
      description,
      brand,
      id,
      image_1,
      image_2,
      image_3,
      image_4,
    } = req.body;
    const images = [];
    console.log(req.body);
    images.push(req.files["image1"]?.[0].filename ?? image_1);
    images.push(req.files["image2"]?.[0].filename ?? image_2);
    images.push(req.files["image3"]?.[0].filename ?? image_3);
    images.push(req.files["image4"]?.[0].filename ?? image_4);
    console.log(images);
    const product = await Product.findByIdAndUpdate(
      { _id: id },
      { name, md_price, price, category, quantity, description, brand, images }
    );
    console.log(product);
    if (product) {
      res.redirect("/admin/products");
    } else {
      res.redirect(`/admin/edit-product/${id}`);
    }
  } catch (error) {
    console.log(error.message);
  }
};
const addStock=async (req,res)=>{
  try {
    const {id,quantity}=req.body;
    const product=await Product.findByIdAndUpdate({_id:id},{$inc:{quantity}},{new:true});
    if(product){
      res.json({status:'success',quantity:product.quantity});
    }
  } catch (error) {
    
  }
}
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
  editCategory,
  showEditProduct,
  editProduct,
  addStock,

};
