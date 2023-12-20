
const changeStatus = document.querySelector("[data-statusBtn]");
const modal = document.getElementById("confirm-modal");
const orderCancelModal = null
const statusModal = document.getElementById("change-status-modal");
const changeStatusModal = new bootstrap.Modal(statusModal);
const cancelReqBtn = document.querySelector("[data-cancelReqBtn]");
const statusCol = document.querySelectorAll("[data-status]");
const changeStatusBtn = document.querySelector("[data-changeStatusBtn]");

const showCancelModal = () => {
  orderCancelModal = new bootstrap.Modal(modal);
  orderCancelModal.show();
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
                statusCol.forEach((item)=>{
                  item.innerText=data.orderStatus;
                })
                status.value=data.orderStatus;
                if(data.orderStatus==="Delivered"){
                  changeStatus.remove()
                }
                changeStatusModal.hide();
                return
            }
        }
        
    } catch (error) {
    console.error(error.message);
    }
}

changeStatus.addEventListener("click", showChangeStatus);
changeStatusBtn.addEventListener("click", changeStatusReq);
