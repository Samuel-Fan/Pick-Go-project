const { Site, Collection, Like } = require("../../models");
const imgurClient = require("../../config/imgur");
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = async (req, res) => {
  try {
    let { _id } = req.params;

    let foundSite = await Site.findOne({ _id: new ObjectId(_id) }).exec();
    if (!foundSite) {
      return res.status(400);
    }

    await Promise.all([
      Site.deleteOne({ _id: new ObjectId(_id) }),
      Like.deleteMany({ site_id: new ObjectId(_id) }),
      Collection.deleteMany({ site_id: new ObjectId(_id) }),
      imgurClient.deleteImage(foundSite.photo.deletehash), // 刪imgur圖片
    ]);

    return res.send("刪除完畢");
  } catch (e) {
    next(e);
  }
};
