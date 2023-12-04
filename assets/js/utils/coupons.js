const listBtn = document.querySelectorAll("[data-btnCouponList]");
const confirmBtn = document.querySelector("[data-couponList]");
const couponModal = new bootstrap.Modal(
  document.querySelector("#coupon-modal")
);
const showCouponModal = (event) => {
  const modalCoupon = document.querySelector("#action-id");
  const actionText=document.querySelector('#action-text');
  modalCoupon.value=event.target.dataset.id;
  actionText.innerText=event.target.innerText.toLowerCase()
  confirmBtn.innerText=event.target.innerText
  couponModal.show();
};

const listCoupon =async (event)=>{
    try {
        const actionId=document.querySelector("#action-id").value;
        const item=document.querySelector(`[data-id="${actionId}"]`);
        const rawData = await fetch(`/admin/list-coupon/${actionId}`, {
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
          couponModal.hide();
    
        }
    } catch (error) {
        console.log(error.message);
    }
}

listBtn.forEach((element) => {
  element.addEventListener("click", showCouponModal);
});

confirmBtn.addEventListener("click", listCoupon );
