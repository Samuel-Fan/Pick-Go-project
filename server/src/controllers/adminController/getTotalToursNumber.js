const { Tour } = require("../../models");

module.exports = async (req, res) => {
  try {
    let { title, username } = req.query;
    let searchObj = Object.assign(
      {},
      title && { title: { $regex: title, $options: "i" } },
      username && { "author.username": { $regex: username, $options: "i" } }
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
      { $unwind: { path: "$author", preserveNullAndEmptyArrays: true } },
      { $match: searchObj },
      { $count: "count" },
    ]);

    count = count[0] || { count: 0 };

    return res.send(count);
  } catch (e) {
    next(e);
  }
};
