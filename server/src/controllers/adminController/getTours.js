const { Tour } = require("../../models");

module.exports = async (req, res) => {
  try {
    let { title, username, page, numberPerPage } = req.query;

    let searchObj = Object.assign(
      {},
      title && { title: { $regex: title, $options: "i" } },
      username && { "author.username": { $regex: username, $options: "i" } }
    );

    foundTour = await Tour.aggregate([
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

    return res.send(foundTour);
  } catch (e) {
    next(e);
  }
};
