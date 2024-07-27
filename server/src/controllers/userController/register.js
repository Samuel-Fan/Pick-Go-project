const User = require("../../models").User;
const valid = require("../otherController/validation");

module.exports = async (req, res, next) => {
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

    await newUser.save(); // save時自動 hash 密碼
    return res.status(201).send("使用者資料儲存完畢");
  } catch (e) {
    next(e);
  }
};
