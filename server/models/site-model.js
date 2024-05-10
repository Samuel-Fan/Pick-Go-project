const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcrypt");

const siteSchema = new Schema({
  photoBinData: { type: Buffer },
});

module.exports = mongoose.model("Site", siteSchema);
