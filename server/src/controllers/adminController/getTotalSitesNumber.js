const { Site } = require("../../models");

module.exports = async (req, res) => {
  let { title, country, region, type, username } = req.query;
  let searchObj = Object.assign(
    {},
    country && { country },
    region && { region },
    type && { type },
    username && { "author.username": { $regex: username, $options: "i" } },
    title && { title: { $regex: title, $options: "i" } }
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
