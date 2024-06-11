const redisClient = require("../config/redis").redisClient_user;

// 單一IP限流
class IPLimiter {
  constructor(maxLimit, interval) {
    this.maxLimit = maxLimit;
    this.interval = interval;
  }

  limiter = async (req, res, next) => {
    let record = await redisClient.get(`IP:${req.ip}`);
    console.log(record);
    if (record === "lock") {
      return res.status(429).send("Too many requests");
    } else {
      this.count(req.ip, record);
      next();
    }
  };

  count = async (ip, record) => {
    // 若有紀錄，則增加計數
    if (record) {
      record = 1 + Number(record);
      await redisClient.set(`IP:${ip}`, record, {
        EX: 1 * 60 * 1,
      });
      this.checkLimit(ip, record);
    } else {
      // 若無紀錄，開始計算
      await redisClient.set(`IP:${ip}`, 0, {
        EX: 1 * 60 * 1,
      });
      this.setClear(ip);
    }
  };

  checkLimit = async (ip, record) => {
    if (record >= this.maxLimit) {
      await redisClient.set(`IP:${ip}`, "lock", {
        EX: 1 * 60 * 1,
      });
      console.log("ip:" + ip + "因流量過高遭到鎖定");
    }
  };

  setClear = (ip) => {
    setTimeout(() => {
      redisClient.del(`IP:${ip}`);
    }, this.interval);
  };
}

// 總限流設定
class RateLimiter {
  constructor(maxTokens, refillRate, interval) {
    this.maxTokens = maxTokens;
    this.tokens = maxTokens;
    this.refillRate = refillRate;
    this.interval = interval;
  }

  // 每分鐘總限流
  tokenBucket = (req, res, next) => {
    if (this.tokens > 0) {
      this.tokens -= 1;
      console.log(this.tokens);
      next();
    } else {
      return res.status(429).send("Too many requests");
    }
  };

  refill = () => {
    setInterval(() => {
      if (this.tokens < this.maxTokens) {
        this.tokens += this.refillRate;
        console.log("refill", this.tokens);
      } else {
        this.tokens = this.maxTokens;
      }
    }, this.interval);
  };
}

const singleIPLimiter = new IPLimiter(100, 1 * 60 * 1000); // 單IP每分鐘限100次
const totalRateLimiter = new RateLimiter(5000, 100, 1 * 60 * 1000);

module.exports = { singleIPLimiter, totalRateLimiter };
