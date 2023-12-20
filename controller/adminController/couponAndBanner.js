const Coupon = require("../../model/couponModel");
const Banner = require("../../model/bannerModel");

const showCoupons = async (req, res) => {
  try {
    let search = "";
    if (req.query.search) {
      search = req.query.search;
    }
    const coupons = await Coupon.find({
      code: { $regex: ".*" + search + ".*", $options: "i" },
    });
    res.render("admin/coupons", { coupons ,search});
  } catch (error) {
    console.log(error.message);
  }
};

const showAddCoupon = async (req, res) => {
  try {
    res.render("admin/addCoupon");
  } catch (error) {
    console.log(error.message);
  }
};

const addCoupon = async (req, res) => {
  try {
    const couponObj = req.body;
    const exist = await Coupon.findOne({ code: couponObj.code });
    if (exist) {
      return res.status(409).render("admin/addCoupon", {
        error: "Coupon with the same coupon code is already exist",
      });
    }
    const coupon = await new Coupon(couponObj).save();
    res.redirect("/admin/coupons");

    console.log(
      req.body,
      new Date(req.body.expiry).toLocaleString("en-US"),
      Date.now().toLocaleString("en-US")
    );
  } catch (error) {
    console.log(error.message);
  }
};

const showEditCoupon = async (req, res) => {
  try {
    const id = req.params.id;
    const coupon = await Coupon.findById({ _id: id });
    res.render("admin/editCoupon", { coupon });
  } catch (error) {
    console.log(error.message);
  }
};
const editCoupon = async (req, res) => {
  try {
    const { id, code, validFrom, expiry, discountAmount, minimumSpend } =
      req.body;

    const exist = await Coupon.findOne({ code });
    if (exist && !exist._id.equals(id)) {
      return res.status(409).render("admin/editCoupon", {
        error: "Coupon with the same coupon code is already exist",
      });
    }
    const updatedCoupon = await Coupon.findByIdAndUpdate(
      { _id: id },
      { code, validFrom, expiry, discountAmount, minimumSpend }
    );
    res.redirect("/admin/coupons");
  } catch (error) {
    console.log(error.message);
  }
};

const updateCoupons = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(
      { _id: req.params.id },
      { $bit: { listed: { xor: 1 } } },
      { new: true }
    );
    if (coupon) {
      const message = coupon.listed ? "Unlist" : "List";
      res.json({ message });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const showBanners = async(req,res)=>{
  try {
    const banners = await Banner.find();

    res.render('admin/banners',{banners})
  } catch (error) {
    console.log(error.message);
  }
}

const showAddBanner = async(req,res)=>{
  try {
    res.render('admin/addBanner')
  } catch (error) {
    console.log(error.message);
  }
}
const addBanner = async(req,res)=>{
try {
  console.log(req.file);
  const image=req.file.filename;
  const{link,title,description}=req.body
  const banner=await new Banner({image,link,title,description}).save();
    res.status(204).send()
} catch (error) {
  console.log(error.message);
}
}

const listBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(
      { _id: req.params.id },
      { $bit: { listed: { xor: 1 } } },
      { new: true }
    );
    if (banner) {
      const message = banner.listed ? "Unlist" : "List";
      res.json({ message });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const deleteBanner = async (req,res)=>{
  try {
    const deletedBanner = await Banner.findByIdAndDelete(req.params.id)
    if(deleteBanner){
    return res.status(204).send()
    }
  } catch (error) {
    console.log(error.message);
  }
}

module.exports = {
  showCoupons,
  showAddCoupon,
  addCoupon,
  updateCoupons,
  showEditCoupon,
  editCoupon,
  showBanners,
  showAddBanner,
  addBanner,
  listBanner,
  deleteBanner

};
