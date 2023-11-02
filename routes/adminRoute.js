const express = require('express');
const adminController =require('../controller/adminController');
const admin_route = express.Router();


admin_route.get('/',adminController.loginLoad);
admin_route.get('/login',adminController.loginLoad);
admin_route.post('/login',adminController.verifyLogin);

// admin_route.get('/signup',auth.isLogout,adminController.adminSignup);
// admin_route.post('/signup',auth.validateForm,adminController.createAdmin);

admin_route.get('/dashboard',adminController.loadDashboard)

admin_route.get('/customers',adminController.seeCustomers);
// admin_route.post('/edit-user', auth.validateForm,adminController.updateUser);

// admin_route.get('/delete-user',auth.isLogin,adminController.deleteUser);

// admin_route.get('/add-user',auth.isLogin,adminController.loadRegister);
// admin_route.post('/add-user',auth.validateForm,adminController.addUser);


// admin_route.get('/logout',adminController.adminLogout);
// admin_route.get('/*',adminController.loginLoad);


module.exports = admin_route;