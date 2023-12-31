const placeOrderBtn = document.querySelector("[data-placeOrder]");
const checkoutModal = document.querySelector("#checkout-modal");
const closeModal = document.querySelector("[data-checkoutStockClose]");
const error = document.querySelector(`[data-checkoutError]`);
const walletBtn = document.querySelector("[data-wallet]");
const stockModal = document.querySelector("#checkout-stock-modal");
const closeStockModal = document.querySelector("[data-checkStockClose]");
///////
const showCouponBtn = document.querySelector("[data-showCoupon]");
const showCouponClose = document.querySelector("[data-couponCodeClose]");
const couponCodeModal = document.querySelector("#coupon-code-modal");
let copyBtn = null;
const applyBtn = document.querySelector("[data-apply]");
//////
const addressBtn = document.querySelector("[data-add-address]");
const addressCloseBtn = document.querySelector("[data-addressClose]");
const addressModal = document.querySelector("#address-modal");

closeModal.addEventListener("click", () => {
  checkoutModal.style.display = "none";
});
//creting a new address
const form = document.getElementById("checkout-address");
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const mobile = document.getElementById("mobile").value;
  const address = document.getElementById("address").value.trim();
  const city = document.getElementById("city").value.trim();
  const state = document.getElementById("state").value.trim();
  const pincode = document.getElementById("pincode").value;
  const error = document.getElementById("error");
  if (!name || !mobile || !address || !city || !state || !pincode) {
    return (error.innerText = "Please fill all the fields");
  }

  if (!/^[a-z ,.'-]+$/i.test(name)) {
    return (error.innerText = "Invalid name");
  }
  if (!/^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/.test(mobile)) {
    return (error.innerText = "Invalid phone number");
  }
  if (!/^[1-9]{1}[0-9]{2}\s{0,1}[0-9]{3}$/.test(pincode)) {
    return (error.innerText = "Invalid pin code");
  }
  const rawData = await fetch("/add-address", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, mobile, city, address, state, pincode }),
  });

  if (rawData.status === 401) {
    window.location.href = "/login";
  }
  if (rawData.status === 403) {
    window.location.href = "/user-blocked";
  }

  if (rawData.ok) {
    const data = await rawData.json();
    if (data.status === "success") {
      return window.location.reload();
    }
  }
  return (error.innerText = "Something went wrong try again");
});

const createListEl = ({ name, stock }) => {
  const li = document.createElement("li");
  const span = document.createElement("span");
  span.textContent = stock <= 0 ? `OUT OF STOCK` : `ONLY ${stock} IN STOCK`;
  li.textContent = `${name} - `;
  li.appendChild(span);
  return li;
};

//checking stock
const checkStock = async () => {
  try {
    const checkOutStock = document.querySelector("#checkout-stock");
    checkOutStock.innerHTML = "";
    const rawData = await fetch("/check-stock");

    if (rawData.status === 401) {
      window.location.href = "/login";
    }
    if (rawData.status === 403) {
      window.location.href = "/user-blocked";
    }

    if (rawData.ok) {
      const data = await rawData.json();
      if (data.status === "success") {
        if (data.data.length) {
          data.data.forEach((item) => {
            const li = createListEl(item);
            checkOutStock.appendChild(li);
          });
          stockModal.style.display = "block";
        } else {
          return true;
        }
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};
//onlinePayment success function
const verifyOnlinePayment = async (details, order) => {
  try {
    const rawData = await fetch("/verify-payment", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ details, order }),
    });
    if (rawData.ok) {
      const data = await rawData.json();
      if (data.status === "success") {
        return (window.location.href = "/order-success");
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};
//razorpay payment function
const razorpayPayment = (order, userData) => {
  var options = {
    key: "rzp_test_ek96OXEhD4RQx2", // Enter the Key ID generated from the Dashboard
    amount: order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
    currency: "INR",
    name: "soundtastic",
    description: "Purchase from soundtastic",
    image: "/images/logos/logo.png",
    order_id: order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
    handler: function (response) {
      verifyOnlinePayment(response, order);
    },
    prefill: {
      name: userData.name,
      email: userData.email,
      contact: userData.phone,
    },
    notes: {
      address: "Manachira,Calicut,Kerala,PIN-676453",
    },
    theme: {
      color: "#3399cc",
    },
  };
  var rzp1 = new Razorpay(options);
  rzp1.on("payment.failed",async function (response) {
    await fetch("payment-unsuccessful",{
      method:"DELETE",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify(order)
    })
  });
  rzp1.open();
};

//placing order
const placeOrder = async () => {
  try {
    if (!(await checkStock())) {
      return;
    }

    const addressId = document.querySelector(
      `input[name="address"]:checked`
    )?.value;
    const payment = document.querySelector(
      `input[name="payment-method"]:checked`
    )?.value;
    const coupon = document.querySelector("[data-coupon-name]").innerText;
    const useWallet = walletBtn?.checked;
    if (!addressId) {
      error.innerText = "Please select an address";
      return (checkoutModal.style.display = "block");
    }
    const rawData = await fetch("/place-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ addressId, payment, coupon, useWallet }),
    });
    if (rawData.status === 401) {
      window.location.href = "/login";
    }
    if (rawData.status === 403) {
      window.location.href = "/user-blocked";
    }

    const data = await rawData.json();
    if (rawData.ok) {
      if (data.status === "success") {
        return (window.location.href = "/order-success");
      }
      if (data.status === "pending") {
        console.log(data.order);
        razorpayPayment(data.order, data.userData);
        return;
      }
    }
    error.innerHTML = data.message;
    checkoutModal.style.display = "block";
  } catch (error) {
    console.log(error.message);
  }
};

//function to use wallet amount
const controlWallet = () => {
  const walletShow = document.querySelector("[data-walletShow]");
  const paymentMethods = document.querySelectorAll('[data-payment]')
  const walletAmount = Number(
    document.querySelector("[data-walletCurrent]").innerText
  );
  const totalContainer = document.querySelector("[data-total]");
  const totalAmount = Number(totalContainer.innerText);
  const walletUsed = document.querySelector("[data-walletUsed]");
  if (walletBtn.checked) {
    if (walletAmount > totalAmount) {
      totalContainer.innerText = 0;
      walletUsed.innerText = totalAmount;
      paymentMethods[0].classList.add('hide')
      paymentMethods[1].classList.add('hide')
      paymentMethods[2].classList.remove('hide')
    } else {
      totalContainer.innerText = totalAmount - walletAmount;
      walletUsed.innerHTML = walletAmount;
    }
    walletShow.style.visibility = "visible";
  } else {
    totalContainer.innerText = totalAmount + Number(walletUsed.innerText);
    walletShow.style.visibility = "hidden";
    paymentMethods[0].classList.remove('hide')
    paymentMethods[1].classList.remove('hide')
    paymentMethods[2].classList.add('hide')
  }
};
window.addEventListener("click", (event) => {
  if (event.target == stockModal) {
    stockModal.style.display = "none";
  }
  if (event.target == checkoutModal) {
    checkoutModal.style.display = "none";
  }
  if (event.target == couponCodeModal) {
    couponCodeModal.style.display = "none";
  }
  if (event.target == addressModal) {
    addressModal.style.display = "none";
  }
});
////////////////////////////////////////

const showCouponModal = async () => {
  try {
    couponCodeModal.style.display = "block";
    const rawData = await fetch("/get-coupons");
    if (rawData.ok) {
      const data = await rawData.json();
      if (data.status === "success") {
        const coupons = data.coupons;
        const couponDiv = document.querySelector("[data-couponDiv]");
        if (coupons && coupons.length) {
          couponDiv.innerHTML = "";
          coupons.forEach((item) => {
            const p = document.createElement("p");
            p.setAttribute("class", "coupon-min");
            p.innerHTML = `Purchases above &#8377;${item.minimumSpend.$numberDecimal} (discount : &#8377;${item.discountAmount.$numberDecimal})`;
            const div = document.createElement("div");
            div.setAttribute("class", "coupons d-flex");
            div.innerHTML = `<input type="text" name="" id="" class="coupon-input" value="${item.code}" readonly data-coupon="${item._id}">
              <button class="btn-coupon-copy" data-id="${item._id}"><i class="fa-regular fa-copy"></i></button>`;
            couponDiv.appendChild(p);
            couponDiv.appendChild(div);
          });
          copyBtn = document.querySelectorAll(".btn-coupon-copy");
          copyBtn.forEach((item) => {
            item.addEventListener("click", couponCopy);
          });
        }else{
          couponDiv.innerHTML = "No Coupons Available";
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const couponCopy = (event) => {
  const id = event.currentTarget.dataset.id;
  const coupon = document.querySelector(`[data-coupon="${id}"]`);
  // Select the text field
  coupon.select();
  coupon.setSelectionRange(0, 99999); // For mobile devices
  // Copy the text inside the text field
  navigator.clipboard.writeText(coupon.value);
  document.getSelection().removeAllRanges();
  event.currentTarget.innerHTML = `<i class="fa-solid fa-clipboard-check"></i>`;
  const btn = event.currentTarget;
  setTimeout(() => {
    btn.innerHTML = `<i class="fa-regular fa-copy"></i>`;
  }, 3000);
};

const applyCoupon = async () => {
  try {
    const error = document.querySelector("[data-couponError]");
    const couponCode = document.querySelector("[data-couponInput]");
    const code = couponCode.value.trim();
    if (!code) {
      return (error.innerText = "Please enter a coupon code");
    }
    const rawData = await fetch("/apply-coupon", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });
    if(rawData.status===422 || rawData.status===404){
      const data=await rawData.json();
      return error.innerText=data.message
    }
    if (rawData.ok) {
      const data = await rawData.json();
      if (data.status === "success") {
        const error = document.querySelector("[data-couponError]");
        const couponInput = document.querySelector("[data-couponInputDiv]");
        const couponDiscountDiv = document.querySelector(
          "[data-couponDeduction]"
        );
        const hiddenTotal = document.querySelector("[data-total-hidden]");
        const totalShow = document.querySelector("[data-total]");
        if (Number(hiddenTotal.value) < data.couponData.minimum) {
          console.log(hiddenTotal.value, data.couponData.minimum);
          return (error.innerHTML = `Coupon is only applicable for purchases totaling &#8377;${data.couponData.minimum} or more`);
        }
        let total = Number(hiddenTotal.value) - data.couponData.discount;
        document.querySelector("[data-coupon-name]").innerText =
          data.couponData.code;
        document.querySelector("[data-coupon-amount]").innerText =
          data.couponData.discount;
        totalShow.innerText = total;
        couponInput.classList.toggle("hidden");
        couponDiscountDiv.classList.toggle("hidden");
        controlWallet();
        const couponRemove = document.querySelector("[data-coupon-remove]");
        couponRemove.addEventListener("click", () => {
          error.innerText = null;
          couponInput.classList.remove("hidden");
          couponDiscountDiv.classList.add("hidden");
          totalShow.innerText = Number(hiddenTotal.value);
          document.querySelector("[data-coupon-name]").innerText =""
          controlWallet();
        });
      }
    }
    
  } catch (error) {
    console.log(error);
  }
};


const showAddressModal = ()=>{
  addressModal.style.display="block"
}
addressCloseBtn.addEventListener('click',()=>{
  addressModal.style.display="none"
})

walletBtn?.addEventListener("click", controlWallet);
placeOrderBtn.addEventListener("click", placeOrder);
closeStockModal?.addEventListener("click", () => {
  stockModal.style.display = "none";
});

showCouponBtn.addEventListener("click", showCouponModal);
showCouponClose.addEventListener("click", () => {
  couponCodeModal.style.display = "none";
});

applyBtn.addEventListener("click", applyCoupon);
addressBtn.addEventListener('click',showAddressModal)
