const User = require("../model/userModel");
const checkBlock = async (userId) => {
  try {
    const userData = await User.findById({ _id: userId });
    return userData.blocked
  } catch (error) {
    console.log(error.message);
    return error;
  }
};

module.exports = checkBlock;
