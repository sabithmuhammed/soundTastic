const cancelBtn = document.querySelector("[data-cancelBtn]");
const sendReqBtn = document.querySelector("[data-sendReqBtn]");
const cancelRequestModal = document.getElementById("order-cancel-modal");
const closeModalBtn = document.querySelector(".confirm-close");

const showModal = (event) => {
  const error = document.querySelector("[data-error]");
  const id = event.currentTarget.dataset.id;
  const idInput = document.querySelector("[data-orderId]");
  idInput.value = id;
  error.innerText = "";
  cancelRequestModal.style.display = "block";
};

const sendCancelRequest = async () => {
  try {
    const error = document.querySelector("[data-error]");
    const orderId = document.querySelector("[data-orderId]").value;
    console.log(orderId);
    const reason = document.querySelector("[data-reason]").value.trim();
    if (!reason) {
      return (error.innerText = "Field can't be empty");
    }

    const rawData = await fetch("/cancel-request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderId, reason }),
    });
    const data = await rawData.json();
    if (rawData.ok) {
      if (data.status === "success") {
        cancelRequestModal.style.display = "none";
        return;
      }
    }
    error.innerText = data.message;
  } catch (error) {
    console.error(error.message);
  }
};

const closeModal = () => {
  cancelRequestModal.style.display = "none";
};

cancelBtn.addEventListener("click", showModal);
sendReqBtn.addEventListener("click", sendCancelRequest);
closeModalBtn.addEventListener("click", closeModal);
window.addEventListener("click", (event) => {
  if (event.target == cancelRequestModal) {
    closeModal();
  }
});
