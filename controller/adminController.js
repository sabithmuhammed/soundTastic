const Admin = require("../model/adminModel");
const User = require("../model/userModel");
const bcrypt = require("bcrypt");
const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};
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
    const message = req.query.m || null;
    const color = "green";
    res.render("admin/login", { message, color });
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
    let search = "";
    if (req.query.search) {
      search = req.query.search;
    }
    const usersData = await User.find({
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
    const name = req.session.admin;
    res.render("admin/dashboard", { name, users: usersData });
  } catch (error) {
    console.log(error.message);
  }
};
const adminLogout = (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        res.send("Oops something went wrong, please try again");
      } else {
        const message = "Logged out successfully";
        res.redirect(`/admin?m=${encodeURIComponent(message)}`);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};
const editUser = async (req, res) => {
  try {
    const editId = req.query.id;
    const userData = await User.findById({ _id: editId });
    if (userData) {
      res.render("admin/edit-user", {
        name: req.session.admin,
        user: userData,
      });
    } else {
      res.redirect("admin/dashboard");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, email, id, phone } = req.body;
    const updatedData = await User.findByIdAndUpdate(
      { _id: id },
      { $set: { name, email, phone } }
    );
    res.redirect("/admin/dashboard");
  } catch (error) {
    console.log(error.message);
  }
};

const deleteUser = async (req, res) => {
  try {
    const id = req.query.id;
    const deleteData = await User.findByIdAndDelete({ _id: id });
    res.redirect("/admin/dashboard");
  } catch (error) {
    console.log(error.message);
  }
};

const addUser = async (req, res) => {
  try {
    const { password, email, name, phone } = req.body;
    const userCheck = await User.findOne({ email });
    if (userCheck) {
      return res.render("admin/addUser", {
        message: "User already exist, try login instead",
        color: "red",
      });
    }
    const hashPassword = await securePassword(req.body.password);
    const user = new User({
      name,
      email,
      phone,
      password: hashPassword,
    });
    const userData = await user.save();

    if (userData) {
      res.redirect("/admin/dashboard");
    } else {
      res.render("admin/addUser", {
        message: "Something went wrong. Try again",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};
const loadRegister = async (req, res) => {
  try {
    res.render("admin/addUser", { name: req.session.name });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  createAdmin,
  adminSignup,
  loginLoad,
  verifyLogin,
  loadDashboard,
  editUser,
  updateUser,
  deleteUser,
  loadRegister,
  addUser,
  adminLogout,
};