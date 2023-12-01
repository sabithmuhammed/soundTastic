const cancelBtn = document.querySelector("[data-cancelOrder]");
const changeStatus = document.querySelector("[data-statusBtn]");
const modal = document.getElementById("confirm-modal");
const orderCancelModal = new bootstrap.Modal(modal);
const statusModal = document.getElementById("change-status-modal");
const changeStatusModal = new bootstrap.Modal(statusModal);
const cancelReqBtn = document.querySelector("[data-cancelReqBtn]");
const statusCol = document.querySelector("[data-status]");
const changeStatusBtn = document.querySelector("[data-changeStatusBtn]");

const showCancelModal = () => {
  orderCancelModal.show();
};

const cancelRequest = async (event) => {
  try {
    const orderId = event.target.dataset.id;
    const rawData = await fetch("/admin/cancel-order", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderId }),
    });
    if(rawData.status===401){
      window.location.href="/admin/login"
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

const showChangeStatus = () => {
  changeStatusModal.show();
};
const changeStatusReq=async(event)=>{
    try {
        console.log("ahgdkjas");
        const orderId=event.currentTarget.dataset.id;
        const status=document.querySelector('[data-select]').value
        const error=document.querySelector('[data-statusError]')
        const rawData=await fetch("/admin/change-status",{
            method:"PATCH",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({orderId,status})
        })
        if(rawData.status===401){
          window.location.href="/admin/login"
        }
        if(rawData.ok){
            const data =await rawData.json();
            if(data.status==="success"){
                statusCol.innerText=data.orderStatus;
                status.value=data.orderStatus;
                changeStatusModal.hide();
                return
            }
        }
        
    } catch (error) {
    console.error(error.message);
    }
}

cancelBtn.addEventListener("click", showCancelModal);
cancelReqBtn.addEventListener("click", cancelRequest);
changeStatus.addEventListener("click", showChangeStatus);
changeStatusBtn.addEventListener("click", changeStatusReq);
