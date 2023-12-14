const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./assets/images/products");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "_" + Math.round(Math.random() * 1e9);
    let ext=file.originalname.slice(file.originalname.lastIndexOf("."))
    cb(null, uniqueSuffix + "_" + ext);
  },
});

const bannerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./assets/images/banners");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "_" + Math.round(Math.random() * 1e9);
    let ext=file.originalname.slice(file.originalname.lastIndexOf("."))
    cb(null, uniqueSuffix + "_" + ext);
  },
});

const upload = multer({ storage: storage });
const banner = multer({storage:bannerStorage})
const imageUpload = upload.fields([
  { name: "image1", maxCount: 1 },
  { name: "image2", maxCount: 1 },
  { name: "image3", maxCount: 1 },
  { name: "image4", maxCount: 1 },
]);

const bannerUpload = banner.single('banner');

module.exports = {imageUpload,bannerUpload};
