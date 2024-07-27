const { Site } = require("../../models");
const ObjectId = require("mongoose").Types.ObjectId;
const redisClient = require("../../config/redis").redisClient_other;

module.exports = async (req, res, next) => {
  let { _id } = req.params;
  try {
    let foundSite = await Site.aggregate([
      {
        $match: {
          _id: new ObjectId(_id),
        },
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "site_id",
          as: "like",
        },
      },
      {
        $lookup: {
          from: "collections",
          localField: "_id",
          foreignField: "site_id",
          as: "collection",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author",
        },
      },
      { $unwind: "$author" },
      {
        $project: {
          num_of_like: { $size: "$like" },
          num_of_collection: { $size: "$collection" },
          title: 1,
          country: 1,
          region: 1,
          type: 1,
          content: 1,
          photo: 1,
          "author._id": 1,
          "author.username": 1,
          public: 1,
          updateDate: 1,
        },
      },
    ]);

    foundSite = foundSite[0];

    // 需作者本人才能查
    if (!foundSite.author._id.equals(req.user._id)) {
      return res.status(403).send("只有作者才能看");
    }

    // 若site是公開，則存入快取，時間設定 30-60 分鐘
    let randomTime = Math.floor(Math.random() * 31) + 30; // 使用隨機數，防快取雪崩 Cache Avalanche
    if (foundSite.public) {
      await redisClient.set(`Site:${_id}`, JSON.stringify(foundSite), {
        EX: randomTime * 60 * 1,
      });
    }

    return res.send(foundSite);
  } catch (e) {
    next(e);
  }
};
