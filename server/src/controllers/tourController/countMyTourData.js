const { Tour } = require("../../models");
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = async (req, res, next) => {
  let { _id } = req.user;
  try {
    let count = await Tour.find({ author: new ObjectId(_id) })
      .count()
      .exec();
    return res.send({ count });
  } catch (e) {
    next(e);
  }
};
