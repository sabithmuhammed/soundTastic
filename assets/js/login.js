const showPassword = document.getElementById("show-password");
const cnfrmPassword = document.getElementById("show-cnfrm-password");

showPassword.addEventListener("click", () => {
  const passwordField = document.getElementById("password");

  if (passwordField.type === "password") {
    passwordField.type = "text";
    showPassword.innerHTML = '<i class="fa-solid fa-eye"></i>';
  } else {
    passwordField.type = "password";
    showPassword.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
  }
});
cnfrmPassword?.addEventListener("click", () => {
  const passwordField = document.getElementById("cnfrm-password");

  if (passwordField.type === "password") {
    passwordField.type = "text";
    cnfrmPassword.innerHTML = '<i class="fa-solid fa-eye"></i>';
  } else {
    passwordField.type = "password";
    cnfrmPassword.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
  }
});


