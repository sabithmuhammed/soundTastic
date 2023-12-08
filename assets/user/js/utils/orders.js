const cancelBtn = document.querySelector("[data-cancelBtn]");
const sendReqBtn = document.querySelector("[data-sendReqBtn]");
const cancelRequestModal = document.getElementById("order-cancel-modal");
const cancelRequestMessage = document.getElementById("order-cancel-message");
const closeModalBtn = document.querySelectorAll(".confirm-close");

const showModal = (event) => {
  const error = document.querySelector("[data-error]");
  const id = event.currentTarget.dataset.id;
  const idInput = document.querySelector("[data-productId]");
  idInput.value = id;
  error.innerText = "";
  cancelRequestModal.style.display = "block";
};

const sendCancelRequest = async () => {
  try {
    const error = document.querySelector("[data-error]");
    const productId = document.querySelector("[data-productId]").value;
    const orderId = document.querySelector('[data-orderId]').value;
    const cancelStatus = document.querySelector(`[data-cancel="${productId}"]`)
    const cancelBtn = document.querySelector(`[data-id="${productId}"]`)

    const reason = document.querySelector("[data-reason]").value.trim();
    const rawData = await fetch("/cancel-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId, orderId, reason }),
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
        cancelRequestModal.style.display = "none";
        cancelRequestMessage.style.display = "block";
        cancelStatus.innerText="Canceled";
        cancelBtn.remove();
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
  cancelRequestMessage.style.display = "none";
};

cancelBtn.addEventListener("click", showModal);
sendReqBtn.addEventListener("click", sendCancelRequest);
closeModalBtn.forEach((item) => {
  item.addEventListener("click", closeModal);
});
window.addEventListener("click", (event) => {
  if (
    event.target == cancelRequestModal ||
    event.target == cancelRequestMessage
  ) {
    closeModal();
  }
});
