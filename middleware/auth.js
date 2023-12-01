const checkBlock = require('../utilities/checkBlock')
const isLogin=async (req,res,next)=>{
    try {
        if(req.session.userId){
            next();
        }else{
            res.redirect('/home');
        }
    } catch (error) {
        console.log(error.message);
        
    }
};

const isLogout=async(req,res,next)=>{
     try {
        if(req.session.userId){
          return  res.redirect('/home');
        }
        next();
        
     } catch (error) {
        console.log(error.message);
     }
};

const jsonIsLogin =async(req,res,next)=>{
    try {
        if(req.session.userId){
            next();
        }else{
            res.status(401).send();
        }
    } catch (error) {
        console.log(error.message);
    }
}
const changePassword=async(req,res,next)=>{
    try {
        if(req.session.otpVerified){
            next();
        }else{
            res.redirect('/home')
        }
    } catch (error) {
        console.log(error.message);
    }
}

const tempAccess=async(req,res,next)=>{
    try {
        if(req.session.tempUserId  && !req.session.otpVerified){
            next()
        }else{
            res.redirect('back');
        }
    } catch (error) {
        console.log(error.message);
    }
}

const userBlock = async (req,res,next)=>{
    try {
        if( await checkBlock(req.session.userId)){
            req.session.destroy();
            res.redirect("/user-blocked")
        }else{
            next();
        }
    } catch (error) {
        console.log(error.message);
    }
}

const jsonUserBlock = async (req,res,next)=>{
    try {
        if( await checkBlock(req.session.userId)){
            req.session.destroy();
            res.status(403).send();
        }else{
            next();
        }
    } catch (error) {
        console.log(error.message);
        
    }
}

module.exports={
    isLogin,
    isLogout,
    changePassword,
    tempAccess,
    userBlock,
    jsonIsLogin,
    jsonUserBlock

};