const router = require("express").Router();
const User = require("../models/index").user;
const passport = require("passport");
const jwt = require("jsonwebtoken");
const valid = require("../controllers/validation");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const imgurClient = require("../config/imgur");
const redisClient = require("../config/redis").redisClient_user;

// 照片檔案上傳格式設定
const upload = multer({
  limits: {
    fileSize: 2.5 * 1024 * 1024,
  },
  fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== ".jpg" && ext !== ".png" && ext !== ".jpeg") {
      cb({ message: '"檔案格式錯誤，僅限上傳 jpg、jpeg 與 png 格式。"' });
    }
    cb(null, true);
  },
}).any();

// 得到使用者資料
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      return res.send(req.user);
    } catch (e) {
      console.log(e);
      return res.status(500).send("伺服器發生問題");
    }
  }
);

// 得到特定使用者的資料
router.get("/profile/:_id", async (req, res) => {
  let { _id } = req.params;
  try {
    // 先找快取;
    let cacheData = await redisClient.get(`public_user_${_id}`);
    if (cacheData) {
      switch (cacheData) {
        case "404":
          return res.status(404).send("找不到使用者");
        case "403":
          return res.status(403).send("該使用者不公開資料");
        default:
          return res.send(cacheData);
      }
    }

    // 快取找不到，則搜尋資料庫
    let foundUser = await User.findOne({ _id })
      .select({ password: 0 })
      .lean()
      .exec();

    // 若搜尋不到使用者
    if (!foundUser) {
      redisClient.set(`public_user_${_id}`, "400", {
        EX: 24 * 60 * 1,
      });
      return res.status(404).send("找不到使用者");
    }

    // 若不公開
    if (!foundUser.public) {
      redisClient.set(`public_user_${_id}`, "403", {
        EX: 24 * 60 * 1,
      });
      return res.status(403).send("該使用者不公開資料");
    }

    // 若有找到又有公開，先存入快取
    redisClient.set(`public_user_${_id}`, JSON.stringify(foundUser), {
      EX: 24 * 60 * 1,
    });

    return res.send(foundUser);
  } catch (e) {
    console.log(e);
    return res.status(500).send("伺服器發生問題");
  }
});

// google登入、註冊會員
router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

router.get(
  "/auth/google/redirect",
  passport.authenticate("google"),
  (req, res) => {
    res.redirect(process.env.REDIRECT_URI + "/googleLogin");
  }
);

// google登入後，清除session，轉用jwt儲存
router.get("/auth/google/setJwt", (req, res) => {
  if (!req.user) {
    return res.status(400).send("無使用者登入");
  }

  const tokenObject = { _id: req.user._id, email: req.user.email };
  const token = jwt.sign(
    tokenObject,
    process.env.JWT_SECRET || "happycodingjwtyeah!",
    {
      expiresIn: "4h",
    }
  );

  const user = req.user;

  req.logOut((err) => {
    if (err) {
      return res.status(500).send(err);
    } else {
      return res.send({ user, jwtToken: "JWT " + token });
    }
  });
});

// local 登入會員
router.post("/login", async (req, res) => {
  // 先驗證資料格式
  let { error } = valid.loginValidation(req.body); //req.body 中應有 email, password
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  let { email, password } = req.body;
  try {
    // 用email找尋使用者
    const foundUser = await User.findOne({ email })
      .select(["password", "username"])
      .lean()
      .exec();
    if (!foundUser) {
      return res.status(400).send("此email無人註冊過");
    }

    // 驗證密碼
    let result = bcrypt.compare(password, foundUser.password);
    if (!result) {
      return res.status(400).send("帳號或密碼錯誤");
    }

    // 回傳 JWT
    const tokenObject = { _id: foundUser._id, email: foundUser.email };
    const token = jwt.sign(
      tokenObject,
      process.env.JWT_SECRET || "happycodingjwtyeah!",
      {
        expiresIn: "4h",
      }
    );
    return res.send({ user: foundUser, jwtToken: "JWT " + token });
  } catch (e) {
    console.log(e);
    return res.status(500).send("儲存資料時發生錯誤:" + e.message);
  }
});

// local 註冊會員
router.post("/register", async (req, res) => {
  // 驗證填入資料的正確性，如果不合規範則 return 錯誤
  let { error } = valid.registerValidation(req.body); // req.body 中應至少有 email, password, confirmPassword, username
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  let { email, password, username } = req.body;

  try {
    // 查看 email 是否已經註冊過
    let isExisted = await User.findOne({ email }).select("_id").lean().exec();
    if (isExisted) {
      return res.status(400).send("此帳號已註冊過");
    }

    // 創建新資料
    let newUser = new User({
      email,
      password,
      username,
    });

    let savedUser = await newUser.save(); // save時自動 hash 密碼
    return res.status(201).send({ message: "使用者資料儲存完畢", savedUser });
  } catch (e) {
    console.log(e);
    return res.status(500).send("儲存資料時發生錯誤:" + e.message);
  }
});

// 修改會員資料(密碼以外)
router.patch(
  "/modify/basic",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let { _id } = req.user;
    try {
      // 確認有無此人
      let foundUser = await User.findOne({ _id }).select("_id").lean().exec();
      if (!foundUser) {
        return res.status(404).send("無搜尋到此用戶");
      }

      // 上傳格式formData
      upload(req, res, async (err) => {
        // req.files 包含 圖片檔案
        // req.body 包含 key-value 資料

        // 如圖片規格不符 multer 設定(大小、格式)，則返回 error 訊息
        if (err) {
          console.log(err);
          return res.status(400).send(err.message);
        }

        // 驗證填入資料的正確性，如果不合規範則 return 錯誤
        let { error } = valid.editBasicValidation(req.body); // req.body 應有 username, age, gender, description, public, removeOriginPhoto
        if (error) {
          console.log(error);
          return res.status(400).send(error.details[0].message);
        }

        let { removeOriginPhoto, public } = req.body;

        // 新圖片上傳 imgur ，取得 url 及 deleteHash
        let url;
        let deletehash;
        let photoName;

        // 若要求刪除舊照片 or 有更新成新照片
        if (removeOriginPhoto === "true") {
          await imgurClient.deleteImage(foundUser.photo.deletehash);
        }

        let newPhoto;
        // 上傳新照片
        if (req.files.length !== 0) {
          const response = await imgurClient.upload({
            image: req.files[0].buffer.toString("base64"),
            type: "base64",
            album: process.env.IMGUR_ALBUM_ID,
          });

          url = response.data.link;
          deletehash = response.data.deletehash;
          photoName = req.files[0].originalname;

          newPhoto = { photo: { url, deletehash, photoName } };
        } else {
          if (removeOriginPhoto === "true") {
            newPhoto = { photo: { url: "", deletehash: "", photoName: "" } };
          } else {
            newPhoto = {};
          }
        }

        // 將景點資訊儲存至資料庫
        let newData = Object.assign({}, req.body, newPhoto, {
          public: public === "true" ? true : false,
        });

        let [data] = await Promise.all([
          User.findOneAndUpdate({ _id }, newData, {
            // 更新資料
            new: true,
            runValidators: true,
          }),
          redisClient.del(`User:${_id}`), // 刪掉快取
          redisClient.del(`public_user_${_id}`),
        ]);

        return res.send(data);
      });
    } catch (e) {
      console.log(e);
      return res.status(500).send(e.message);
    }
  }
);

// 修改會員密碼
router.patch(
  "/modify/password",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let { _id } = req.user;
    try {
      // 確認有無此人
      let foundUser = await User.findOne({ _id }).exec();
      if (!foundUser) {
        return res.status(404).send("無搜尋到此用戶");
      }

      let { oldPassword, password, confirmPassword } = req.body;
      // 比較舊密碼
      if (foundUser.password) {
        // Google註冊的沒有舊密碼
        let result = await bcrypt.compare(oldPassword, foundUser.password);
        if (!result) {
          return res.status(400).send("舊密碼輸入不正確!");
        }
      }

      // 驗證填入資料的正確性，如果不合規範則 return 錯誤
      let { error } = valid.editPasswordValidation({
        password,
        confirmPassword,
      });
      if (error) {
        return res.status(400).send(error.details[0].message);
      }

      foundUser.password = password;
      await Promise.all([
        foundUser.save(), // 更新資料
        redisClient.del(`User:${_id}`), // 刪掉快取
        redisClient.del(`public_user_${_id}`), // 刪掉快取
      ]);

      return res.send("成功更新資料");
    } catch (e) {
      return res.status(500).send(e.message);
    }
  }
);

// 刪除會員 (目前無開放)
router.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let { _id } = req.user;
    try {
      // 確認有無此人
      let foundUser = await User.findOne({ _id }).exec();
      if (!foundUser) {
        return res.status(400).send("無搜尋到此用戶");
      }

      await User.deleteOne({ _id }).exec();
      return res.send("成功刪除會員");
    } catch (e) {
      return res.status(500).send(e.message);
    }
  }
);

module.exports = router;
