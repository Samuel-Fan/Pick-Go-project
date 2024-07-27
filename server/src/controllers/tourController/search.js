const { Tour } = require("../../models");
const redisClient = require("../../config/redis").redisClient_other;
const hash = require("object-hash");

module.exports = async (req, res, next) => {
  try {
    let { title, username, status, page, numberPerPage } = req.query;
    // 先搜尋快取中有沒有
    let queryHash = hash.sha1(req.query);
    let cacheData = await redisClient.get(`tours_search_hash:${queryHash}`);
    if (cacheData) {
      return res.send(cacheData);
    }

    // 若快取沒有，則搜尋資料庫
    // 建立搜尋關鍵字
    let searchObj = Object.assign(
      {},
      title && { title: { $regex: title, $options: "i" } },
      username && { "author.username": { $regex: username, $options: "i" } },
      status === "true" ? { status: "找旅伴" } : { status: { $ne: "不公開" } }
    );

    // 搜尋
    let foundTour = await Tour.aggregate([
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
      {
        $lookup: {
          from: "tourists",
          localField: "_id",
          foreignField: "tour_id",
          as: "participants",
          pipeline: [
            { $match: { $or: [{ type: "主辦者" }, { type: "參加者" }] } },
          ],
        },
      },
      {
        $project: {
          num_of_participants: { $size: "$participants" },
          title: 1,
          description: 1,
          status: 1,
          totalDays: 1,
          limit: 1,
          updateDate: 1,
          "author.username": 1,
          "author._id": 1,
        },
      },
      { $skip: (page - 1) * numberPerPage },
      { $limit: Number(numberPerPage) },
    ]);

    // 存入快取，過期時間先設定短一點(方便展示project用)
    await redisClient.set(
      `tours_search_hash:${queryHash}`,
      JSON.stringify(foundTour),
      {
        EX: 1 * 60 * 1,
      }
    );

    return res.send(foundTour);
  } catch (e) {
    next(e);
  }
};
