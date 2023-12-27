let salesChart = null;
let paymentChart = null;
let categoryChart = null;
let productChart = null;
const fetchDashBoardData = async (timeFrame) => {
  const rawData = await fetch(`/admin/dashboard-data?time=${timeFrame}`);
  if (rawData.ok) {
    const data = await rawData.json();
    if (data.status === "success") {
      const {customers, pendingOrders, payment,products,category,sales } = data;
      document.querySelector("[data-customer]").innerText = customers;
      document.querySelector("[data-pending]").innerText = pendingOrders;
      document.querySelector("[data-sales-total]").innerText = sales.totalAmount;
      
      
      console.log(products)
      salesGraph(sales);
      paymentGraph(payment);
      categoryGraph(category);
      productGraph(products);
    }
  }
};

const salesGraph = ({orderCount,label}) => {
  const sales = document.getElementById("sales-chart");

  if (salesChart) {
    salesChart.destroy();
  }

  salesChart = new Chart(sales, {
    type: "line",
    data: {
      labels: label,
      datasets: [
        {
          label: "Orders",
          data: orderCount,
          borderWidth: 1,
          borderColor: "white",
          backgroundColor: "white",
        },
      ],
    },
    options: {
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            color: "rgb(224, 224, 224)", // Change x-axis label color here
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: "rgb(224, 224, 224)", // Change y-axis label color here
          },
        },
      },
      plugins: {
        legend: {
          display: true,
          labels: {
            color: "rgb(224, 224, 224)", // Change legend label color here
          },
        },
      },
    },
  });
};

const paymentGraph = (data) => {
  const payment = document.getElementById("payment-chart");

  if (paymentChart) {
    paymentChart.destroy();
  }
  paymentChart = new Chart(payment, {
    type: "doughnut",
    data: {
      labels: ["COD", "Online", "Wallet"],
      datasets: [
        {
          label: "Orders",
          data: [data.cod, data.online, data.wallet],
          borderWidth: 2,
          backgroundColor: [
            "rgb(22,140,100)",
            "rgb(82,119,158)",
            "rgb(132,133,142)",
          ],
          borderColor:"#08686B"
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          display: true,
          labels: {
            color: "rgb(224, 224, 224)", // Change label color here
          },
        },
      },
    },
  });
};

const categoryGraph = (data) => {
  const category = document.getElementById("category-chart");

  if (categoryChart) {
    categoryChart.destroy();
  }
  categoryChart = new Chart(category, {
    type: "doughnut",
    data: {
      labels: ["Wired", "Wireless", "Truly Wireless", "Speakers"],
      datasets: [
        {
          label: "",
          data: [data.wired,data.wireless,data.trulyWireless,data.speakers],
          borderWidth: 2,
          backgroundColor: [
            "rgb(236,164,160",
            "rgb(38,156,209)",
            "rgb(160,162,198)",
            "rgb(157,115,163)",
          ],
          borderColor:"#08686B"
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          display: true,
          labels: {
            color: "rgb(224, 224, 224)", // Change label color here
          },
        },
      },
    },
  });
};

const productGraph = ({productName,productCount}) => {
  const product = document.getElementById("products-chart");
  if (productChart) {
    productChart.destroy();
  }
  productChart = new Chart(product, {
    type: "bar",
    data: {
      labels: productName,
      datasets: [
        {
          label: "Quantity sold",
          data: productCount,
          borderWidth: 1,
          borderColor: "white",
          backgroundColor: [
            "rgb(236,164,160",
            "rgb(38,156,209)",
            "rgb(160,162,198)",
            "rgb(157,115,163)",
            "rgb(222,228,233)",
          ],
        },
      ],
    },
    options: {
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            color: "rgb(224, 224, 224)", // Change x-axis label color here
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: "rgb(224, 224, 224)", // Change y-axis label color here
          },
        },
      },
      plugins: {
        legend: {
          display: true,
          labels: {
            color: "rgb(224, 224, 224)", // Change legend label color here
          },
        },
      },
    },
  });
};

window.addEventListener("load", () => {
  fetchDashBoardData("today");
});

const timeBtns = document.querySelectorAll("[data-time]");
timeBtns.forEach((item) => {
  item.addEventListener("click", (event) => {
    timeBtns.forEach((item) => {
      item.classList.remove("time-frame-active");
    });
    fetchDashBoardData(event.currentTarget.dataset.time);
    event.currentTarget.classList.add("time-frame-active");
  });
});
