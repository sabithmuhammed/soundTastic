const otp = document.querySelectorAll(".otp");
const countdownEl = document.getElementById("timer");
const error = document.getElementById("error");
const verifyBtn=document.getElementById('verify');

otp[0].focus();

otp.forEach((item, index) => {
  item.addEventListener("keydown", (e) => {
    if (e.key >= 0 && e.key <= 9) {
      otp[index].value = "";
      if (index < 5) {
        setTimeout(() => {
          otp[index + 1].focus();
        }, 0);
      } else {
        setTimeout(() => {
          otp[index].blur();
        }, 0);
      }
    }
    if (e.key === "Backspace" && index != 0) {
      setTimeout(() => {
        otp[index - 1].focus();
      }, 0);
    }
  });
});

let startingMinutes = 1;
let time = startingMinutes * 60;
function updateCountdown() {
  const minutes = Math.floor(time / 60);
  let seconds = time % 60;
  seconds = seconds < 10 ? "0" + seconds : seconds;
  time--;
  if (time >= 0) {
    countdownEl.innerHTML = `${minutes}:${seconds}`;
  } else {
    countdownEl.innerHTML = "Resend";
    clearInterval(timeerInterval);
    countdownEl.disabled = false;
  }
}

let timeerInterval=setInterval(updateCountdown, 1000);
countdownEl.addEventListener("click", async () => {
  countdownEl.disabled = true;
  const rawData = await fetch("/resend-otp", { method: "POST" });
  if (rawData.ok) {
    const data = await rawData.json();
    if (data.status === "success") {
      console.log(data);
      startingMinutes = 1;
      time = startingMinutes * 60;
      timeerInterval=setInterval(updateCountdown, 1000);
    } else {
      error.innerText = data.message;
      countdownEl.disabled = false;
    }
  }
});

