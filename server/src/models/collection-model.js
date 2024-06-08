const mongoose = require("mongoose");
const { Schema } = mongoose;

// 處理用戶對景點收藏

const collectionSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: "User" }, // User 的 primary key
  site_id: { type: Schema.Types.ObjectId, ref: "Site", index: true }, // Site 的 primary key
});

module.exports = mongoose.model("Collection", collectionSchema);
