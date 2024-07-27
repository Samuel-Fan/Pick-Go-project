const { Site } = require("../../models");
const redisClient = require("../../config/redis").redisClient_other;
const hash = require("object-hash");

module.exports = async (req, res, next) => {
  // 先搜尋快取中有沒有
  let queryHash = hash.sha1(req.query);
  let cacheData = await redisClient.get(`sites_search_count_hash:${queryHash}`);
  if (cacheData) {
    return res.send(cacheData);
  }

  let { title, country, region, type, username } = req.query;
  let searchObj = Object.assign(
    {},
    country && { country },
    region && { region },
    type && { type },
    username && { "author.username": { $regex: username, $options: "i" } },
    title && { title: { $regex: title, $options: "i" } },
    { public: true }
  );

  try {
    let count = await Site.aggregate([
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
      { $count: "count" },
    ]);

    count = count[0] || { count: 0 };

    // 存入快取，過期時間與search一致
    await redisClient.set(
      `sites_search_count_hash:${queryHash}`,
      JSON.stringify(count),
      {
        EX: 1 * 60 * 1,
      }
    );

    return res.send(count);
  } catch (e) {
    next(e);
  }
};
