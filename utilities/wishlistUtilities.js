const Wishlist = require("../model/wishlistModel");
const wishlistDetails = async (userId) =>{
    const wishlistProducts = await Wishlist.findOne(
        { userId},
        { products: 1, _id: 0 }
      );
    const wishlist = wishlistProducts?.products;
    const wishlistCount =wishlist?.length
    return {wishlist,wishlistCount}
}

module.exports={
    wishlistDetails
}

