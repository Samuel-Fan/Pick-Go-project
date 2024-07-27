const express = require("express");
const cors = require("cors");
const app = express();
const helmet = require("helmet");
const passport = require("passport");
const session = require("express-session");

require("dotenv").config();
require("./src/config/passport");

const userRoute = require("./src/routes/needAuth").users;
const userPublicRoute = require("./src/routes/public").users;
const siteRoute = require("./src/routes/needAuth").sites;
const sitePublicRoute = require("./src/routes/public").sites;
const tourRoute = require("./src/routes/needAuth").tours;
const tourPublicRoute = require("./src/routes/public").tours;
const adminRoute = require("./src/routes/needAuth").admin;
const authCheck = require("./src/middlewares/authCheck");
const adminAuthCheck = require("./src/middlewares/adminAuthCheck");

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

// 連線 redis (快取)
const client_user = require("./src/config/redis").redisClient_user;
client_user
  .connect()
  .then(() => {
    console.log("redis(處理user)_已連線");
  })
  .catch((e) => {
    console.log(e);
    console.log("無法連線至redis");
  });

const client_other = require("./src/config/redis").redisClient_other;
client_other
  .connect()
  .then(() => {
    console.log("redis(處理user以外的)已連線");
  })
  .catch((e) => {
    console.log("無法連線至redis");
  });

app.set("view engine", "ejs"); // 測試照片上傳

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
app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      scriptSrc: ["'self'", "cdn.jsdelivr.net"],
      imgSrc: ["'self'", "*", "data:"],
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// 限流設定
const rateLimiter = require("./src/middlewares/rateLimiter");

app.use(rateLimiter.singleIPLimiter.limiter);
app.use(rateLimiter.totalRateLimiter.tokenBucket);

app.use("/api/users", userPublicRoute);
app.use("/api/users", authCheck, userRoute);
app.use("/api/sites", sitePublicRoute);
app.use("/api/sites", authCheck, siteRoute);
app.use("/api/tours", tourPublicRoute);
app.use("/api/tours", authCheck, tourRoute);
app.use("/api/admin", authCheck, adminAuthCheck, adminRoute);

app.listen(process.env.PORT || 8080, () => {
  console.log("伺服器正在運行中");
});
