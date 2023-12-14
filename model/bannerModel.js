const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
  title: { type: String },
  description: { type: String },
  image: { type: String, required: true },
  link: { type: String },
  listed: { type: Number, required: true, default: 1 },
});

module.exports = mongoose.model("banner", bannerSchema);
