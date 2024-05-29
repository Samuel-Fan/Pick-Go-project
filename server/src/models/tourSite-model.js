const mongoose = require("mongoose");
const { Schema } = mongoose;

const tourSiteSchema = new Schema({
  tour_id: { type: Schema.Types.ObjectId, ref: "Tour" }, // Tour 的 primary key
  site_id: { type: Schema.Types.ObjectId, ref: "Site", index: true }, // Tour 的 primary key
  day: { type: Number },
});

module.exports = mongoose.model("TourSite", tourSiteSchema);
