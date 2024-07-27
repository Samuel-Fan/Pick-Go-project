const { Tour } = require("../../models");
const redisClient = require("../../config/redis").redisClient_other;
const hash = require("object-hash");

module.exports = async (req, res, next) => {
  try {
    // 先搜尋快取中有沒有
    let queryHash = hash.sha1(req.query);
    let cacheData = await redisClient.get(
      `tours_search_count_hash:${queryHash}`
    );
    if (cacheData) {
      return res.send(cacheData);
    }

    let { title, username, status } = req.query;
    let searchObj = Object.assign(
      {},
      title && { title: { $regex: title, $options: "i" } },
      username && { "author.username": { $regex: username, $options: "i" } },
      status === "true" ? { status: "找旅伴" } : { status: { $ne: "不公開" } }
    );

    let count = await Tour.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author",
          pipeline: [{ $project: { username: 1 } }],
        },
      },
      { $unwind: "$author" },
      { $match: searchObj },
      { $count: "count" },
    ]);

    count = count[0] || { count: 0 };

    // 存入快取，過期時間與search一致
    await redisClient.set(
      `tours_search_count_hash:${queryHash}`,
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
