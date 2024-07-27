const { Admin } = require("../models");
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = async (req, res, next) => {
  let checkAuth = await Admin.findOne({
    admin_id: new ObjectId(req.user._id),
  });
  if (checkAuth) {
    next();
  } else {
    return res.status(403).send("無權限");
  }
};
