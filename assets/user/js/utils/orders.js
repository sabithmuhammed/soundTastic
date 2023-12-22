const cancelBtn = document.querySelectorAll("[data-cancelBtn]");
const sendReqBtn = document.querySelector("[data-sendReqBtn]");
const cancelRequestModal = document.getElementById("order-cancel-modal");
const cancelRequestMessage = document.getElementById("order-cancel-message");
const closeModalBtn = document.querySelectorAll(".confirm-close");

const returnBtn = document.querySelectorAll("[data-returnBtn]");
const returnReqbtn = document.querySelector("[data-returnReqBtn]");
const returnRequestModal = document.getElementById("order-return-modal");
const returnRequestMessage = document.getElementById("order-return-message");

const showModal = (event,modal) => {
  const id = event.currentTarget.dataset.id;
  const idInput = document.querySelectorAll("[data-productId]");
  idInput.forEach((item)=>{
    item.value = id;
  })
  modal.style.display = "block";
};

const sendCancelRequest = async () => {
  try {
    const error = document.querySelector("[data-error]");
    const productId = document.querySelector("[data-productId]").value;
    const orderId = document.querySelector("[data-orderId]").value;
    const cancelStatus = document.querySelector(`[data-cancel="${productId}"]`);
    const cancelBtn = document.querySelector(`[data-id="${productId}"]`);

    const reason = document.querySelector("[data-reason]").value.trim();
    const rawData = await fetch("/cancel-order", {
      method: "PATCH",
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
        cancelStatus.innerText = "Canceled";
        cancelBtn?.remove();
        document.querySelector("[data-finalAmount]").innerText =
          data.finalAmount;
        const wallet = document.querySelector("[data-wallet]");
        if (data.walletUsed) {
          wallet.innerHTML = `-&#8377;${data.walletUsed}`;
        } else {
          wallet.innerHTML = `&#8377;0`;
        }
        if (!data.couponId) {
          document.querySelector("[data-coupon]").remove();
        }

        return;
      }
    }
    error.innerText = data.message;
  } catch (error) {
    console.error(error.message);
  }
};

const sendReturnRequest = async(event)=>{
  const error = document.querySelector("[data-returnError]");
  const productId = document.querySelector("[data-productId]").value;
  const orderId = document.querySelector("[data-orderId]").value;
  const reason = document.querySelector("#return-reason").value;
  if(!reason){
    return error.innerText = "Please select a reason"
  }
  const rawData = await fetch("/request-return",{
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify({productId,orderId,reason})
  })
  if (rawData.status === 401) {
    window.location.href = "/login";
  }
  if (rawData.status === 403) {
    window.location.href = "/user-blocked";
  }

  if(rawData.ok){
    const data =await rawData.json();  
    if(data.status==="success"){
      document.querySelector("#return-status").innerText="Return request is pending"
      document.querySelector(`[data-id="${productId}"]`).remove();
      returnRequestModal.style.display = "none";
      returnRequestMessage.style.display = "block";
      error.innerText="";
    }
  }


  
}

const closeModal = () => {
  cancelRequestModal.style.display = "none";
  cancelRequestMessage.style.display = "none";
  returnRequestModal.style.display = "none";
  returnRequestMessage.style.display = "none";
};
cancelBtn.forEach((item) => {
  item.addEventListener("click",(event)=>{
    showModal(event,cancelRequestModal)
  });
});
returnBtn.forEach((item) => {
  item.addEventListener("click",(event)=>{
    showModal(event,returnRequestModal)
  });
});
sendReqBtn.addEventListener("click", sendCancelRequest);
returnReqbtn.addEventListener("click",sendReturnRequest);
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
