async function customerBlock(item) {
  try {
    const rawData = await fetch(`/admin/customers/${item.id}`);
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
        const alert = document.getElementById('category-alert');
        const data = await rawData.json();
        if (data.status === "success") {
          addInput.value='';
          const tableBody = document.getElementById("table-category");
          const tr = document.createElement("tr");
          console.log(data.result,data.result.name);
          tr.innerHTML = `<td>${data.result.name}</td>
          <td><button class="btn btn-danger btn-list">Unlist</button></td>
          <td><button class="btn btn-dark">Edit</button></td>
          <td><button class="btn btn-danger">Delete</button></td>`;
          tableBody.appendChild(tr);
          alert.innerText="Category added"
          alert.style.visibility='visible'
        }else{
          alert.innerText="Oops something went wrong try again (nb:You cannot add duplicate categories)"
          alert.style.visibility='visible'
        }
        setTimeout(()=>{
          alert.style.visibility='hidden'
        },10000);
      }
    }
  } catch (error) {
    console.error(error.message);
  }
}
async function categoryList(item) {
  try {
    const rawData = await fetch(`/admin/categories/${item.id}`);
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