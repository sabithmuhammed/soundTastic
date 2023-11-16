const express = require("express");
const userController = require("../controller/userController");
const auth = require("../middleware/auth");
const user_route = express.Router();

user_route.get("/", userController.home);
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
user_route.get("/product/:id",userController.showProductPage);

user_route.get('/my-profile',userController.showProfile);
user_route.get('/add-address',userController.showAddAddress)
user_route.post('/add-address',userController.addAddress)
user_route.get('/edit-address/:id',userController.showEditAddress)
user_route.post('/edit-address/',userController.editAddress)
user_route.post('/delete-address/',userController.deleteAddress)
user_route.post('/edit-profile/',userController.editProfile)
user_route.post('/check-password',userController.checkPassword)

module.exports = user_route;
