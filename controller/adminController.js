const Admin = require("../model/adminModel");
const User = require("../model/userModel");
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

const seeCustomers = async (req,res)=>{
  try {
    const customers=await User.find();
    res.render("admin/customers",{customers});
  } catch (error) {
    console.log(error.message);
  }
}

module.exports = {
  createAdmin,
  adminSignup,
  loginLoad,
  verifyLogin,
  loadDashboard,
  seeCustomers,
};