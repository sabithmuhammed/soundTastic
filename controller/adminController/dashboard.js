const User = require("../../model/userModel");
const Order = require("../../model/orderModel");

const loadDashboard = async (req, res) => {
  try {
    const name = req.session.admin;
    res.render("admin/dashboard");
  } catch (error) {
    console.log(error.message);
  }
};

const sendDashboardData = async (req, res) => {
  try {
    console.log(req.query);
    const [{ customers }] = await User.aggregate([{ $count: "customers" }]);
    const [{ pendingOrders }] = await Order.aggregate([
      { $match: { status: "Pending" } },
      { $count: "pendingOrders" },
    ]);
    const { time } = req.query;
    let timeFrame = new Date(new Date().setHours(0, 0, 0, 0));
    if (time === "week") {
      timeFrame = new Date(
        new Date().setHours(0, 0, 0, 0) - new Date().getDay() * 86400000
      );
    }
    if (time === "month") {
      timeFrame = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    }
    if (time === "year") {
      timeFrame = new Date(new Date().getFullYear(), 0, 1);
    }

    const paymentMethods = await Order.aggregate([
      { $match: { paymentStatus: "Paid", orderDate: { $gte: timeFrame } } },
      { $group: { _id: "$payment", orderCount: { $sum: 1 } } },
    ]);
    const payment={
      wallet:paymentMethods.find(item=> item._id==="WALLET")?.orderCount ?? 0,
      online:paymentMethods.find(item=> item._id==="ONLINE")?.orderCount ?? 0,
      cod:paymentMethods.find(item=> item._id==="COD")?.orderCount ?? 0
    }
    console.log(payment);
    res
      .status(200)
      .json({ status: "success", customers, pendingOrders, payment });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadDashboard,
  sendDashboardData,
};
