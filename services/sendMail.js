const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config({ path: ".env" });
const UserOTP = require("../model/userOTPVerification");

const sendVerifyMail=async(name,email,otp)=>{
    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: false,
        requireTLS: true,
        auth: {
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD,
        },
      });
      const mailOptions = {
        from: process.env.USERNAME,
        to: email,
        subject: "OTP verification for soundtastic",
        html: `<center>
        <h1>Hi, ${name} </h1><br>
        <h3>Your OTP for email verfication of soundtastic is:</h3><br>
        <div
          style="
            width: 100px;
            background-color: #d10024;
            color: #ffffff;
            text-align:center;
            padding:10px
          "
        >
          <b>${otp}</b>
        </div><br>
        <p>DO NOT SHARE this code with anyone</p>
        </center>`,
      };
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.log(err);
        } else {
          return info;
        }
      });
}

module.exports={
  sendVerifyMail
}