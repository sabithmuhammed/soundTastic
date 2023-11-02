const User = require("../model/userModel");
const bcrypt = require("bcrypt");
const sendMail = require("../services/sendMail");
const UserOTP = require("../model/userOTPVerification");
const securePassword = require("../services/securePassword")

const loadRegister = async (req, res) => {
  try {
    res.render("user/signup");
  } catch (error) {
    console.log(error.message);
  }
};

const insertUser = async (req, res) => {
  try {
    const { password, email, name, phone } = req.body;
    const userCheck = await User.findOne({ email });
    if (userCheck) {
      return res.render("user/signup", {
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
      const { name, _id, email } = userData;
      const otp = `${Math.floor(100000 + Math.random() * 900000)}`;
      const OTPsave = new UserOTP({
        userId: _id,
        otp,
      });
      const userOTP = await OTPsave.save();
      if (userOTP) {
        await sendMail.sendVerifyMail(name, email, otp);
        req.session.user = name;
        req.session.userId = _id;
        req.session.userEmail = email;
        res.render("user/verifyMail", { email, userId: _id });
      }
    } else {
      res.render("user/signup", { message: "Something went wrong. Try again" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const checkOTP = async (req, res) => {
  try {
    const { o1, o2, o3, o4, o5, o6, id, email } = req.body;
    const otp = o1 + o2 + o3 + o4 + o5 + o6;
    const userOtp = await UserOTP.findOne({ userId: id });
    if (userOtp) {
      if (otp === userOtp.otp) {
        await UserOTP.findByIdAndDelete({ userId: id });
        const UseData = await User.findByIdAndUpdate(
          { _id: id },
          { verified: true }
        );
        res.redirect("user/home");
      } else {
        res.render("user/verifyMail", {
          message: "invalid OTP",
          userId: id,
          email,
        });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

const resendOTP = async (req, res) => {
  try {
    const id = req.params.id;
    const name = req.session.user;
    const email = req.session.userEmail;
    console.log(id);
    const otp = `${Math.floor(100000 + Math.random() * 900000)}`;
    const newOtp = await UserOTP.findOneAndUpdate({ userId: id }, { otp });
    if (newOtp) {
      await sendMail.sendVerifyMail(name, email, otp);
      res.render("user/verifyMail", { email, userId: id });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loginLoad = async (req, res) => {
  try {
    const message = req.query.m || null;

    res.render("user/login", { message, color: "green" });
  } catch (error) {
    console.log(error.message);
  }
};

const verifyLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userData = await User.findOne({ email });
    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        req.session.user = userData.name;
        res.send("home");
      } else {
        res.render("user/login", {
          message: "Username or Password is incorrect!",
        });
      }
    } else {
      res.render("user/login", {
        message: "Username or Password is incorrect!",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const forgetPassword = async (req, res) => {
  try {
    res.render("user/forgetPassword");
  } catch (error) {
    console.log(error.message);
  }
};

const forgetVerify = async (req, res) => {
  try {
    const email = req.body.email;
    console.log(email);
  } catch (error) {
    console.log(error.message);
  }
};

const changePassword = async (req, res) => {
  try {
    res.render("user/changePassword");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadRegister,
  insertUser,
  checkOTP,
  resendOTP,
  loginLoad,
    verifyLogin,
  forgetPassword,
  forgetVerify,
  changePassword,
  //   loadHome,
  //   userLogout,
};
