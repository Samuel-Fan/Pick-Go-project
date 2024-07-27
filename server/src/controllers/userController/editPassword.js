const User = require("../../models").User;
const valid = require("../otherController/validation");
const bcrypt = require("bcrypt");
const redisClient = require("../../config/redis").redisClient_user;

module.exports = async (req, res, next) => {
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
      redisClient.del(`public_user_${_id}`), // 刪掉快取
    ]);

    return res.send("成功更新資料");
  } catch (e) {
    next(e);
  }
};
