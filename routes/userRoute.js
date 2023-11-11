const express = require("express");
const userController = require("../controller/userController");
// const auth = require("../middleware/auth");
const user_route = express.Router();

user_route.get("/", userController.loadHome);
user_route.get("/home", userController.loadHome);
user_route.get("/login",userController.loginLoad);
user_route.post("/login", userController.verifyLogin);
user_route.get("/logout",userController.userLogout);



user_route.get("/signup",userController.loadRegister);
user_route.post("/signup",userController.insertUser);

user_route.get("/verify-mail",userController.showVerify)
user_route.post("/resend-otp",userController.resendOTP)
user_route.post("/verify-otp",userController.checkOTP);



user_route.get("/forget-password",userController.forgetPassword);
user_route.get("/password-otp",userController.showPasswordOtp)
user_route.post("/check-password-otp",userController.passwordCheckOTP)
user_route.post("/forget-password",userController.forgetVerify);
user_route.get("/change-password",userController.showChangePassword);
user_route.post("/change-password",userController.changePassword);

user_route.get("/shop",userController.showShop);


// user_route.get("/logout", auth.isLogin, userController.userLogout);

module.exports = user_route;
