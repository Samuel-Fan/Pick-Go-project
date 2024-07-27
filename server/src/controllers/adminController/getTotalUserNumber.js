const { User } = require("../../models");

module.exports = async (req, res) => {
  try {
    let { username, email } = req.query;
    let searchObj = Object.assign(
      {},
      username && { username: { $regex: username, $options: "i" } },
      email && { email }
    );

    let count = await User.find(searchObj).count();

    return res.send({ count });
  } catch (e) {
    next(e);
  }
};
