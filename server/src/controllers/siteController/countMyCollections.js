const { Collection } = require("../../models");
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = async (req, res, next) => {
  try {
    let count = await Collection.find({
      user_id: new ObjectId(req.user._id),
    })
      .count()
      .exec();
    return res.send({ count });
  } catch (e) {
    next(e);
  }
};
