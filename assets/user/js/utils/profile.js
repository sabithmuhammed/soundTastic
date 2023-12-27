const cmodal = document.getElementById("confirm-modal");
const pmodal = document.getElementById("password-modal");
const close = document.getElementsByClassName("confirm-close")[0];
const pClose = document.getElementsByClassName("password-close")[0];
const radio = document.querySelectorAll("[data-addressDefault]");
const wModal = document.getElementById("wallet-modal");
const walletBtn =document.querySelector('[data-walletHistoryBtn]');
const walletClose =document.querySelector('.wallet-close');


//show confirmation modal before deleting address
const showConfirm = (item) => {
  const id = item.dataset.id;
  document.getElementById("address-id").value = id;
  cmodal.style.display = "block";
};

//show password modal
const changePassword = () => {
  const error = document.querySelector(".change-pwd-error");
  const oldPwdContainer = document.querySelector(".old-password-div");
  const newPwdContainer = document.querySelector(".new-password-div");
  const message = document.querySelector(".message-div");
  oldPwdContainer.style.display = "block";
  newPwdContainer.style.display = "none";
  message.style.display = "none";
  error.innerText = "";
  pmodal.style.display = "block";
};

// close modal when pressed close
close.onclick = function () {
  cmodal.style.display = "none";
};
pClose.onclick = function () {
  pmodal.style.display = "none";
};
//close modal when pressed outside modal
window.addEventListener("click", (event) => {
  if (event.target == cmodal) {
    cmodal.style.display = "none";
  }
  if (event.target == wModal) {
    wModal.style.display = "none";
  }
});

//fetch request for address deletion
const deleteAddress = async () => {
  try {
    const addressId = document.getElementById("address-id").value;
    const address = document.querySelector(`[data-address="${addressId}"]`);
    const rawData = await fetch("/delete-address", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ addressId }),
    });

    if (rawData.status === 401) {
      window.location.href = "/login";
    }
    if (rawData.status === 403) {
      window.location.href = "/user-blocked";
    }

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
};

//when press edit profile profile details area willbe editable
const editProfile = () => {
  const name = document.getElementById("name");
  const phone = document.getElementById("phone");
  name.readOnly = false;
  phone.readOnly = false;
  const buttons = document.querySelector(".profile-edit-buttons");
  buttons.style.display = "block";
  name.focus();
};

//while editing profile when pressed cancel it will go to previous state
const profileCancel = () => {
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
};
// function for saving profile changes
const profileSave = async () => {
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
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, phone }),
    });

    if (rawData.status === 401) {
      window.location.href = "/login";
    }
    if (rawData.status === 403) {
      window.location.href = "/user-blocked";
    }

    if (rawData.ok) {
      const data = await rawData.json();
      if (data.status === "success") {
        document.querySelector("[data-bigname]").innerText = data.data.name;
        nameInput.value = data.data.name;
        nameInput.dataset.value = data.data.name;
        phoneInput.value = data.data.phone;
        phoneInput.dataset.value = data.data.phone;
        nameInput.readOnly = true;
        phoneInput.readOnly = true;
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
};

// verifying old password
const checkPassword = async () => {
  try {
    const oldPwdContainer = document.querySelector(".old-password-div");
    const newPwdContainer = document.querySelector(".new-password-div");
    const oldPasswordInput = document.getElementById("old-password");
    const oldPassword = oldPasswordInput.value.trim();
    const error = document.querySelector(".change-pwd-error");
    if (!oldPassword) {
      return (error.innerText = "Enter a valid password");
    }
    const rawData = await fetch("/check-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password: oldPassword }),
    });

    if (rawData.status === 401) {
      window.location.href = "/login";
    }
    if (rawData.status === 403) {
      window.location.href = "/user-blocked";
    }

    if (rawData.ok) {
      const data = await rawData.json();
      if (data.status === "success") {
        error.innerText = "";
        oldPasswordInput.value = "";
        oldPwdContainer.style.display = "none";
        newPwdContainer.style.display = "block";

        return;
      } else {
        return (error.innerHTML = data.message);
      }
    }
    error.innerHTML = "Something went wrong! Try again";
  } catch (error) {
    error.innerHTML = "Something went wrong! Try again";
  }
};

// changing password to new one
const newPassword = async () => {
  try {
    const newPwdContainer = document.querySelector(".new-password-div");
    const error = document.querySelector(".change-pwd-error");
    const passwordInput = document.getElementById("new-password");
    const confPasswordInput = document.getElementById("c-new-password");
    const password = passwordInput.value.trim();
    const confPassword = confPasswordInput.value.trim();

    const message = document.querySelector(".message-div");
    if(password.length < 6){
      return (error.innerText = "Password must contain at least 6 charecters");
    }
    if (!password || !confPassword) {
      return (error.innerText = "Fields can't be empty");
    }
    if (password !== confPassword) {
      return (error.innerText = "Passwords doesn't match!");
    }
    const rawData = await fetch("/change-password", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    });

    if (rawData.status === 401) {
      window.location.href = "/login";
    }
    if (rawData.status === 403) {
      window.location.href = "/user-blocked";
    }
    if (rawData.ok) {
      const data = await rawData.json();
      if (data.status === "success") {
        newPwdContainer.style.display = "none";
        error.innerText = "";
        passwordInput.value = "";
        confPasswordInput.value = "";
        message.style.display = "block";
      } else {
        error.innerText = data.message;
      }
    }
  } catch (error) {
    console.error(error.message);
  }
};

const setDefaultAddress = async (event) => {
  try {
    event.preventDefault();
    const defaultAddress = event.currentTarget.value;
    const rawData = await fetch("/default-address", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ defaultAddress }),
    });

    if (rawData.status === 401) {
      window.location.href = "/login";
    }
    if (rawData.status === 403) {
      window.location.href = "/user-blocked";
    }

    if (rawData.ok) {
      return (event.target.checked = true);
    }
  } catch (error) {
    console.error(error.message);
    event.preventDefault();
  }
};

const showWalletHistory =()=>{
  wModal.style.display="block"
}

radio.forEach((item) => {
  item.addEventListener("click", setDefaultAddress);
});

walletBtn.addEventListener('click',showWalletHistory)
walletClose.addEventListener('click',()=>{
  wModal.style.display="none"
})
