const express = require('express');
const adminController =require('../controller/adminController');
const admin_route = express.Router();
const imageUpload =require('../config/multerConfig');
const auth =require('../middleware/adminAuth');


admin_route.get('/',auth.isLogout,adminController.loginLoad);
admin_route.get('/login',auth.isLogout,adminController.loginLoad);
admin_route.post('/login',adminController.verifyLogin);
admin_route.get('/logout',auth.isLogin,adminController.adminLogout)
// admin_route.post('/signup',adminController.createAdmin);

admin_route.get('/dashboard',auth.isLogin,adminController.loadDashboard);

// customer routes start
admin_route.get('/customers',auth.isLogin,adminController.seeCustomers);
admin_route.post('/block-customer/:id',adminController.updateCustomers);
// customer routes end

// category routes start
admin_route.get('/categories',auth.isLogin,adminController.seeCategories);
admin_route.post('/list-category/:id',adminController.updateCategories);
admin_route.post('/add-category',adminController.addCategory);
admin_route.post('/edit-category',adminController.editCategory);
// category routes end

// product routes start
admin_route.get('/products',auth.isLogin,adminController.seeProducts);
admin_route.get('/add-product',auth.isLogin,adminController.showAddProduct);
admin_route.post('/add-product',imageUpload,adminController.addProduct);
admin_route.get('/edit-product/:id',auth.isLogin,adminController.showEditProduct);
admin_route.post('/edit-product',auth.isLogin,imageUpload,adminController.editProduct);
admin_route.post('/add-stock',adminController.addStock);
admin_route.post('/list-product/:id',adminController.updateProducts);
// product routes end

admin_route.get("/*",auth.isLogout,adminController.loginLoad)

module.exports = admin_route;