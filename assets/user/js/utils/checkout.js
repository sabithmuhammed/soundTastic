const placeOrderBtn = document.querySelector("[data-placeOrder]");
const checkoutModal = document.querySelector("#checkout-modal");
const closeModal = document.querySelector("[data-checkoutStockClose]");
const error = document.querySelector(`[data-checkoutError]`);
const walletBtn = document.querySelector("[data-wallet]");

window.onclick = function (event) {
  if (event.target == checkoutModal) {
    checkoutModal.style.display = "none";
  }
};
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

  if(rawData.status===401){
    window.location.href="/login"
  }
  if(rawData.status===403){
    window.location.href="/user-blocked"
  }

  if (rawData.ok) {
    const data = await rawData.json();
    if (data.status === "success") {
      return window.location.reload();
    }
  }
  return (error.innerText = "Something went wrong try again");
});

//placing order
const placeOrder = async () => {
  try {
    const addressId = document.querySelector(
      `input[name="address"]:checked`
    )?.value;
    const payment = document.querySelector(
      `input[name="payment-method"]:checked`
    )?.value;
    const coupon = null;
    const useWallet =walletBtn?.checked
    if (!addressId) {
      error.innerText = "Please select an address";
      return (checkoutModal.style.display = "block");
    }
    if (payment === "online") {
    }
    const rawData = await fetch("/place-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ addressId, payment, coupon ,useWallet}),
    });
    if(rawData.status===401){
      window.location.href="/login"
    }
    if(rawData.status===403){
      window.location.href="/user-blocked"
    }

    const data = await rawData.json();
    if (rawData.ok) {
      if (data.status === "success") {
        return (window.location.href = "/order-success");
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
  const walletAmount = Number(
    document.querySelector("[data-walletCurrent]").innerText
  );
  const totalContainer = document.querySelector("[data-total]");
  const totalAmount = Number(totalContainer.innerText);
  const walletUsed = document.querySelector("[data-walletUsed]");
  if (walletBtn.checked) {
    if (walletAmount > totalAmount) {
      totalContainer.innerText= 0;
      walletUsed.innerText = totalAmount;
    } else {
      totalContainer.innerText = totalAmount - walletAmount;
      walletUsed.innerHTML = walletAmount;
    }
    walletShow.style.visibility = "visible";
  } else {
    totalContainer.innerText = totalAmount + Number(walletUsed.innerText);
    walletShow.style.visibility = "hidden";
  }
};

walletBtn?.addEventListener("click", controlWallet);
placeOrderBtn.addEventListener("click", placeOrder);
