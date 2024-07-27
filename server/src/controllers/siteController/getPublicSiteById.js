const { Site } = require("../../models");
const ObjectId = require("mongoose").Types.ObjectId;
const redisClient = require("../../config/redis").redisClient_other;

module.exports = async (req, res, next) => {
  let { _id } = req.params;
  try {
    // 先搜尋快取中有無數據
    // 先找快取;
    let cacheData = await redisClient.get(`Site:${_id}`);
    if (cacheData) {
      switch (cacheData) {
        case "404":
          return res.status(404).send("無此景點存在");
        case "403":
          return res.status(403).send("作者不公開相關頁面");
        default:
          return res.send(cacheData);
      }
    }

    // 若找不到則搜尋資料庫
    let foundSite = await Site.aggregate([
      { $match: { _id: new ObjectId(_id) } },
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

    // 若沒找到資料
    if (!foundSite) {
      // 找不到資料也存進快取，防快取穿透 Cache Penetration
      await redisClient.set(`Site:${_id}`, "404", {
        EX: 60 * 60 * 1,
      });
      return res.status(404).send("無此資料");
    }

    // 若搜尋到則確認其是否公開，若不公開則返回403錯誤
    if (!foundSite.public) {
      await redisClient.set(`Site:${_id}`, "403", {
        // 防快取穿透 Cache Penetration，其實期限可以設久一點
        EX: 60 * 60 * 1,
      });
      return res.status(403).send("作者不公開相關頁面");
    }

    // 若景點是公開，則存入快取，時間設定 10 分鐘
    if (foundSite.public) {
      await redisClient.set(`Site:${_id}`, JSON.stringify(foundSite), {
        EX: 10 * 60 * 1,
      });
    }

    return res.send(foundSite);
  } catch (e) {
    next(e);
  }
};
