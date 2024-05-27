const hash = require("object-hash");

let obj = { name: "samuel" };

let result = hash.sha1(obj);
console.log(result);
