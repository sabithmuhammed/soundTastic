const cmodal = document.getElementById("confirm-modal");
const pmodal = document.getElementById("password-modal");
const close = document.getElementsByClassName("confirm-close")[0];

function showConfirm(item) {
  const id = item.dataset.id;
  document.getElementById("address-id").value = id;
  cmodal.style.display = "block";
}

function changePassword() {
  const error = document.querySelector(".change-pwd-error");
  const oldPwdContainer = document.querySelector(".old-password-div");
  const newPwdContainer = document.querySelector(".new-password-div");
  oldPwdContainer.style.display = "block";
  newPwdContainer.style.display = "none";
  error.innerText = "";
  pmodal.style.display = "block";
}
close.onclick = function () {
  cmodal.style.display = "none";
  pmodal.style.display = "none";
};
window.onclick = function (event) {
  if (event.target == cmodal) {
    cmodal.style.display = "none";
  }
  if (event.target == pmodal) {
    pmodal.style.display = "none";
  }
};

async function deleteAddress() {
  try {
    const addressId = document.getElementById("address-id").value;
    const address = document.querySelector(`[data-address="${addressId}"]`);
    const rawData = await fetch("/delete-address", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ addressId }),
    });
    if (rawData.ok) {
      const data = await rawData.json();
      if (data.status === "success") {
        address.remove();
        cmodal.style.display = "none";
      }
    }
  } catch (error) {
    console.log(error.message);
  }
}

function editProfile() {
  const name = document.getElementById("name");
  const phone = document.getElementById("phone");
  name.readOnly = false;
  phone.readOnly = false;
  const buttons = document.querySelector(".profile-edit-buttons");
  buttons.style.display = "block";
  name.focus();
}

function profileCancel() {
  const name = document.getElementById("name");
  const phone = document.getElementById("phone");
  name.value = name.dataset.value;
  phone.value = phone.dataset.value;
  name.readOnly = true;
  phone.readOnly = true;
  const error = document.querySelector(".profile-error");
  const buttons = document.querySelector(".profile-edit-buttons");
  buttons.style.display = "none";
  error.innerText = "";
}
async function profileSave() {
  try {
    const nameInput = document.getElementById("name");
    const phoneInput = document.getElementById("phone");
    const buttons = document.querySelector(".profile-edit-buttons");
    const error = document.querySelector(".profile-error");

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    if (!name || !phone) {
      return (error.innerText = "Fields can't be empty");
    }

    if (!/^[a-z ,.'-]+$/i.test(name)) {
      return (error.innerText = "Invalid name");
    }

    if (!/^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/.test(phone)) {
      return (error.innerText = "Invalid phone number");
    }

    const rawData = await fetch("/edit-profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, phone }),
    });

    if (rawData.ok) {
      const data = await rawData.json();
      if (data.status === "success") {
        nameInput.value = data.data.name;
        nameInput.dataset.value = data.data.name;
        phoneInput.value = data.data.phone;
        phoneInput.dataset.value = data.data.phone;
        buttons.style.display = "none";
        buttons.style.display = "none";
        error.innerText = "";
      } else {
        error.innerText = "Something went wrong! try again";
      }
    } else {
      error.innerText = "Something went wrong! try again";
    }
  } catch (error) {
    error.innerText = "Something went wrong! try again";
  }
}

async function checkPassword() {
  try {
    const oldPwdContainer = document.querySelector(".old-password-div");
    const newPwdContainer = document.querySelector(".new-password-div");
    const oldPassword = document.getElementById("old-password").value.trim();
    const error = document.querySelector(".change-pwd-error");
    if (!oldPassword) {
      return (error.innerText = "Enter a valid password");
    }
    const rawData = await fetch("check-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password: oldPassword }),
    });
    if (rawData.ok) {
      const data = await rawData.json();
      if (data.status === "success") {
        error.innerText = "";
        oldPwdContainer.style.display = "none";
        newPwdContainer.style.display = "block";

        return;
      } else {
        return (error.innerHTML = data.message);
      }
    }
    error.innerHTML = "Something went wrong! Try again";
  } catch (error) {}
}
