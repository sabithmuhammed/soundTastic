const express = require('express');
const adminController =require('../controller/adminController');
const auth = require('../middleware/authAdmin')
const admin_route = express.Router();


admin_route.get('/',auth.isLogout,adminController.loginLoad);
admin_route.get('/login',auth.isLogout,adminController.loginLoad);
admin_route.post('/login',adminController.verifyLogin);

admin_route.get('/signup',auth.isLogout,adminController.adminSignup);
admin_route.post('/signup',auth.validateForm,adminController.createAdmin);

admin_route.get('/dashboard',auth.isLogin,adminController.loadDashboard)

admin_route.get('/edit-user',auth.isLogin,adminController.editUser);
admin_route.post('/edit-user', auth.validateForm,adminController.updateUser);

admin_route.get('/delete-user',auth.isLogin,adminController.deleteUser);

admin_route.get('/add-user',auth.isLogin,adminController.loadRegister);
admin_route.post('/add-user',auth.validateForm,adminController.addUser);


admin_route.get('/logout',adminController.adminLogout);
admin_route.get('/*',adminController.loginLoad);


module.exports = admin_route;