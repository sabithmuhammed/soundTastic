const addWishlistBtn = document.querySelectorAll("[data-addToWishlist]");

const wishlist = async (event) => {
  try {
    event.stopPropagation();
    const element = event.currentTarget;
    const productId = element.dataset.id;
    const wishQuantity = document.querySelector("[data-wishlistQuantity]");
    let url = "";
    let method = "";

    //changing url and method if the product exist in wishlist
    if (element.dataset.status === "false") {
      url = "/add-to-wishlist";
      method = "POST";
    } else {
      url = "/remove-from-wishlist";
      method = "DELETE";
    }
    //fetch request to update wishlist
    const rawData = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId }),
    });
    //go to login if not logged in
    if (rawData.status === 401) {
      window.location.href = "/login";
    }

    // go to block page if user is blocked
    if (rawData.status === 403) {
      window.location.href = "/user-blocked";
    }
    if (rawData.ok) {
      const data = await rawData.json();
      if (data.status === "success") {
        // do this if the button is not in product page(changing color of heart icon)
        if (!element.dataset.prodpage) {
          if (element.dataset.status === "false") {
            element.innerHTML = `<i class="fa fa-heart-o"></i>`;
          } else {
            element.innerHTML = `<i class="fa-regular fa-heart"></i>`;
          }
          element.classList.toggle("wishlist-active");
        } else {
          //product page button changes 
          if (element.dataset.status === "false") {
            element.innerText = `REMOVE FROM WISHLIST`;
          } else {
            element.innerText = `ADD TO WISHLIST`;
          }
        }
        //interchange the data-attribute value if you added or removed product from wishlist
        element.dataset.status =
          element.dataset.status === "false" ? "true" : "false";
        wishQuantity.innerText = data.wishlistCount;
        //wishlist count
        if (data.wishlistCount) {
          wishQuantity.style.display = "block";
        } else {
          wishQuantity.style.display = "none";
        }
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

addWishlistBtn?.forEach((item) => {
  item.addEventListener("click", wishlist);
});
