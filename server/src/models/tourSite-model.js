const mongoose = require("mongoose");
const { Schema } = mongoose;

const tourSiteSchema = new Schema({
  tour_id: { type: Schema.Types.ObjectId, ref: "Tour", index: true }, // Tour 的 primary key
  site_id: { type: Schema.Types.ObjectId, ref: "Site" }, // Site 的 primary key
  day: { type: Number },
});

module.exports = mongoose.model("TourSite", tourSiteSchema);
