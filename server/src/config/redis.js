const { createClient } = require("redis");
require("dotenv").config();

const redisClient_user = createClient({
  password: process.env.REDIS_PASSWORD_USER,
  socket: {
    host: "redis-13344.c1.asia-northeast1-1.gce.redns.redis-cloud.com",
    port: 13344,
  },
});

const redisClient_other = createClient({
  password: process.env.REDIS_PASSWORD_OTHER,
  socket: {
    host: "redis-16267.c257.us-east-1-3.ec2.redns.redis-cloud.com",
    port: 16267,
  },
});

module.exports = { redisClient_user, redisClient_other };
