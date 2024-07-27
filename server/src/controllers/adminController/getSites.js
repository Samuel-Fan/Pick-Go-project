const { Site } = require("../../models");

module.exports = async (req, res) => {
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

    // 若快取沒有，則搜尋資料庫
    let searchObj = Object.assign(
      {},
      country && { country },
      region && { region },
      type && { type },
      username && { "author.username": { $regex: username, $options: "i" } },
      title && { title: { $regex: title, $options: "i" } }
    );

    let sortObj;
    if (orderBy === "date") {
      sortObj = { updateDate: -1 };
    } else if (orderBy === "like") {
      sortObj = { num_of_like: -1, updateDate: -1 };
    }

    foundSite = await Site.aggregate([
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
          title: 1,
          country: 1,
          region: 1,
          content: 1,
          public: 1,
          photo: 1,
          updateDate: 1,
          "author._id": 1,
          "author.username": 1,
          num_of_like: { $size: "$like" },
        },
      },
      {
        $sort: sortObj,
      },
      { $skip: (page - 1) * numberPerPage },
      { $limit: Number(numberPerPage) },
    ]);

    return res.send(foundSite);
  } catch (e) {
    next(e);
  }
};
