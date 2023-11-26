const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const morgan = require("morgan");
const session = require("express-session");
const nocache = require("nocache");
const path = require("path");
const secretString = require("./config/sessionSecret");
const userRoute=require("./routes/userRoute");
const adminRoute=require("./routes/adminRoute");

const app = express();
dotenv.config({ path: ".env" });
mongoose.connect(process.env.MONGO_DB);
const PORT = process.env.PORT || 8080;

app.set("view engine", "ejs");

app.use(
  session({
    secret: secretString.generateRandomString(32),
    resave: false,
    saveUninitialized: false,
  })
);
app.use(nocache());
app.use(morgan("tiny"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//static files
app.use("/css", express.static(path.resolve(__dirname, "assets/css")));
app.use("/images", express.static(path.resolve(__dirname, "assets/images")));
app.use("/js", express.static(path.resolve(__dirname, "assets/js")));
app.use("/libs", express.static(path.resolve(__dirname, "assets/libs")));
app.use("/user", express.static(path.resolve(__dirname, "assets/user")));

//routes
app.use("/", userRoute);
app.use("/admin", adminRoute);

app.get('*', function(req, res){
  res.status(404).render('404')
});
app.listen(PORT, () =>
  console.log(`Server is running on http://localhost:${PORT}`)
);
