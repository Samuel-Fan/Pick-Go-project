const express = require("express");
const cors = require("cors");
const app = express();
const passport = require("passport");
const session = require("express-session");
require("dotenv").config();
require("./config/passport");

const userRoute = require("./routes").users;

const mongoose = require("mongoose");
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("成功連線至mongodb");
  })
  .catch((e) => {
    console.log("無法連線至mongodb: " + e);
  });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

app.use(cors());

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/users", userRoute);

app.listen(process.env.PORT || 8080, () => {
  console.log("伺服器正在運行中");
});
