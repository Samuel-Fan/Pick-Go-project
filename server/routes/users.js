const router = require("express").Router();
const User = require("../models/index").user;
const passport = require("passport");
const registerValidation = require("../validation").registerValidation;

const authCheck = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    return res.status(401).send({ message: "您需要先登入系統" });
  }
};

router.use((req, res, next) => {
  console.log("正在接收一個跟'使用者'有關的請求");
  next();
});

// test
router.get("/test", authCheck, (req, res) => {
  return res.send("hello");
});

// 得到所有使用者資料
router.get("/", async (req, res) => {
  let dataFound = await User.find({}).exec();
  return res.send(dataFound);
});

// 登出系統
router.get("/logout", (req, res) => {
  req.logOut((err) => {
    if (err) {
      return res.status(500).send(err);
    } else {
      return res.send({ message: "您已登出系統" });
    }
  });
});

// google登入會員
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/redirect",
  passport.authenticate("google"),
  (req, res) => {
    return res.send("登入成功");
  }
);

// 登入會員
router.post("/login", passport.authenticate("local"), (req, res) => {
  return res.send(req.user);
});

// 註冊會員
router.post("/register", async (req, res) => {
  // 驗證填入資料的正確性，如果不合規範則 return 錯誤
  let { error } = registerValidation(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  let { email, password, username, gender, age, description } = req.body;

  try {
    // 查看 email 是否已經註冊過
    let isExisted = await User.findOne({ email }).exec();
    if (isExisted) {
      return res.status(400).send({ message: "此帳號已註冊過" });
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
router.patch("/modify/basic/:_id", async (req, res) => {
  let { _id } = req.params;
  try {
    // 確認有無此人
    console.log(_id);
    let foundUser = await User.findOne({ _id }).exec();
    if (!foundUser) {
      return res.status(400).send({ message: "無搜尋到此用戶" });
    }

    let { email, password } = foundUser;
    let { username, gender, age, description } = req.body;

    // 驗證填入資料的正確性，如果不合規範則 return 錯誤
    let { error } = registerValidation({
      email,
      password,
      confirmPassword: password,
      username,
      gender,
      age,
      description,
    });
    if (error) {
      return res.status(400).send(error.details[0].message);
    }

    // 更新資料
    let savedUser = await User.findOneAndUpdate({ _id }, req.body, {
      new: true,
      runValidators: true,
    });
    return res.send({ message: "成功更新資料", savedUser });
  } catch (e) {
    return res.status(500).send({ message: e.message });
  }
});

// 修改會員密碼
router.patch("/modify/password/:_id", async (req, res) => {
  let { _id } = req.params;
  try {
    // 確認有無此人
    console.log(_id);
    let foundUser = await User.findOne({ _id }).exec();
    if (!foundUser) {
      return res.status(400).send({ message: "無搜尋到此用戶" });
    }

    let { email } = foundUser;
    let { password, confirmPassword } = req.body;

    // 驗證填入資料的正確性，如果不合規範則 return 錯誤
    let { error } = registerValidation({
      email,
      password,
      confirmPassword,
    });
    if (error) {
      return res.status(400).send(error.details[0].message);
    }

    // 更新資料
    foundUser.password = password;
    let savedUser = await foundUser.save();
    return res.send({ message: "成功更新資料", savedUser });
  } catch (e) {
    return res.status(500).send({ message: e.message });
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
      return res.status(400).send({ message: "無搜尋到此用戶" });
    }

    await User.deleteOne({ _id }).exec();
    return res.send({ message: "成功刪除會員" });
  } catch (e) {
    return res.status(500).send({ message: e.message });
  }
});

module.exports = router;
