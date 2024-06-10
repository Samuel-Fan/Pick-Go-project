const express = require("express");
const cors = require("cors");
const app = express();
const passport = require("passport");
const session = require("express-session");
const ObjectId = require("mongoose").Types.ObjectId;

require("dotenv").config();
require("./src/config/passport");

// 連線資料庫
const mongoose = require("mongoose");
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("成功連線至mongodb");
  })
  .catch((e) => {
    console.log("無法連線至mongodb: " + e);
  });

const User = require("./src/models").user;
const Admin = require("./src/models").admin;

app.use(express.json({ limit: "2.5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, expires: 60 * 60 * 1000 }, // 一小時候過期
  })
);
app.use(
  cors({
    origin: process.env.REDIRECT_URI,
    credentials: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

let newAdmin = new Admin({
  admin_id: new ObjectId("664186b1e896cbdaff869d31"),
});
newAdmin.save();

app.listen(process.env.PORT || 8080, () => {
  console.log("伺服器正在運行中");
});
