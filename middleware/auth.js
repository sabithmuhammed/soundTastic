const isLogin=async (req,res,next)=>{
    try {
        if(req.session.userId){
            next();
        }else{
            res.redirect('/login');
        }
    } catch (error) {
        console.log(error.message);
        
    }
};

const isLogout=async(req,res,next)=>{
     try {
        if(req.session.userId){
          return  res.redirect('back');
        }
        next();
        
     } catch (error) {
        console.log(error.message);
     }
};
const changePassword=async(req,res,next)=>{
    try {
        if(req.session.otpVerified){
            next();
        }else{
            res.redirect('/')
        }
    } catch (error) {
        console.log(error.message);
    }
}

const tempAccess=async(req,res,next)=>{
    try {
        if(req.session.tempUserId){
            next()
        }else{
            res.redirect('/');
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

};