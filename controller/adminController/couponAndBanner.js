const Coupon = require("../../model/couponModel");

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

module.exports = {
  showCoupons,
  showAddCoupon,
  addCoupon,
  updateCoupons,
  showEditCoupon,
  editCoupon,
};
