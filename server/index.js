const express = require("express");
const cors = require("cors");
const app = express();
const passport = require("passport");
const session = require("express-session");

require("dotenv").config();
require("./config/passport");

const userRoute = require("./routes").users;
const siteRoute = require("./routes").sites;

const mongoose = require("mongoose");
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("成功連線至mongodb");
  })
  .catch((e) => {
    console.log("無法連線至mongodb: " + e);
  });

app.set("view engine", "ejs"); // 測試照片上傳

app.use(express.json({ limit: "1.5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, expires: 3600000 },
  })
);
app.use(
  cors({
    origin:
      "https://3000-samuelfan-pickgoproject-063jy55okjc.ws-us110.gitpod.io",
    credentials: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/users", userRoute);
app.use("/api/sites", siteRoute);

app.listen(process.env.PORT || 8080, () => {
  console.log("伺服器正在運行中");
});
