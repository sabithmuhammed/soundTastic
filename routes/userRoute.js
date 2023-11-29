const express = require("express");
const auth = require("../middleware/auth");
const user_route = express.Router();

const navPagesController = require('../controller/userController/navPages');
const cartController = require('../controller/userController/cart');
const userPageController=require('../controller/userController/userProfile');
const authController = require('../controller/userController/authentication');
const ordersController = require('../controller/userController/orders')

user_route.get("/", navPagesController.home);
user_route.get("/home", navPagesController.loadHome);
user_route.get("/login",auth.isLogout,authController.loginLoad);
user_route.post("/login", authController.verifyLogin);
user_route.get("/logout",authController.userLogout);



user_route.get("/signup",auth.isLogout,authController.loadRegister);
user_route.post("/signup",authController.insertUser);

user_route.get("/verify-mail",auth.tempAccess,authController.showVerify)
user_route.post("/resend-otp",authController.resendOTP)
user_route.post("/verify-otp",authController.checkOTP);



user_route.get("/forget-password",authController.forgetPassword);
user_route.post("/forget-password",authController.forgetVerify);
user_route.get("/password-otp",auth.tempAccess,authController.showPasswordOtp)
user_route.post("/check-password-otp",authController.passwordCheckOTP)

user_route.get("/change-password",auth.changePassword,authController.showChangePassword);
user_route.post("/change-password",authController.changePassword);

user_route.get("/shop",navPagesController.showShop);
user_route.get("/product/:id",navPagesController.showProductPage);

user_route.get('/my-profile',auth.isLogin,userPageController.showProfile);
user_route.get('/add-address',auth.isLogin,userPageController.showAddAddress)
user_route.post('/add-address',userPageController.addAddress)
user_route.get('/edit-address/:id',auth.isLogin,userPageController.showEditAddress)
user_route.post('/edit-address/',userPageController.editAddress)
user_route.post('/delete-address/',userPageController.deleteAddress)
user_route.post('/edit-profile/',userPageController.editProfile)
user_route.post('/check-password',authController.checkPassword)
user_route.patch('/default-address',userPageController.setDefaultAddress)

user_route.get('/cart',auth.isLogin,cartController.showCart);
user_route.post('/add-to-cart',auth.isLogin,cartController.addToCart);
user_route.patch('/change-cart-quantity',cartController.changeQuantity);
user_route.delete('/cart-remove',cartController.removeFromCart);
user_route.get('/check-stock',cartController.checkStock);

user_route.get('/checkout',auth.isLogin,ordersController.showCheckout);
user_route.post('/place-order',ordersController.placeOrder)
user_route.get('/orders',auth.isLogin,ordersController.showOrders)
user_route.get('/order-details/:orderId',auth.isLogin,ordersController.showOrderDetails)

module.exports = user_route;
