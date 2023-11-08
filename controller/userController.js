const User = require("../model/userModel");
const bcrypt = require("bcrypt");
const sendMail = require("../services/sendMail");
const UserOTP = require("../model/userOTPVerification");
const securePassword = require("../services/securePassword");

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
      return res.json({
        status: "failed",
        message: "User already exist, try login instead",
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
      req.session.user = name;
      req.session.userId = userData._id;
      res.json({ status: "success" });
    } else {
      res.json({
        status: "failed",
        message: "Something went wrong! Please try again",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};
const showVerify = async (req, res) => {
  const userId = req.session.userId ?? req.session.tempUserId
  const userData = await User.findById({ _id: userId });
  if (userData) {
    const otp = `${Math.floor(100000 + Math.random() * 900000)}`;
    const hashOtp = await securePassword(otp);
    const userOtp = new UserOTP({
      userId,
      otp: hashOtp,
      email: userData.email,
    });
    const otpSave = await userOtp.save();
    if (otpSave) {
      console.log(userData);
      await sendMail.sendVerifyMail(userData.name, userData.email, otp);
      return res.render("user/verifyMail", { email: userData.email });
    }
  }
  res.redirect("/login");
};

const checkOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    const userId = req.session.userId
    console.log(otp);
    const userOtp = await UserOTP.findOne({ userId: userId });
    if (userOtp) {
      const otpMatch = await bcrypt.compare(otp, userOtp.otp);
      if (otpMatch) {
        await UserOTP.findByIdAndDelete({ _id: userOtp._id });
        const userData = await User.findByIdAndUpdate(
          { _id: userId },
          { verified: true }
        );
        if (userData) {
          res.json({ status: "success",link:'/'});
        } else {
          res.json({
            status: "failed",
            message: "Something went wrong! Try again",
          });
        }
      } else {
        res.json({ status: "failed", message: "OTP doesn't match" });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

const resendOTP = async (req, res) => {
  try {
    const userId = req.session.userId ?? req.session.tempUserId;
    const name = req.session.user;
    const otp = `${Math.floor(100000 + Math.random() * 900000)}`;
    const hashOtp = await securePassword(otp);
    const newOtp = await UserOTP.findOneAndUpdate({ userId }, { otp: hashOtp });
    if (newOtp) {
      const email = newOtp.email;
      await sendMail.sendVerifyMail(name, email, otp);
      res.json({ status: "success" });
    } else {
      res.json({
        status: "failed",
        message: "Something went wrong! Try again",
      });
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
        req.session.userId = userData._id;
        res.json({ status: "success" });
      } else {
        res.json({
          status: "failed",
          message: "Username or Password is incorrect!",
        });
      }
    } else {
      res.json({
        status: "failed",
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
    const userData = await User.findOne({email});
    if(userData){
      req.session.tempUserId=userData._id;
      res.json({status:'success'});
    }else{
      res.json({status:'failed',message:'No account found with this email-id!'})
    }
    
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
  showVerify,
  //   loadHome,
  //   userLogout,
};
