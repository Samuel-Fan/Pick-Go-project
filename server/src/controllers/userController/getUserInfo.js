const User = require("../../models").User;

module.exports = async (req, res, next) => {
  try {
    let foundUser = await User.findOne({ _id: req.user._id }).lean().exec();
    return res.send(foundUser);
  } catch (e) {
    next(e);
  }
};
