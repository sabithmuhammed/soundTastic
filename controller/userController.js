// const User = require("../model/userModel");
const bcrypt = require("bcrypt");

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};


const loadRegister = async (req, res) => {
  try {
    res.render("user/signup");
  } catch (error) {
    console.log(error.message);
  }
};

// const insertUser = async (req, res) => {
//   try {
//     const { password, email, name, phone } = req.body;
//     const userCheck = await User.findOne({ email });
//     if (userCheck) {
//       return res.render("user/signup", {
//         message: "User already exist, try login instead",
//         color: "red",
//       });
//     }
//     const hashPassword = await securePassword(req.body.password);
//     const user = new User({
//       name,
//       email,
//       phone,
//       password: hashPassword,
//     });
//     const userData = await user.save();

//     if (userData) {
//       req.session.user = userData.name;
//       res.render("user/home", { message: req.session.user });
//     } else {
//       res.render("user/signup", { message: "Something went wrong. Try again" });
//     }
//   } catch (error) {
//     console.log(error.message);
//   }
// };

const verifyMail= async (req,res)=>{
    try {
        res.render('user/verifyMail');
    } catch (error) {
        console.log(error.message);
    }
}


const loginLoad = async (req, res) => {
  try {
    const message = req.query.m || null;

    res.render("user/login", { message, color: "green" });
  } catch (error) {
    console.log(error.message);
  }
};

// const verifyLogin = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const userData = await User.findOne({ email });
//     if (userData) {
//       const passwordMatch = await bcrypt.compare(password, userData.password);
//       if (passwordMatch) {
//         req.session.user = userData.name;
//         res.redirect("/home");
//       } else {
//         res.render("user/login", {
//           message: "Username or Password is incorrect!",
//           color: "red",
//         });
//       }
//     } else {
//       res.render("user/login", {
//         message: "Username or Password is incorrect!",
//         color: "red",
//       });
//     }
//   } catch (error) {
//     console.log(error.message);
//   }
// };

const forgotPassword = async (req,res)=> {
    try {
        res.render('user/forgotPassword')
    } catch (error) {
        console.log(error.message);
    }
}

const changePassword =async (req,res)=>{
  try {
    res.render('user/changePassword')
} catch (error) {
    console.log(error.message);
}
}

// const loadHome = (req, res) => {
//   try {
//     res.render("user/home", { message: req.session.user });
//   } catch (error) {
//     console.log(error.message);
//   }
// };
// const userLogout = (req, res) => {
//   try {
//     req.session.destroy((err) => {
//       if (err) {
//         res.send("Oops something went wrong, please try again");
//       } else {
//         const message = "Logged out successfully";
//         res.redirect(`/?m=${encodeURIComponent(message)}`);
//       }
//     });
//   } catch (error) {
//     console.log(error.message);
//   }
// };

module.exports = {
  loadRegister,
//   insertUser,
verifyMail,
   loginLoad,
//   verifyLogin,
forgotPassword,
changePassword,
//   loadHome,
//   userLogout,
};