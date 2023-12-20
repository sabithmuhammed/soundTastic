const listBtn = document.querySelectorAll("[data-btnBannerList]");
const confirmBtn = document.querySelector("[data-bannerList]");
const bannerModal = new bootstrap.Modal(
  document.querySelector("#banner-modal")
);

const deleteBtn = document.querySelectorAll("[data-btnBannerDelete]");
const confirmDeleteBtn = document.querySelector("[data-bannerDelete]");
const bannerDeleteModal = new bootstrap.Modal(
  document.querySelector("#banner-delete-modal")
);

const showBannerModal = (event) => {
  const modalBanner = document.querySelector("#action-id");
  const actionText = document.querySelector("#action-text");
  modalBanner.value = event.target.dataset.id;
  actionText.innerText = event.target.innerText.toLowerCase();
  confirmBtn.innerText = event.target.innerText;
  bannerModal.show();
};

const listBanner = async (event) => {
  try {
    const actionId = document.querySelector("#action-id").value;
    const item = document.querySelector(`[data-id="${actionId}"]`);
    const rawData = await fetch(`/admin/list-banner/${actionId}`, {
      method: "PATCH",
    });
    if (rawData.status === 401) {
      window.location.href = "/admin/login";
    }
    if (rawData.ok) {
      const data = await rawData.json();
      item.classList.toggle("btn-danger");
      item.classList.toggle("btn-success");
      item.innerText = data.message;
      bannerModal.hide();
    }
  } catch (error) {
    console.log(error.message);
  }
};

const showDeleteModal = (event) => {
  const modalBanner = document.querySelector("#action-delete-id");
  modalBanner.value = event.target.dataset.deleteId;
  bannerDeleteModal.show();
};

const deleteBanner = async (event) => {
  try {
    const actionId = document.querySelector("#action-delete-id").value;
    const item = document.querySelector(`[data-row="${actionId}"]`);
    const rawData = await fetch(`/admin/delete-banner/${actionId}`, {
      method: "DELETE",
    });
    if (rawData.status === 401) {
      window.location.href = "/admin/login";
    }
    if (rawData.ok) {
      const table = document.querySelector(".table");
      const tLength = table.tBodies[0].rows.length;
      bannerDeleteModal.hide();
      if (tLength <= 1) {
        table.tBodies[0].innerHTML = `<tr><td clospan="6" class="text-center">No Banners</td></tr>`;
        return;
      }
      item.remove();
    }
  } catch (error) {
    console.log(error.message);
  }
};

listBtn.forEach((element) => {
  element.addEventListener("click", showBannerModal);
});

confirmBtn.addEventListener("click", listBanner);

deleteBtn.forEach((item) => {
  item.addEventListener("click", showDeleteModal);
});
confirmDeleteBtn.addEventListener("click", deleteBanner);
