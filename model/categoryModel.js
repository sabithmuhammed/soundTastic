const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  listed: { type: Number, required: true, default: 1 },
});

module.exports = mongoose.model("category", categorySchema);
