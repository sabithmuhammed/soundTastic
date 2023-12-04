const Coupon = require("../../model/couponModel");

const showCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({});
    res.render("admin/coupons", { coupons });
  } catch (error) {
    console.log(error.message);
  }
};

const showAddCoupon=async(req,res)=>{
  try {
    res.render("admin/addCoupon")
  } catch (error) {
    console.log(error.message);
  }
}

module.exports = {
  showCoupons,
  showAddCoupon,
};
