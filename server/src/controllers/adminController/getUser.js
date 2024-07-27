const { User } = require("../../models");

module.exports = async (req, res) => {
  try {
    let { username, email, page, numberPerPage } = req.query;
    let searchObj = Object.assign(
      {},
      username && { username: { $regex: username, $options: "i" } },
      email && { email }
    );

    let foundUser = await User.find(searchObj)
      .select(["username", "email", "description"])
      .skip((page - 1) * numberPerPage)
      .limit(numberPerPage)
      .lean()
      .exec();

    return res.send(foundUser);
  } catch (e) {
    next(e);
  }
};
