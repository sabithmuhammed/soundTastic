(function ($) {
  "use strict";

  // Mobile Nav toggle
  $(".menu-toggle > a").on("click", function (e) {
    e.preventDefault();
    $("#responsive-nav").toggleClass("active");
  });

  // Fix cart dropdown from closing
  $(".cart-dropdown").on("click", function (e) {
    e.stopPropagation();
  });
})(jQuery);

const path = window.location.pathname;
const all = document.querySelectorAll(".nav li");
all.forEach((item) => {
  if (item.lastChild.href.includes(`${path}`)) {
    item.classList.add("active");
  }
});

const lModal = document.querySelector("#login-modal");
const lClose = document.querySelector("#login-close");
const cModal = document.querySelector("#cart-modal");
const cClose = document.querySelector("#cart-close");

function showLogin() {
  lModal.style.display = "block";
}
lClose.onclick = function () {
  lModal.style.display = "none";
};
cClose.onclick = function () {
  cModal.style.display = "none";
};
window.onclick = function (event) {
  if (event.target == lModal) {
    lModal.style.display = "none";
  }
  if (event.target == cModal) {
    cModal.style.display = "none";
  }
};

const addTOCart = async (event) => {
  try {
    event.stopPropagation();
    const cartCount = document.querySelector("[data-cartQuantity]");
	const modalMessage=document.querySelector("#add-to-cart-msg");
    const productId = event.target.dataset.id;
    const rawData = await fetch("/add-to-cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId }),
    });
    if (rawData.ok) {
      const data = await rawData.json();
      if (data.status === "success") {
		cartCount.classList.add("qty");
        cartCount.innerText = data.count;
		modalMessage.innerText=data.message
        cModal.style.display = "block";
      } else {
		modalMessage.innerText=data.message
        cModal.style.display = "block";
      }
    }
  } catch (error) {}
};
const addCartBtn = document.querySelectorAll("[data-addToCart]");
addCartBtn.forEach((item) => {
  item.addEventListener("click", addTOCart);
});
