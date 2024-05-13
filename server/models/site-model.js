const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcrypt");

const siteSchema = new Schema({
  title: { type: String },
  country: { type: String, enum: ["日本"] }, // 之後可以再新增
  region: { type: String },
  type: { type: String, enum: ["餐廳", "景點", "購物", "其他"] },
  content: { type: String },
  author: { type: Schema.Types.ObjectId, ref: "User" }, // User 的 primary key
  photo: { url: String, deleteHash: String }, // 儲存 imgur 網址
  createdDate: { type: Date, default: Date.now },
  updateDate: { type: Date, default: Date.now },
  public: { type: Boolean, default: false }, // 公開或不公開
  followers: { type: Number, default: 0 }, // 被追蹤的數目
});

module.exports = mongoose.model("Site", siteSchema);
