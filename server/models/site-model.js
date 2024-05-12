const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcrypt");

const siteSchema = new Schema({
  link: { type: String }, // 儲存 imgur 網址
});

module.exports = mongoose.model("Site", siteSchema);
