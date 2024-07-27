const { User } = require("../../models");

module.exports = async (req, res) => {
  let { _id } = req.params;
  try {
    let foundUser = await User.findOne({ _id })
      .select({ password: 0 })
      .lean()
      .exec();

    // 若搜尋不到使用者
    if (!foundUser) {
      return res.status(400).send("找不到使用者");
    }

    return res.send(foundUser);
  } catch (e) {
    next(e);
  }
};
