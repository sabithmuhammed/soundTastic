const User = require("../../model/userModel");
const bcrypt = require("bcrypt");
const sendMail = require("../../services/sendMail");
const UserOTP = require("../../model/userOTPVerification");
const securePassword = require("../../services/securePassword");

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
      req.session.user = userData.name;
      req.session.tempUserId = userData._id;
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
  try {
    const userId = req.session.tempUserId;
    await UserOTP.findOneAndDelete({ userId });
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
  } catch (error) {
    console.log(error.message);
  }
};

const checkOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    const userId = req.session.tempUserId;
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
          req.session.userId = req.session.tempUserId;
          req.session.tempUserId = null;
          res.json({ status: "success" });
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
    const userId = req.session.tempUserId;
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
        if (userData.blocked) {
          return res.json({
            status: "failed",
            message: "You have been blocked",
          });
        }
        req.session.user = userData.name;
        if (!userData.verified) {
          req.session.tempUserId = userData._id;
          return res.json({ status: "pending" });
        }

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
    const userData = await User.findOne({ email });
    if (userData) {
      req.session.tempUserId = userData._id;
      req.session.user = userData.name;
      res.json({ status: "success" });
    } else {
      res.json({
        status: "failed",
        message: "No account found with this email-id!",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const showPasswordOtp = async (req, res) => {
  try {
    const userId = req.session.tempUserId;
    await UserOTP.findOneAndDelete({ userId });
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
        return res.render("user/changePasswordOtp", { email: userData.email });
      }
    }
    res.redirect("/login");
  } catch (error) {
    console.log(error.message);
  }
};

const passwordCheckOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    const userId = req.session.tempUserId;
    const userOtp = await UserOTP.findOne({ userId: userId });
    if (userOtp) {
      const otpMatch = await bcrypt.compare(otp, userOtp.otp);
      if (otpMatch) {
        req.session.otpVerified = true;
        await UserOTP.findByIdAndDelete({ _id: userOtp._id });
        res.json({ status: "success" });
      } else {
        res.json({ status: "failed", message: "OTP doesn't match" });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

const showChangePassword = async (req, res) => {
  try {
    res.render("user/changePassword");
  } catch (error) {
    console.log(error.message);
  }
};

const changePassword = async (req, res) => {
  try {
    const id = req.session.tempUserId ?? req.session.userId;
    const password = req.body.password;
    const hashPassword = await securePassword(password);
    if (hashPassword) {
      const userData = await User.findByIdAndUpdate(
        { _id: id },
        { password: hashPassword },
        { new: true }
      );
      if (userData) {
        req.session.otpVerified = null;
        req.session.tempUserId = null;
        req.session.userId = userData._id;
        req.session.user = userData.name;
        return res.json({ status: "success" });
      }
    }
    res.json({
      status: "failed",
      message: "Oops! something went wrong, try again",
    });
  } catch (error) {
    console.log(error.message);
  }
};
const checkPassword = async (req, res) => {
  try {
    const id = req.session.userId;
    const { password } = req.body;
    const userData = await User.findById({ _id: id });
    if (userData) {
      const passwordCheck = await bcrypt.compare(password, userData.password);
      if (passwordCheck) {
        return res.json({ status: "success" });
      } else {
        return res.json({
          status: "failed",
          message: "Password doesn't match",
        });
      }
    }
    res.json({ status: "failed", message: "Something went wrong! Try again" });
  } catch (error) {
    console.log(error.message);
  }
};

const userLogout = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        res.send("Oops something went wrong, please try again");
      } else {
        res.redirect("/");
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadRegister,
  insertUser,
  showVerify,
  checkOTP,
  resendOTP,
  loginLoad,
  verifyLogin,
  forgetPassword,
  forgetVerify,
  showPasswordOtp,
  passwordCheckOTP,
  showChangePassword,
  changePassword,
  checkPassword,
  userLogout,
};
