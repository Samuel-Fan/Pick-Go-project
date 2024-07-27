const { Tour, TourSite, Tourist } = require("../../models");
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = async (req, res) => {
  try {
    let { _id } = req.params;

    await Promise.all([
      Tour.deleteOne({ _id: new ObjectId(_id) }),
      Tourist.deleteMany({ tour_id: new ObjectId(_id) }),
      TourSite.deleteMany({ tour_id: new ObjectId(_id) }),
    ]);

    return res.send("刪除完畢");
  } catch (e) {
    next(e);
  }
};
