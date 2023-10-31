const express = require("express");
const userController = require("../controller/userController");
// const auth = require("../middleware/auth");
const user_route = express.Router();

// user_route.get("/", auth.isLogout, userController.loginLoad);
// user_route.get("/home", auth.isLogin, userController.loadHome);
user_route.get("/signup",userController.loadRegister);
// user_route.post("/signup", auth.validateForm, userController.insertUser);
user_route.get("/verify-mail",userController.verifyMail);
user_route.get("/login",userController.loginLoad);
// user_route.post("/login", userController.verifyLogin);
user_route.get("/forgot-password",userController.forgotPassword);
user_route.get("/change-password",userController.changePassword);

// user_route.get("/logout", auth.isLogin, userController.userLogout);

module.exports = user_route;
