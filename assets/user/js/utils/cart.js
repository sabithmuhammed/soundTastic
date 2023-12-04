const btnMinus = document.querySelectorAll("[data-btnCartMinus]");
const btnPlus = document.querySelectorAll("[data-btnCartPlus]");
const cartConfirm = document.querySelectorAll("[data-cartConfirm]");
const cartModal = document.querySelector("#cart-confirm-modal");
const stockModal = document.querySelector("#checkout-stock-modal");
const closeCartModal = document.querySelectorAll("[data-cartModalClose]");
const closeStockModal = document.querySelector("[data-checkoutStockClose]");
const cartDelete = document.querySelector("[data-cartDelete]");
const checkout = document.querySelector("[data-checkout]");
// funcion for change cart quantity
const changeCartQuantity = async (event, operation) => {
  try {
    const productId = event.currentTarget.dataset.id;
    const input = document.querySelector(`[data-input="${productId}"]`);
    const total = document.querySelectorAll(`[data-total]`);
    const price = document.querySelector(`[data-prodAmount="${productId}"]`);
    //exiting when try to decrease quantity below zero
    if (input.value <= 1 && operation === -1) {
      return false;
    }
    const rawData = await fetch("/change-cart-quantity", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId,
        operation,
        curQuantity: input.value,
      }),
    });

    if(rawData.status===401){
      window.location.href="/login"
    }
    if(rawData.status===403){
      window.location.href="/user-blocked"
    }
    if(rawData.status===422){
    stockModal.style.display = "block";
    }

    if (rawData.ok) {
      const data = await rawData.json();
      if (data?.status === "success") {
        input.value = data?.data?.product?.quantity ?? input.value;
        total[0].innerText = data.data.total;
        total[1].innerText = data.data.total;
        price.innerText = data.data.price;
      }
    }
  } catch (error) {
    console.error(error.message);
  }
};

//show warning when pressed remove from cart
const showCartModal = (event) => {
  const confirmDiv = document.querySelector(".warning-div");
  const messageDiv = document.querySelector(".message-div");
  const productId = event.currentTarget.dataset.id;
  cartDelete.dataset.id = productId;
  confirmDiv.style.display = "block";
  messageDiv.style.display = "none";
  cartModal.style.display = "block";
};

//hide cart modal when pressed close button
const cartClose = () => {
  cartModal.style.display = "none";
};

//hide cart modal when pressed outside of the modal
window.onclick = function (event) {
  if (event.target == cartModal) {
    cartModal.style.display = "none";
  }
  if (event.target == stockModal) {
    stockModal.style.display = "none";
  }
};

//fetch request for remove item from cart
const removeFromCart = async (event) => {
  try {
    const confirmDiv = document.querySelector(".warning-div");
    const messageDiv = document.querySelector(".message-div");
    const cartCount = document.querySelector("[data-cartQuantity]");
    const productId = event.currentTarget.dataset.id;
    const row = document.querySelector(`[data-cartCard="${productId}"]`);
    const itemCount = document.querySelectorAll(".item-count");
    const quantity = document.querySelector(
      `[data-input="${productId}"]`
    ).value;
    const rawData = await fetch("/cart-remove", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId, quantity }),
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
        confirmDiv.style.display = "none";
        messageDiv.style.display = "block";
        const { items, total } = data.data;
        if (items) {
          row.remove();
          if (items > 1) {
            itemCount[0].innerText = `${items} Items`;
            itemCount[1].innerText = `ITEMS ${items}`;
          } else {
            itemCount[0].innerText = `1 Item`;
            itemCount[1].innerText = `ITEM 1`;
          }
          cartCount.innerText = items;
        } else {
          const cartBody = document.querySelector(".cart");
          cartBody.innerHTML = `<div class="col-md-12 item-center">
            <div class="d-flex flex-column align-center">
              <div class="cart-empty-image item-center">
                <h3>Your cart is empty!</h3>
              </div>
              <a href="/shop">SHOP NOW</a>
            </div>
          </div>`;
          cartCount.style.display = "none";
        }
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};
const createListEl = ({ name, stock }) => {
  const li = document.createElement("li");
  const span = document.createElement("span");
  span.textContent = stock <= 0 ? `OUT OF STOCK` : `ONLY ${stock} IN STOCK`;
  li.textContent = `${name} - `;
  li.appendChild(span);
  return li;
};

const checkStock = async (event) => {
  try {
    const checkOutStock = document.querySelector("#checkout-stock");
    checkOutStock.innerHTML = "";
    const rawData = await fetch("/check-stock");

    if(rawData.status===401){
      window.location.href="/login"
    }
    if(rawData.status===403){
      window.location.href="/user-blocked"
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
          window.location.href="/checkout"
        }
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};
closeStockModal?.addEventListener("click", () => {
  stockModal.style.display = "none";
});

//adding eventlisteners to cart minus button
btnMinus?.forEach((item) => {
  item.addEventListener("click", (event) => {
    changeCartQuantity(event, -1);
  });
});

//adding eventlisteners to cart plus button
btnPlus?.forEach((item) => {
  item.addEventListener("click", (event) => {
    changeCartQuantity(event, 1);
  });
});

//adding eventlisteners to remove button (showing warning modal)
cartConfirm?.forEach((item) => {
  item.addEventListener("click", showCartModal);
});

//adding eventlisteners to close/ok button (hiding modal)
closeCartModal?.forEach((item) => {
  item.addEventListener("click", cartClose);
});

//adding event listener for deleting from cart ( button is inside modal )
cartDelete?.addEventListener("click", removeFromCart);

checkout?.addEventListener("click", checkStock);
