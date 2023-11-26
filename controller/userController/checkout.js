

const showCheckout=async(req,res)=>{
    try {
        res.render('user/checkout')
    } catch (error) {
        console.log(error.message);
    }
}


module.exports={
    showCheckout,
}