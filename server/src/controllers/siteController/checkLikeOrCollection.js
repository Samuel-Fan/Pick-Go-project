const { Like, Collection } = require("../../models");

module.exports = async (req, res, next) => {
  let site_id = req.params._id;
  let user_id = req.user._id;

  try {
    let [like, collection] = await Promise.all([
      Like.findOne({ user_id, site_id }).lean().exec(),
      Collection.findOne({ user_id, site_id }).lean().exec(),
    ]);

    let result = {
      like: like ? true : false,
      collection: collection ? true : false,
    };
    return res.send(result);
  } catch (e) {
    next(e);
  }
};
