const express = require("express");
const auth = require("../middleware/auth");
const user_route = express.Router();

const navPagesController = require('../controller/userController/navPages');
const cartController = require('../controller/userController/cart');
const userPageController=require('../controller/userController/userProfile');
const authController = require('../controller/userController/authentication');
const ordersController = require('../controller/userController/orders')
const cancelReturnController = require('../controller/userController/returnAndCancel')

//home and login
user_route.get("/", navPagesController.home);
user_route.get("/home",auth.userBlock, navPagesController.loadHome);
user_route.get("/login",auth.isLogout,authController.loginLoad);
user_route.post("/login", authController.verifyLogin);
user_route.get("/logout",authController.userLogout);
user_route.get("/user-blocked",navPagesController.showUserBlock)

//sign up
user_route.get("/signup",auth.isLogout,authController.loadRegister);
user_route.post("/signup",authController.insertUser);

//mail verification
user_route.get("/verify-mail",auth.tempAccess,authController.showVerify)
user_route.post("/resend-otp",authController.resendOTP)
user_route.post("/verify-otp",authController.checkOTP);


//forgot password and changing password 
user_route.get("/forget-password",authController.forgetPassword);
user_route.post("/forget-password",authController.forgetVerify);
user_route.get("/password-otp",auth.tempAccess,authController.showPasswordOtp)
user_route.post("/check-password-otp",authController.passwordCheckOTP)

user_route.get("/change-password",auth.changePassword,authController.showChangePassword);
//used in forgot password and in user-profile for changin password
user_route.patch("/change-password",authController.changePassword);

//shop and product view page
user_route.get("/shop",auth.userBlock,navPagesController.showShop);
user_route.get("/product/:id",auth.userBlock,navPagesController.showProductPage);

//user profile
user_route.get('/my-profile',auth.isLogin,auth.userBlock,userPageController.showProfile);
user_route.get('/add-address',auth.isLogin,auth.userBlock,userPageController.showAddAddress)
user_route.post('/add-address',auth.jsonIsLogin,auth.jsonUserBlock,userPageController.addAddress)
user_route.get('/edit-address/:id',auth.isLogin,auth.userBlock,userPageController.showEditAddress)
user_route.put('/edit-address/',auth.jsonIsLogin,auth.jsonUserBlock,userPageController.editAddress)
user_route.delete('/delete-address/',auth.jsonIsLogin,auth.jsonUserBlock,userPageController.deleteAddress)
user_route.patch('/edit-profile/',auth.jsonIsLogin,auth.jsonUserBlock,userPageController.editProfile)
user_route.post('/check-password',auth.jsonIsLogin,auth.jsonUserBlock,authController.checkPassword)
user_route.patch('/default-address',auth.jsonIsLogin,auth.jsonUserBlock,userPageController.setDefaultAddress)

//cart related
user_route.get('/cart',auth.isLogin,auth.userBlock,cartController.showCart);
user_route.post('/add-to-cart',auth.jsonIsLogin,auth.jsonUserBlock,cartController.addToCart);
user_route.patch('/change-cart-quantity',auth.jsonIsLogin,auth.jsonUserBlock,cartController.changeQuantity);
user_route.delete('/cart-remove',auth.jsonIsLogin,auth.jsonUserBlock,cartController.removeFromCart);
user_route.get('/check-stock',auth.jsonIsLogin,cartController.checkStock);

//wishlist related
user_route.get('/wishlist',auth.isLogin,auth.userBlock,navPagesController.showWishlist)
user_route.post('/add-to-wishlist',auth.jsonIsLogin,auth.jsonUserBlock,navPagesController.addToWishlist);
user_route.delete('/remove-from-wishlist',auth.jsonIsLogin,auth.jsonUserBlock,navPagesController.removeFromWishlist);

//orders
user_route.get('/checkout',auth.isLogin,auth.userBlock,ordersController.showCheckout);
user_route.post('/place-order',auth.jsonIsLogin,auth.jsonUserBlock,ordersController.placeOrder)
user_route.patch('/verify-payment',auth.jsonIsLogin,ordersController.verifyOnlinePayment);
user_route.get('/order-success',auth.isLogin,auth.userBlock,ordersController.showOrderSuccess)
user_route.get('/orders',auth.isLogin,auth.userBlock,ordersController.showOrders)
user_route.get('/order-details/:orderId',auth.isLogin,auth.userBlock,ordersController.showOrderDetails)
user_route.get('/order-details/:orderId',auth.isLogin,auth.userBlock,ordersController.showOrderDetails)
user_route.post('/cancel-order',auth.jsonIsLogin,auth.jsonUserBlock,cancelReturnController.cancelOrder);


//coupon
user_route.get('/get-coupons',ordersController.getCoupons)
user_route.post('/apply-coupon',ordersController.verifyCoupon)

module.exports = user_route;
