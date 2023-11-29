const Admin = require("../../model/adminModel");
const User = require("../../model/userModel");
const bcrypt = require("bcrypt");
const securePassword = require("../../services/securePassword");



const createAdmin = async (req, res) => {
  try {
    const { password, email, name } = req.body;
    const adminCheck = await Admin.findOne({ email });
    if (adminCheck) {
      return res.json({ status: "failed", message: "Account already exist" });
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
      res.json({ status: "success", message: "Account created successfully" });
    } else {
      res.json({
        status: "failed",
        message: "Something went wrong, Try login",
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
    console.log(email, password);
    const adminData = await Admin.findOne({ email });
    if (adminData) {
      const passwordMatch = await bcrypt.compare(password, adminData.password);
      if (passwordMatch) {
        req.session.admin = adminData.name;
        res.json({ status: "success" });
      } else {
        res.json({ status: "failed", message: "Invalid username or password" });
      }
    } else {
      res.json({ status: "failed", message: "Invalid username or password" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const adminLogout = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        res.redirect("/admin/dashboard");
      } else {
        const message = "Logged out successfully";
        res.redirect("/admin");
      }
    });
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
    res.render("admin/customers", { customers, search });
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

module.exports = {
  createAdmin,
  loginLoad,
  verifyLogin,
  adminLogout,
  seeCustomers,
  updateCustomers, 
};
