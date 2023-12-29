const express = require('express');
const dashboard=require('../controller/adminController/dashboard');
const authAndCustomer =require('../controller/adminController/authAndCustomer');
const productAndCategory =require('../controller/adminController/productAndCategory');
const orderManagement = require("../controller/adminController/orderManagment")
const couponAndBanner= require("../controller/adminController/couponAndBanner")
const admin_route = express.Router();
const {imageUpload,bannerUpload} =require('../middleware/multerConfig');
const auth =require('../middleware/adminAuth');


admin_route.get('/',auth.isLogout,authAndCustomer.loginLoad);
admin_route.get('/login',auth.isLogout,authAndCustomer.loginLoad);
admin_route.post('/login',authAndCustomer.verifyLogin);
admin_route.get('/logout',auth.isLogin,authAndCustomer.adminLogout)
admin_route.post('/signup',authAndCustomer.createAdmin);


admin_route.get('/dashboard',auth.isLogin,dashboard.loadDashboard);
admin_route.get('/dashboard-data',auth.jsonIsLogin,dashboard.sendDashboardData);
admin_route.get('/sales',auth.isLogin,dashboard.loadSales);
admin_route.get('/generate-report',auth.jsonIsLogin,dashboard.generateSalesReport);

// customer routes start
admin_route.get('/customers',auth.isLogin,authAndCustomer.seeCustomers);
admin_route.patch('/block-customer/:id',auth.jsonIsLogin,authAndCustomer.updateCustomers);
// customer routes end

// category routes start
admin_route.get('/categories',auth.isLogin,productAndCategory.seeCategories);
admin_route.patch('/list-category/:id',auth.jsonIsLogin,productAndCategory.updateCategories);
admin_route.post('/add-category',auth.jsonIsLogin,productAndCategory.addCategory);
admin_route.put('/edit-category',auth.jsonIsLogin,productAndCategory.editCategory);
// category routes end

// product routes start
admin_route.get('/products',auth.isLogin,productAndCategory.seeProducts);
admin_route.get('/add-product',auth.isLogin,productAndCategory.showAddProduct);
admin_route.post('/add-product',imageUpload,productAndCategory.addProduct);
admin_route.get('/edit-product/:id',auth.isLogin,productAndCategory.showEditProduct);
admin_route.post('/edit-product',auth.isLogin,imageUpload,productAndCategory.editProduct);
admin_route.patch('/add-stock',auth.jsonIsLogin,productAndCategory.addStock);
admin_route.patch('/list-product/:id',auth.jsonIsLogin,productAndCategory.updateProducts);
// product routes end

//orders routes start
admin_route.get('/orders',auth.isLogin,orderManagement.showOrders);
admin_route.get('/manage-order/:orderId',auth.isLogin,orderManagement.showManageOrder);
admin_route.patch('/change-status',auth.jsonIsLogin,orderManagement.changeStatus);
admin_route.get('/return-requests',auth.isLogin,orderManagement.showReturnRequests);
admin_route.patch('/accept-return',auth.jsonIsLogin,orderManagement.acceptReturn);
admin_route.patch('/reject-return',auth.jsonIsLogin,orderManagement.rejectReturn);
//orders routes end

//coupon routes start
admin_route.get('/coupons',auth.isLogin,couponAndBanner.showCoupons)
admin_route.get('/add-coupon',auth.isLogin,couponAndBanner.showAddCoupon)
admin_route.post('/add-coupon',auth.isLogin,couponAndBanner.addCoupon)
admin_route.get('/edit-coupon/:id',auth.isLogin,couponAndBanner.showEditCoupon)
admin_route.post('/edit-coupon',auth.isLogin,couponAndBanner.editCoupon)
admin_route.patch('/list-coupon/:id',auth.jsonIsLogin,couponAndBanner.updateCoupons);
//coupon routes end

//banner routes start
admin_route.get('/banners',couponAndBanner.showBanners)
admin_route.get('/add-banner',couponAndBanner.showAddBanner)
admin_route.post('/add-banner',bannerUpload,couponAndBanner.addBanner)
admin_route.patch('/list-banner/:id',couponAndBanner.listBanner)
admin_route.delete('/delete-banner/:id',couponAndBanner.deleteBanner)
//banner routes end

admin_route.get("/*",auth.isLogout,authAndCustomer.loginLoad)

module.exports = admin_route;