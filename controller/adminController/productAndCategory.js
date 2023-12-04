const Category = require("../../model/categoryModel");
const Product = require("../../model/productModel");

const seeCategories = async (req, res) => {
  try {
    let search = "";
    if (req.query.search) {
      search = req.query.search;
    }
    const categories = await Category.find({
      name: { $regex: ".*" + search + ".*", $options: "i" },
    });
    res.render("admin/categories", { categories, search });
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
      res.json({
        status: "failed",
        message: "Cannot add duplicate categories",
      });
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
    let { id, name } = req.body;
    name = name[0].toUpperCase() + name.slice(1).toLowerCase();
    const checkExist = await Category.findOne({ name });
    if (!checkExist) {
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
    } else {
      res.json({
        status: "failed",
        message: "Category with same name already exist",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const seeProducts = async (req, res) => {
  try {
    let search = "";
    if (req.query.search) {
      search = req.query.search;
    }
    const products = await Product.find({
      $or: [
        {
          name: { $regex: ".*" + search + ".*", $options: "i" },
        },
        {
          brand: { $regex: ".*" + search + ".*", $options: "i" },
        },
      ],
    })
      .populate("category")
      .exec();
    res.render("admin/products", { products, search });
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

const addStock = async (req, res) => {
  try {
    const { id, quantity } = req.body;
    const product = await Product.findByIdAndUpdate(
      { _id: id },
      { $inc: { quantity } },
      { new: true }
    );
    if (product) {
      res.json({ status: "success", quantity: product.quantity });
    }
  } catch (error) {}
};

module.exports = {
  seeCategories,
  addCategory,
  updateCategories,
  editCategory,
  seeProducts,
  showAddProduct,
  addProduct,
  updateProducts,
  showEditProduct,
  editProduct,
  addStock,
};
