const approveBtn = document.querySelectorAll("[data-approve]");
const returnBtn = document.querySelector("[data-btnReturn]");

let modal = null


const rejectBtn = null
const rejectConfirmBtn = document.querySelector("[data-btnReject]");

let modalReject = new bootstrap.Modal(document.querySelector("#reject-modal"));

const showConfirm = (event) => {
  modal = new bootstrap.Modal(document.querySelector("#confirm-modal"));
  const idInput = document.querySelector("#request-id");
  idInput.value = event.target.dataset.id;
  modal.show();
};

const showRejectConfirm = (event) => {
  rejectBtn = document.querySelectorAll("[data-reject]");
  const idInput = document.querySelector("#reject-id");
  idInput.value = event.target.dataset.id;
  modalReject.show();
};

const handleReturn = async (endpoint) => {
  let reqId
  if(endpoint==="accept-return"){
    reqId = document.querySelector("#request-id").value;
  }
  if(endpoint==="reject-return"){
    reqId = document.querySelector("#reject-id").value;
  }

  const rawData = await fetch(`/admin/${endpoint}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reqId }),
  });
  if(rawData.ok){
    const table = document.querySelector(".table")
    const tLength = table.tBodies[0].rows.length;
    modal.hide()
    modalReject.hide();
    if(tLength <=1 ){
      table.tBodies[0].innerHTML=`<tr><td colspan="6" class="text-center">No requests</td></tr>`
      return
    }
    document.querySelector(`[data-row="${reqId}"]`).remove();
  }
};




approveBtn.forEach((item) => {
  item.addEventListener("click", showConfirm);
});

returnBtn.addEventListener("click", ()=>{
  handleReturn("accept-return")
});

rejectBtn.forEach((item) => {
  item.addEventListener("click", showRejectConfirm );
});

rejectConfirmBtn.addEventListener("click", ()=>{
  handleReturn("reject-return")
});
