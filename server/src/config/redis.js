const { createClient } = require("redis");
require("dotenv").config();

let redisClient = createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: "redis-19204.c281.us-east-1-2.ec2.redns.redis-cloud.com",
    port: 19204,
  },
});

module.exports = redisClient;
