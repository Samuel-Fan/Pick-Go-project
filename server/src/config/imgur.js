const { ImgurClient } = require("imgur");
require("dotenv").config();

const imgurClient = new ImgurClient({
  clientId: process.env.IMGUR_CLIENTID,
  clientSecret: process.env.IMGUR_CLIENT_SECRET,
  refreshToken: process.env.IMGUR_REFRESH_TOKEN,
});

module.exports = imgurClient;
