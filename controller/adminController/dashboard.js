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
    const customerArray = await User.aggregate([{ $count: "customers" }]);
    const pendingArray = await Order.aggregate([
      { $match: { status: "Pending" } },
      { $count: "pendingOrders" },
    ]) ;
    let pendingOrders = 0
    let customers = 0;

    if(pendingArray.length){
      [{pendingOrders}] = pendingArray
    }
    if(customerArray.length){
      [{customers}] = customerArray
    }
    const { time } = req.query;
    let timeFrame = new Date(new Date().setHours(0, 0, 0, 0));
    let pipeline = [
      {
        $match: {
          paymentStatus: "Paid",
          orderDate: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
            $lte: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      },
      {
        $group: {
          _id: null, // Group all documents
          totalAmount: { $sum: "$finalAmount" },
          orderCount: { $sum: 1 }, // Count the number of orders
        },
      },
      {
        $project: {
          _id: 0, // Exclude _id field
          totalAmount: 1,
          orderCount: 1,
          label: "Today",
        },
      },
    ];
    if (time === "week") {
      timeFrame = new Date(
        new Date().setHours(0, 0, 0, 0) - new Date().getDay() * 86400000
      );
      pipeline = [
        {
          $match: {
            paymentStatus: "Paid",
            orderDate: {
              $gte: new Date(new Date().setHours(0, 0, 0, 0)),
              $lte: new Date(new Date().setHours(23, 59, 59, 999)),
            },
          },
        },
        {
          $group: {
            _id: { $dayOfWeek: "$orderDate" }, // Group by day of the week
            totalAmount: { $sum: "$finalAmount" },
            orderCount: { $sum: 1 }, // Count the number of orders
          },
        },
        {
          $project: {
            _id: 0, // Exclude _id field
            label: "$_id", // Rename _id to dayOfWeek
            totalAmount: 1,
            orderCount: 1,
          },
        },
        {
          $sort: { label: 1 },
        },
      ];
    }
    if (time === "month") {
      timeFrame = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      pipeline = [
        {
          $match: {
            paymentStatus: "Paid",
            orderDate: {
              $gte: new Date(new Date().setDate(1)),
              $lte: new Date(new Date().setHours(23, 59, 59, 999)),
            },
          },
        },
        {
          $group: {
            _id: { $dayOfMonth: "$orderDate" }, // Group by day of the month
            totalAmount: { $sum: "$finalAmount" },
            orderCount: { $sum: 1 }, // Count the number of orders
          },
        },
        {
          $project: {
            _id: 0, // Exclude _id field
            label: "$_id", // Rename _id to dayOfMonth
            totalAmount: 1,
            orderCount: 1,
          },
        },
        {
          $sort: { label: 1 },
        },
      ];
    }
    if (time === "year") {
      timeFrame = new Date(new Date().getFullYear(), 0, 1);
      pipeline = [
        {
          $match: {
            paymentStatus: "Paid",
            orderDate: {
              $gte: new Date(new Date().setMonth(0, 1)),
              $lte: new Date(new Date().setHours(23, 59, 59, 999)),
            },
          },
        },
        {
          $group: {
            _id: { $month: "$orderDate" }, // Group by month
            label: { $sum: "$finalAmount" },
            totalAmount: { $sum: "$finalAmount" },
            orderCount: { $sum: 1 }, // Count the number of orders
          },
        },
        {
          $project: {
            _id: 0, // Exclude _id field
            label: "$_id", // Rename _id to month
            totalAmount: 1,
            orderCount: 1,
          },
        },
        {
          $sort: { label: 1 },
        },
      ];
    }

    const paymentMethods = await Order.aggregate([
      { $match: { paymentStatus: "Paid", orderDate: { $gte: timeFrame } } },
      { $group: { _id: "$payment", orderCount: { $sum: 1 } } },
    ]);
    const payment = {
      wallet:
        paymentMethods.find((item) => item._id === "WALLET")?.orderCount ?? 0,
      online:
        paymentMethods.find((item) => item._id === "ONLINE")?.orderCount ?? 0,
      cod: paymentMethods.find((item) => item._id === "COD")?.orderCount ?? 0,
    };

    const productDetails = await Order.aggregate([
      { $match: { paymentStatus: "Paid", orderDate: { $gte: timeFrame } } },
      {
        $unwind: "$products",
      },
      { $project: { products: 1 } },
      {
        $group: {
          _id: "$products.productId",
          count: { $sum: "$products.quantity" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $project: { "productDetails.name": 1, count: 1 },
      },
    ]);
    const products = {
      productName: [],
      productCount: [],
    };

    productDetails.forEach((item) => {
      products.productName.push(item.productDetails[0].name);
      products.productCount.push(item.count);
    });

    const categoryDetails = await Order.aggregate([
      { $match: { paymentStatus: "Paid", orderDate: { $gte: timeFrame } } },
      { $unwind: "$products" },
      { $project: { "products.productId": 1, "products.quantity": 1, _id: 0 } },
      {
        $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "productDetails.category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $addFields: { categoryName: "$category.name" } },
      { $project: { categoryName: 1, products: 1 } },
      { $unwind: "$categoryName" },
      {
        $group: { _id: "$categoryName", count: { $sum: "$products.quantity" } },
      },
    ]);
    const category = {
      speakers:
        categoryDetails.find((item) => item._id === "Speakers")?.count ?? 0,
      wireless:
        categoryDetails.find((item) => item._id === "Wireless")?.count ?? 0,
      trulyWireless:
        categoryDetails.find((item) => item._id === "truely wireless")?.count ??
        0,
      wired: categoryDetails.find((item) => item._id === "Wired")?.count ?? 0,
    };

    const salesDetails = await Order.aggregate(pipeline);

    const sales = {
      totalAmount: 0,
      orderCount: [],
      label: [],
    };
    sales.totalAmount = salesDetails.reduce((acc, { totalAmount }) => {
      return acc + Number(totalAmount);
    }, 0);
    sales.orderCount = salesDetails.map(({ orderCount }) => orderCount);
    sales.label = salesDetails.map(({ label }) => label);

    res.status(200).json({
      status: "success",
      customers,
      pendingOrders,
      payment,
      products,
      category,
      sales,
    });
  } catch (error) {
    console.log(error.message);
  }
};
const loadSales = async (req, res) => {
  try {
    res.render("admin/sales");
  } catch (error) {
    console.log(error.message);
  }
};
const generateSalesReport = async (req, res) => {
  try {
    const { from, to } = req.query;
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const salesReport = await Order.aggregate([
      {
        $match: {
          $and: [
            { orderDate: { $gte: fromDate } },
            { orderDate: { $lte: toDate } },
          ],
        },
      },
      {$lookup:{from:"users",localField:"userId",foreignField:"_id",as:"userName"}},
    ]);
    res.status(200).json({ status: "success", salesReport });
  } catch (error) {
    console.log(error.message);
  }
};
module.exports = {
  loadDashboard,
  sendDashboardData,
  loadSales,
  generateSalesReport,
};
