const { Like } = require("../../models");

module.exports = async (req, res, next) => {
  let site_id = req.params._id; // 景點id
  let user_id = req.user._id; // 使用者id
  try {
    await Like.deleteOne({ user_id, site_id }).exec();
    return res.send("成功收回讚");
  } catch (e) {
    next(e);
  }
};
