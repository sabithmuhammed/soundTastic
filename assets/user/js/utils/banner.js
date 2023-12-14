const carouselItems = document.querySelectorAll(".carousel__item");
const carouselNav = document.querySelector(".carousel__nav");
const carouselContainer = document.querySelector(".carousel__container");
const btnHtmls = Array.from(carouselItems, () => {
  return `<span class="carousel__btn"></span>`;
});
let curImage = 0;

carouselNav.innerHTML = btnHtmls.join("");
const carouselBtn = document.querySelectorAll(".carousel__btn");
carouselBtn.forEach((item, index) => {
  item.addEventListener("click", () => {
    carouselBtn.forEach((item, index) => {
      item.classList.remove("carousel__btn--select");
      carouselItems[index].classList.remove("carousel__item--select");
    });
    item.classList.add("carousel__btn--select");
    carouselItems[index].classList.add("carousel__item--select");
    curImage = (index + 1) % carouselItems.length;
  });
});
carouselBtn[0].classList.add("carousel__btn--select");
carouselItems[0].classList.add("carousel__item--select");

const changeBannerImage = () => {
  carouselBtn.forEach((item, index) => {
    item.classList.remove("carousel__btn--select");
    carouselItems[index].classList.remove("carousel__item--select");
  });
  carouselBtn[curImage].classList.add("carousel__btn--select");
  carouselItems[curImage].classList.add("carousel__item--select");
  curImage = (curImage + 1) % carouselItems.length;
};

let intervalID = setInterval(changeBannerImage, 3000);

carouselContainer.addEventListener("mouseenter", () => {
  clearInterval(intervalID);
});

carouselContainer.addEventListener("mouseleave", () => {
  clearInterval(intervalID);
  intervalID = setInterval(changeBannerImage, 3000);
});
