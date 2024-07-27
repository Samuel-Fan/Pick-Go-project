const User = require("../../models").User;

module.exports = async (req, res, next) => {
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
    next(e);
  }
};
