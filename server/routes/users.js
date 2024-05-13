const router = require("express").Router();
const User = require("../models/index").user;
const passport = require("passport");
const valid = require("../validation");
const bcrypt = require("bcrypt");

const authCheck = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    return res.status(401).send("您需要先重新登入系統");
  }
};

router.use((req, res, next) => {
  console.log("正在接收一個跟'使用者'有關的請求");
  next();
});

// test
router.get("/test", async (req, res) => {
  let user = await User.find({}).populate("mySite").exec();
  return res.send(user);
});

// 得到使用者資料
router.get("/", authCheck, async (req, res) => {
  try {
    return res.send(req.user);
  } catch (e) {
    return res.status(500).send("伺服器發生問題");
  }
});

// 登出系統
router.get("/logout", (req, res) => {
  req.logOut((err) => {
    if (err) {
      return res.status(500).send(err);
    } else {
      return res.send("您已登出系統");
    }
  });
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

// local 登入會員
router.post(
  "/login",
  (req, res, next) => {
    let { error } = valid.loginValidation(req.body); //req.body 中應有 username, email
    if (error) {
      return res.status(400).send(error.details[0].message);
    } else {
      next();
    }
  },
  passport.authenticate("local"),
  (req, res) => {
    return res.send(req.user);
  }
);

// local 註冊會員
router.post("/register", async (req, res) => {
  // 驗證填入資料的正確性，如果不合規範則 return 錯誤
  let { error } = valid.registerValidation(req.body); // req.body 中應至少有 email, password, confirmPassword, username
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  let { email, password, username, gender, age, description } = req.body;

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
      gender,
      age,
      description,
    });

    let savedUser = await newUser.save();
    return res.send({ message: "使用者資料儲存完畢", savedUser });
  } catch (e) {
    return res.status(500).send("儲存資料時發生錯誤:" + e.message);
  }
});

// 修改會員資料(密碼以外)
router.patch("/modify/basic", authCheck, async (req, res) => {
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
      return res.status(400).send(error.details[0].message);
    }

    // 更新資料
    let savedUser = await User.findOneAndUpdate({ _id }, req.body, {
      new: true,
      runValidators: true,
    });
    return res.send(savedUser);
  } catch (e) {
    return res.status(500).send(e.message);
  }
});

// 修改會員密碼
router.patch("/modify/password", authCheck, async (req, res) => {
  let { _id } = req.user;
  try {
    // 確認有無此人
    console.log(_id);
    let foundUser = await User.findOne({ _id }).exec();
    if (!foundUser) {
      return res.status(400).send("無搜尋到此用戶");
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

    // 更新資料
    foundUser.password = password;
    await foundUser.save();
    return res.send("成功更新資料");
  } catch (e) {
    return res.status(500).send(e.message);
  }
});

// 刪除會員
router.delete("/:_id", async (req, res) => {
  let { _id } = req.params;
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
});

module.exports = router;
