const User = require("../../models").User;
const redisClient = require("../../config/redis").redisClient_user;

module.exports = async (req, res, next) => {
  let { _id } = req.params;
  try {
    // 先找快取;
    let cacheData = await redisClient.get(`public_user_${_id}`);
    if (cacheData) {
      switch (cacheData) {
        case "404":
          return res.status(404).send("找不到使用者");
        case "403":
          return res.status(403).send("該使用者不公開資料");
        default:
          return res.send(cacheData);
      }
    }

    // 快取找不到，則搜尋資料庫
    let foundUser = await User.findOne({ _id })
      .select({ password: 0 })
      .lean()
      .exec();

    // 若搜尋不到使用者
    if (!foundUser) {
      redisClient.set(`public_user_${_id}`, "400", {
        EX: 24 * 60 * 1,
      });
      return res.status(404).send("找不到使用者");
    }

    // 若不公開
    if (!foundUser.public) {
      redisClient.set(`public_user_${_id}`, "403", {
        EX: 24 * 60 * 1,
      });
      return res.status(403).send("該使用者不公開資料");
    }

    // 若有找到又有公開，先存入快取
    redisClient.set(`public_user_${_id}`, JSON.stringify(foundUser), {
      EX: 24 * 60 * 1,
    });

    return res.send(foundUser);
  } catch (e) {
    next(e);
  }
};
