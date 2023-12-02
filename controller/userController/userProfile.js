const User = require("../../model/userModel");
const cartUtils = require("../../utilities/cartUtilities");
const wishUtils = require("../../utilities/wishlistUtilities");
const showProfile = async (req, res) => {
    try {
      
      const {userId} = req.session;
      const user = req.session.user;
      const userData = await User.findById({ _id: userId });
      const cartCount = await cartUtils.getCartCount(userId)
      const { wishlistCount } = await wishUtils.wishlistDetails(userId);
      res.render("user/profile", { user, userData ,cartCount,wishlistCount});
    } catch (error) {
      console.log(error.message);
    }
  };

  const showAddAddress = async (req, res) => {
    try {
      const {userId}=req.session
      const cartCount = await cartUtils.getCartCount(userId)
      const { wishlistCount } = await wishUtils.wishlistDetails(userId);
      res.render("user/addAddress", { user: req.session.user ,cartCount,wishlistCount});
    } catch (error) {
      console.log(error.message);
    }
  };

  const addAddress = async (req, res) => {
    try {
      const { name, mobile, address, city, pincode, state } = req.body;
      const newAddress = await User.findByIdAndUpdate(
        { _id: req.session.userId },
        {
          $push: { address: { name, mobile, address, city, pincode, state } },
        }
      );
      if (newAddress) {
        res.json({ status: "success" });
      }
    } catch (error) {}
  };


  const showEditAddress = async (req, res) => {
    try {
      const addressId = req.params.id;
      const {userId}=req.session
      const userData = await User.findById(
        { _id: req.session.userId },
        { address: { $elemMatch: { _id: addressId } } }
      );
      const cartCount = await cartUtils.getCartCount(userId)
      const { wishlistCount } = await wishUtils.wishlistDetails(userId);
      const address = userData.address[0];
      res.render("user/editAddress", { user: req.session.user, address,cartCount,wishlistCount });
    } catch (error) {
      console.log(error.message);
    }
  };

  const editAddress = async (req, res) => {
    try {
      const { name, mobile, address, city, pincode, state, id } = req.body;
      const updatedAddress = await User.findOneAndUpdate(
        { "address._id": id },
        {
          $set: {
            "address.$": {
              name,
              mobile,
              address,
              city,
              pincode,
              state,
            },
          },
        }
      );
      if (updatedAddress) {
        return res.json({ status: "success" });
      }
      res.json({ status: "failed" });
    } catch (error) {
      console.log(error.message);
      res.json({ status: "failed" });
    }
  };

  const deleteAddress = async (req, res) => {
    try {
      const { addressId } = req.body;
      const updatedAddress = await User.findOneAndUpdate(
        { _id: req.session.userId },
        {
          $pull: {
            address: {
              _id: addressId,
            },
          },
        }
      );
      console.log(req.session.userId, addressId, updatedAddress);
      if (updatedAddress) {
        return res.json({ status: "success" });
      }
      return res.json({ status: "failed" });
    } catch (error) {
      console.log(error.message);
      res.json({ status: "failed" });
    }
  };

  const editProfile = async (req, res) => {
    try {
      const { name, phone } = req.body;
      const userData = await User.findByIdAndUpdate(
        { _id: req.session.userId },
        { name, phone },
        { new: true }
      );
      if (userData) {
        return res.json({
          status: "success",
          data: {
            name: userData.name,
            phone: userData.phone,
          },
        });
      }
  
      res.json({ status: "failed" });
    } catch (error) {
      console.log(error.message);
      res.json({ status: "failed" });
    }
  };

const setDefaultAddress=async(req,res)=>{
  try {
    const {defaultAddress}=req.body
     const userData=await User.findByIdAndUpdate({_id:req.session.userId},{$set:{defaultAddress}})
     if(userData){
      res.status(204).send();
     }
     res.status(404).json({status:"failed",message:"resource not found"})
  } catch (error) {
    console.log(error.message);
  }
}

  module.exports={
    showProfile,
    showAddAddress,
    addAddress,
    showEditAddress,
    editAddress,
    deleteAddress,
    editProfile,
    setDefaultAddress,
  }