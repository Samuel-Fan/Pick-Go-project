const {
  User,
  Site,
  Collection,
  Like,
  Tour,
  TourSite,
  Tourist,
} = require("../../models");
const imgurClient = require("../../config/imgur");
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = async (req, res) => {
  try {
    let { _id } = req.params;

    // 防呆
    if (req.user._id === _id) {
      return res.status(400).send("不能刪除自己!");
    }

    // 找使用者、其建立的景點、其建立的旅程
    let [foundUser, site_arr, tour_arr] = await Promise.all([
      User.findOne({ _id: new ObjectId(_id) })
        .select(["photo"])
        .lean()
        .exec(),
      Site.find({ author: new ObjectId(_id) })
        .select(["photo"])
        .lean()
        .exec(),
      Tour.find({ author: new ObjectId(_id) })
        .select(["_id"])
        .lean()
        .exec(),
    ]);

    await Promise.all([
      User.deleteOne({ _id }),
      imgurClient.deleteImage(foundUser.photo.deletehash),
      Site.deleteMany({ author: new ObjectId(_id) }),
      Like.deleteMany({ user_id: new ObjectId(_id) }),
      Collection.deleteMany({ user_id: new ObjectId(_id) }),
      Tour.deleteMany({ author: new ObjectId(_id) }),
      Tourist.deleteMany({ user_id: new ObjectId(_id) }),
    ]);

    site_arr.forEach(async (site) => {
      await Promise.all([
        Like.deleteMany({ site_id: new ObjectId(site._id) }),
        Collection.deleteMany({ site_id: new ObjectId(site._id) }),
        imgurClient.deleteImage(site.photo.deletehash),
      ]);
    });

    tour_arr.forEach(async (tour) => {
      await Promise.all([
        TourSite.deleteMany({ tour_id: new ObjectId(tour._id) }),
        Tourist.deleteMany({ tour_id: new ObjectId(tour._id) }),
      ]);
    });

    return res.send("刪除完畢");
  } catch (e) {
    next(e);
  }
};
