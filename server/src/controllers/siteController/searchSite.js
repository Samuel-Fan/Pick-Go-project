const { Site } = require("../../models");
const redisClient = require("../../config/redis").redisClient_other;
const hash = require("object-hash");

module.exports = async (req, res, next) => {
  try {
    let {
      title,
      country,
      region,
      type,
      username,
      page,
      numberPerPage,
      orderBy,
    } = req.query;

    // 先搜尋快取中有沒有
    let queryHash = hash.sha1(req.query);
    let cacheData = await redisClient.get(`sites_search_hash:${queryHash}`);
    if (cacheData) {
      return res.send(cacheData);
    }

    // 若快取沒有，則搜尋資料庫
    // 設定搜尋條件
    let searchObj = Object.assign(
      {},
      country && { country },
      region && { region },
      type && { type },
      username && { "author.username": { $regex: username, $options: "i" } },
      title && { title: { $regex: title, $options: "i" } },
      { public: true }
    );

    let sortObj;
    if (orderBy === "date") {
      sortObj = { updateDate: -1 };
    } else if (orderBy === "like") {
      sortObj = { num_of_like: -1, updateDate: -1 };
    }

    // 搜尋
    let foundSite = await Site.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          pipeline: [{ $project: { username: 1 } }],
          as: "author",
        },
      },
      { $unwind: "$author" },
      { $match: searchObj },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "site_id",
          as: "like",
        },
      },
      {
        $project: {
          num_of_like: { $size: "$like" },
          title: 1,
          country: 1,
          region: 1,
          type: 1,
          content: 1,
          photo: 1,
          updateDate: 1,
          "author._id": 1,
          "author.username": 1,
        },
      },
      {
        $sort: sortObj,
      },
      { $skip: (page - 1) * numberPerPage },
      { $limit: Number(numberPerPage) },
    ]);

    // 存入快取，過期時間先設定短一點(方便展示project用)
    await redisClient.set(
      `sites_search_hash:${queryHash}`,
      JSON.stringify(foundSite),
      {
        EX: 1 * 60 * 1,
      }
    );

    return res.send(foundSite);
  } catch (e) {
    next(e);
  }
};
