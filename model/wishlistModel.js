const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "user",
    required: true,
  },
  products: [
    {
      type: mongoose.Types.ObjectId,
      ref: "product",
      required: true,
    },
  ],
});

module.exports = mongoose.model("wishlist", wishlistSchema);
