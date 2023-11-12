const express = require("express");
const userController = require("../controller/userController");
const auth = require("../middleware/auth");
const user_route = express.Router();

user_route.get("/", userController.loadHome);
user_route.get("/home", userController.loadHome);
user_route.get("/login",auth.isLogout,userController.loginLoad);
user_route.post("/login", userController.verifyLogin);
user_route.get("/logout",userController.userLogout);



user_route.get("/signup",auth.isLogout,userController.loadRegister);
user_route.post("/signup",userController.insertUser);

user_route.get("/verify-mail",auth.tempAccess,userController.showVerify)
user_route.post("/resend-otp",userController.resendOTP)
user_route.post("/verify-otp",userController.checkOTP);



user_route.get("/forget-password",userController.forgetPassword);
user_route.post("/forget-password",userController.forgetVerify);
user_route.get("/password-otp",auth.tempAccess,userController.showPasswordOtp)
user_route.post("/check-password-otp",userController.passwordCheckOTP)

user_route.get("/change-password",auth.changePassword,userController.showChangePassword);
user_route.post("/change-password",userController.changePassword);

user_route.get("/shop",userController.showShop);

module.exports = user_route;
