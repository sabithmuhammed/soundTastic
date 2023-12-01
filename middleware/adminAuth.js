const isLogin=async (req,res,next)=>{
    try {
        if(req.session.admin){
            next();
        }else{
            res.redirect('/admin');
        }
    } catch (error) {
        console.log(error.message);
        
    }
  };
  
  const jsonIsLogin =async(req,res,next)=>{
    try {
        if(req.session.admin){
            next();
        }else{
            res.status(401).send();
        }
    } catch (error) {
        console.log(error.message);
    }
}

  const isLogout=async(req,res,next)=>{
     try {
        if(req.session.admin){
           return res.redirect('/admin/dashboard');
        }
        next();
        
     } catch (error) {
        console.log(error.message);
     }
  };
  
  module.exports={
      isLogin,
      isLogout,
      jsonIsLogin,

      
  }