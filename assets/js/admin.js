let myModal=null;

async function customerBlock(item) {
  try {
    const rawData = await fetch(`/admin/block-customer/${item.id}`);
    if (rawData.ok) {
      const data = await rawData.json();
      item.classList.toggle("btn-danger");
      item.classList.toggle("btn-success");
      item.innerText = data.message;
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
      if (rawData.ok) {
        const alert = document.getElementById("category-alert");
        const data = await rawData.json();
        if (data.status === "success") {
          addInput.value = "";
          const tableBody = document.getElementById("table-category");
          const tr = document.createElement("tr");
          console.log(data.result, data.result.name);
          tr.innerHTML = `<td>${data.result.name}</td>
          <td><button class="btn btn-danger btn-list">Unlist</button></td>
          <td><button class="btn btn-dark">Edit</button></td>
          <td><button class="btn btn-danger">Delete</button></td>`;
          tableBody.appendChild(tr);
          alert.innerText = "Category added";
          alert.style.visibility = "visible";
        } else {
          alert.innerText =
            "Oops something went wrong try again (nb:You cannot add duplicate categories)";
          alert.style.visibility = "visible";
        }
        setTimeout(() => {
          alert.style.visibility = "hidden";
        }, 10000);
      }
    }else{
      addInput.value='';
    }
  } catch (error) {
    console.error(error.message);
  }
}
async function categoryList(item) {
  try {
    const rawData = await fetch(`/admin/list-category/${item.dataset.id}`);
    if (rawData.ok) {
      const data = await rawData.json();
      item.classList.toggle("btn-danger");
      item.classList.toggle("btn-success");
      item.innerText = data.message;
    }
  } catch (error) {
    console.error(error.message);
  }
}

async function productList(item) {
  try {
    const rawData = await fetch(`/admin/list-product/${item.dataset.id}`);
    if (rawData.ok) {
      const data = await rawData.json();
      item.classList.toggle("btn-danger");
      item.classList.toggle("btn-success");
      item.innerText = data.message;
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

function removeWhiteSpace(item){
    const content=item.value;
    item.value=content.trim();
}
function editCategory(item){
    const element=document.getElementById('edit-category-modal');
    myModal=new bootstrap.Modal(element);
    const catId=document.getElementById('cat-id');
    catId.value=item.dataset.id;
    myModal.show()
}
async function sendEditRequest(){
  try {
    const id=document.getElementById('cat-id').value;
    const name=document.getElementById('cat-name').value;

    const rawData=await fetch("/admin/edit-category", {
      method: "POST",
      body: JSON.stringify({ id,name }),
      headers: { "Content-Type": "application/json" },
    });
    
    if(rawData.ok){
      const data=await rawData.json();
      if(data.status==='success'){
        const catName=document.querySelector(`[data-name="${id}"]`);
        catName.innerText=data.message;
        myModal.hide()
      }
    }

  } catch (error) {
    console.log(error.message);
  }
}