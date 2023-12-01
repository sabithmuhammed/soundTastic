let categoryModal = null;
let productModal = null;
let confirmModal=null;

function confirmShow(item) {
    const element = document.getElementById("confirm-modal");
    const actionBtn=document.getElementById('action-btn');
    const actionText=document.getElementById('action-text');
    const actionId=document.getElementById('action-id');
    confirmModal = new bootstrap.Modal(element);
    let text=item.innerText
    actionText.innerText=text.toLowerCase();
    actionBtn.innerText=text;
    actionId.value=item.id;
    confirmModal.show();
  
}

async function customerBlock() {
  try {
    const actionId=document.getElementById('action-id');
    const item=document.getElementById(actionId.value)
    const rawData = await fetch(`/admin/block-customer/${item.id}`, {
      method: "PATCH",
    });
    if(rawData.status===401){
      window.location.href="/admin/login"
    }
    if (rawData.ok) {
      const data = await rawData.json();
      item.classList.toggle("btn-danger");
      item.classList.toggle("btn-success");
      item.innerText = data.message;
      confirmModal.hide();

    }
  } catch (error) {
    console.error(error.message);
  }
}
async function addCategory(item) {
  try {
    const addInput = document.getElementById("add-category");
    const categoryName = addInput.value.trim();
    if (categoryName) {
      const rawData = await fetch("/admin/add-category", {
        method: "POST",
        body: JSON.stringify({ categoryName }),
        headers: { "Content-Type": "application/json" },
      });
      if(rawData.status===401){
        window.location.href="/admin/login"
      }
      if (rawData.ok) {
        const alert = document.getElementById("category-alert");
        const data = await rawData.json();
        if (data.status === "success") {
          addInput.value = "";
          const tableBody = document.getElementById("table-category");
          const tr = document.createElement("tr");
          console.log(data.result, data.result.name);
          tr.innerHTML = `<td data-name="${data.result._id}">${data.result.name}</td>
          <td class="justify-content-center d-flex">
            <button
              class="btn btn-list me-2 btn-danger %> btn-block"
              data-id="${data.result._id}"
              onclick="categoryList(this)"
            >
              Unlist
            </button>
            <button class="btn btn-dark" data-id="${data.result._id}" onclick="editCategory(this)">Edit</button>
          </td>`;

          tableBody.appendChild(tr);
          alert.innerText = "Category added";
          alert.style.visibility = "visible";
          alert.style.backgroundColor = "#77dd77";
        } else {
          alert.innerText = data.message;
          alert.style.backgroundColor = "#FAFA33";
          alert.style.visibility = "visible";
        }
        setTimeout(() => {
          alert.style.visibility = "hidden";
        }, 10000);
      }
    } else {
      addInput.value = "";
    }
  } catch (error) {
    console.error(error.message);
  }
}
async function categoryList() {
  try {
    const actionId=document.getElementById('action-id');
    const item=document.getElementById(actionId.value)
    const rawData = await fetch(`/admin/list-category/${item.dataset.id}`, {
      method: "PATCH",
    });
    if(rawData.status===401){
      window.location.href="/admin/login"
    }
    if (rawData.ok) {
      const data = await rawData.json();
      item.classList.toggle("btn-danger");
      item.classList.toggle("btn-success");
      item.innerText = data.message;
      confirmModal.hide();
    }
  } catch (error) {
    console.error(error.message);
  }
}

async function productList() {
  try {
    const actionId=document.getElementById('action-id');
    const item=document.getElementById(actionId.value)
    const rawData = await fetch(`/admin/list-product/${item.dataset.id}`, {
      method: "PATCH",
    });
    if(rawData.status===401){
      window.location.href="/admin/login"
    }
    if (rawData.ok) {
      const data = await rawData.json();
      item.classList.toggle("btn-danger");
      item.classList.toggle("btn-success");
      item.innerText = data.message;
      confirmModal.hide();

    }
  } catch (error) {
    console.error(error.message);
  }
}
function previewImage(event) {
  const input = event.target;
  const image = document.querySelector(`[data-${event.target.id}]`);
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {
      image.src = e.target.result;
    };
    reader.readAsDataURL(input.files[0]);
  }
  image.style.zIndex = "0";
}

function removeWhiteSpace(item) {
  const content = item.value;
  item.value = content.trim();
}
function editCategory(item) {
  const prevName=document.querySelector(`[data-name="${item.dataset.id}"]`).innerText;
  const element = document.getElementById("edit-category-modal");
  const name = document.getElementById("cat-name");
  const error = document.querySelector(".error-modal");
  categoryModal = new bootstrap.Modal(element);
  const catId = document.getElementById("cat-id");
  catId.value = item.dataset.id;
  name.value = prevName;
  error.innerText = "";
  categoryModal.show();
}
async function sendEditRequest() {
  try {
    const id = document.getElementById("cat-id").value;
    const name = document.getElementById("cat-name").value;
    const error = document.querySelector(".error-modal");
    const rawData = await fetch("/admin/edit-category", {
      method: "PUT",
      body: JSON.stringify({ id, name }),
      headers: { "Content-Type": "application/json" },
    });
    if(rawData.status===401){
      window.location.href="/admin/login"
    }

    if (rawData.ok) {
      const data = await rawData.json();
      if (data.status === "success") {
        const catName = document.querySelector(`[data-name="${id}"]`);
        catName.innerText = data.message;
        categoryModal.hide();
      } else {
        error.innerText = data.message;
      }
    }
  } catch (error) {
    console.log(error.message);
  }
}
function addStock(item) {
  const element = document.getElementById("product-stock-modal");
  productModal = new bootstrap.Modal(element);
  const productId = document.getElementById("product-id");
  productId.value = item.dataset.id;
  productModal.show();
}

async function sendStockRequest() {
  try {
    const id = document.getElementById("product-id").value;
    const quantityInput = document.getElementById("product-quantity");
    const quantity = quantityInput.value;
    if (!Number(quantity)) {
      quantityInput.value = "";
      return false;
    }
    const rawData = await fetch("/admin/add-stock", {
      method: "PATCH",
      body: JSON.stringify({ id, quantity }),
      headers: { "Content-Type": "application/json" },
    });
    if(rawData.status===401){
      window.location.href="/admin/login"
    }

    if (rawData.ok) {
      const data = await rawData.json();
      if (data.status === "success") {
        const quantityCount = document.querySelector(`[data-quantity="${id}"]`);
        quantityCount.innerText = data.quantity;
        quantityInput.value = "";
        productModal.hide();
      }
    }
  } catch (error) {
    console.log(error.message);
  }
}

