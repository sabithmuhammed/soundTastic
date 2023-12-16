const approveBtn = document.querySelectorAll("[data-approve]");

let modal = new bootstrap.Modal(document.querySelector("#confirm-modal"));
const showConfirm = (event) => {
  const idInput = document.querySelector("#request-id");
  idInput.value = event.target.dataset.id
  modal.show();
};

const returnProduct = async (event) => {
  try {
    const orderId = event.target.dataset.id;
    const rawData = await fetch("/admin/cancel-order", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderId }),
    });
    if (rawData.status === 401) {
      window.location.href = "/admin/login";
    }
    if (rawData.ok) {
      cancelBtn.classList.add("disabled");
      changeStatus.classList.add("disabled");
      statusCol.innerText = "Cancelled";
      orderCancelModal.hide();
    }
  } catch (error) {
    console.error(error.message);
  }
};
approveBtn.forEach((item) => {
  item.addEventListener("click", showConfirm);
});
