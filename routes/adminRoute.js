const express = require('express');
const adminController =require('../controller/adminController');
const admin_route = express.Router();


admin_route.get('/',adminController.loginLoad);
admin_route.get('/login',adminController.loginLoad);
admin_route.post('/login',adminController.verifyLogin);

// admin_route.get('/signup',auth.isLogout,adminController.adminSignup);
// admin_route.post('/signup',auth.validateForm,adminController.createAdmin);

admin_route.get('/dashboard',adminController.loadDashboard);
admin_route.get('/customers',adminController.seeCustomers);
admin_route.get('/customers/:id',adminController.updateCustomers);
admin_route.get('/products',adminController.seeProducts);
admin_route.get('/categories',adminController.seeCategories);
admin_route.get('/categories/:id',adminController.updateCategories);
admin_route.post('/add-category',adminController.addCategory);
admin_route.get('/add-product',adminController.showAddProduct)


module.exports = admin_route;