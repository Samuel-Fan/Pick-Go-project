// 為了防止 race condition 寫出來的 lock，用於rateLimiter

class Mutex {
  constructor() {
    this.lock = false;
    this.event = [];
  }

  unlock = () => {
    if (this.event.length > 0) {
      let currentEvent = this.event.shift();
      currentEvent(this.unlock);
    } else {
      this.lock = false;
    }
  };

  locked = () => {
    if (this.lock) {
      return new Promise((resolve) => this.event.push(resolve));
    } else {
      this.lock = true;
      return new Promise((resolve) => resolve(this.unlock));
    }
  };
}

module.exports = new Mutex();
