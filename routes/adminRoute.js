const express = require('express');
const adminController =require('../controller/adminController');
const admin_route = express.Router();
const imageUpload =require('../config/multerConfig');


admin_route.get('/',adminController.loginLoad);
admin_route.get('/login',adminController.loginLoad);
admin_route.post('/login',adminController.verifyLogin);

// admin_route.get('/signup',auth.isLogout,adminController.adminSignup);
// admin_route.post('/signup',auth.validateForm,adminController.createAdmin);

admin_route.get('/dashboard',adminController.loadDashboard);

// customer routes start
admin_route.get('/customers',adminController.seeCustomers);
admin_route.get('/block-customer/:id',adminController.updateCustomers);
// customer routes end

// category routes start
admin_route.get('/categories',adminController.seeCategories);
admin_route.get('/list-category/:id',adminController.updateCategories);
admin_route.post('/add-category',adminController.addCategory);
admin_route.post('/edit-category',adminController.editCategory);
// category routes end

// product routes start
admin_route.get('/products',adminController.seeProducts);
admin_route.get('/add-product',adminController.showAddProduct);
admin_route.post('/add-product',imageUpload,adminController.addProduct);
admin_route.get('/edit-product/:id',adminController.showEditProduct);
admin_route.get('/list-product/:id',adminController.updateProducts);
// product routes end

module.exports = admin_route;