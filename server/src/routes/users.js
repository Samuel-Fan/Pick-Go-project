const router = require("express").Router();
const User = require("../models/index").user;
const passport = require("passport");
const jwt = require("jsonwebtoken");
const valid = require("../controllers/validation");
const bcrypt = require("bcrypt");
const reditClient = require("../config/redis");

router.use((req, res, next) => {
  console.log("正在接收一個跟'使用者'有關的請求");
  next();
});

// test
router.get(
  "/test",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let user = await User.find({ _id: req.user._id }).populate("mySite").exec();
    return res.send(user);
  }
);

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
    let foundUser = await User.findOne({ _id })
      .select(["username", "email", "gender", "age", "description"])
      .lean()
      .exec();

    // 若搜尋不到使用者
    if (!foundUser) {
      return res.status(400).send("找不到使用者");
    }

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
    return res.status(400).send("無使用者儲存");
  }

  const tokenObject = { _id: req.user._id, email: req.user.email };
  const token = jwt.sign(
    tokenObject,
    process.env.JWT_SECRET || "happycodingjwtyeah!",
    {
      expiresIn: "1h",
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
    const foundUser = await User.findOne({ email }).exec();
    if (!foundUser) {
      return res.status(400).send("此email無人註冊過");
    }

    // 驗證密碼
    let result = bcrypt.compare(password, foundUser.password);
    if (!result) {
      return res.status(400).send("帳號或密碼錯誤");
    }

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
    let isExisted = await User.findOne({ email }).exec();
    if (isExisted) {
      return res.status(400).send("此帳號已註冊過");
    }

    // 創建新資料
    let newUser = new User({
      email,
      password,
      username,
    });

    let savedUser = await newUser.save();
    return res.send({ message: "使用者資料儲存完畢", savedUser });
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
      let foundUser = await User.findOne({ _id }).exec();
      if (!foundUser) {
        return res.status(400).send("無搜尋到此用戶");
      }

      // 驗證填入資料的正確性，如果不合規範則 return 錯誤
      let { error } = valid.editBasicValidation(req.body); // req.body 應有 username, age, gender, description
      if (error) {
        console.log(error);
        return res.status(400).send(error.details[0].message);
      }

      let [data, _reditDel] = await Promise.all([
        User.findOneAndUpdate({ _id }, req.body, {
          // 更新資料
          new: true,
          runValidators: true,
        }),
        reditClient.del(`User:${_id}`), // 刪掉快取
      ]);

      return res.send(data);
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
        return res.status(400).send("無搜尋到此用戶");
      }

      let { oldPassword, password, confirmPassword } = req.body;
      console.log(req.body);
      // 比較舊密碼
      if (foundUser.password) {
        // Google註冊的沒有舊密碼
        let result = await bcrypt.compare(oldPassword, foundUser.password);
        console.log(foundUser.password);
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
        reditClient.del(`User:${_id}`), // 刪掉快取
      ]);

      return res.send("成功更新資料");
    } catch (e) {
      return res.status(500).send(e.message);
    }
  }
);

// 刪除會員
router.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let { _id } = req.user;
    try {
      // 確認有無此人
      console.log(_id);
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
