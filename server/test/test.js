const supertest = require("supertest");
const bcrypt = require("bcrypt");
require("dotenv").config();

const api = supertest(process.env.SERVER_URI + "/api");

let testRandom = Math.floor(Math.random() * 1000000).toString();

// 註冊、登入取得JWT token、使用者相關操作

let userA_id;
let jwtToken_A;
let userB_id;
let jwtToken_B;
let userC_id;
let jwtToken_C;
describe("註冊、登入系統", () => {
  // user 功能測試用
  it("註冊帳號 A", (done) => {
    api
      .post("/users/register")
      .send({
        email: `test${testRandom}a@gmail.com`,
        password: "test12345",
        confirmPassword: "test12345",
        username: "test",
      })
      .set("Accept", "application/json")
      .expect(201, done);
  });

  it("登入帳號", (done) => {
    api
      .post("/users/login")
      .send({
        email: `test${testRandom}a@gmail.com`,
        password: "test12345",
      })
      .set("Accept", "multipart/form-data")
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        jwtToken_A = res.body.jwtToken;
        userA_id = res.body.user._id;
        expect(res.body).to.have.property("user");
        expect(res.body).to.have.property("jwtToken");
        done();
      });
  });

  // site, tour 功能測試用
  it("註冊帳號 B", (done) => {
    api
      .post("/users/register")
      .send({
        email: `test${testRandom}b@gmail.com`,
        password: "test12345",
        confirmPassword: "test12345",
        username: "test",
      })
      .set("Accept", "application/json")
      .expect(201, done);
  });

  it("登入帳號", (done) => {
    api
      .post("/users/login")
      .send({
        email: `test${testRandom}b@gmail.com`,
        password: "test12345",
      })
      .set("Accept", "multipart/form-data")
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        jwtToken_B = res.body.jwtToken;
        userB_id = res.body.user._id;
        expect(res.body).to.have.property("user");
        expect(res.body).to.have.property("jwtToken");
        done();
      });
  });

  it("註冊帳號 C", (done) => {
    api
      .post("/users/register")
      .send({
        email: `test${testRandom}c@gmail.com`,
        password: "test12345",
        confirmPassword: "test12345",
        username: "test",
      })
      .set("Accept", "application/json")
      .expect(201, done);
  });

  it("登入帳號", (done) => {
    api
      .post("/users/login")
      .send({
        email: `test${testRandom}c@gmail.com`,
        password: "test12345",
      })
      .set("Accept", "multipart/form-data")
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        jwtToken_C = res.body.jwtToken;
        userC_id = res.body.user._id;
        expect(res.body).to.have.property("user");
        expect(res.body).to.have.property("jwtToken");
        done();
      });
  });

  it("取得個人資料", (done) => {
    api
      .get("/users")
      .set("Authorization", jwtToken_A)
      .expect(200)
      .end(async (err, res) => {
        if (err) return done(err);
        expect(res.body).to.have.property("_id");
        expect(res.body._id, "").to.be.a("string");
        expect(res.body).to.have.property("email");
        expect(res.body.email).equal(`test${testRandom}a@gmail.com`);
        expect(res.body).to.have.property("username");
        expect(res.body.username).equal(`test`);
        expect(res.body).to.have.property("password");
        expect(
          await bcrypt.compare("test12345", res.body.password),
          "密碼應經過 hash 處理"
        ).to.be.true;
        expect(res.body.photo).to.be.a("object");
        expect(res.body).to.have.property("public");
        expect(res.body.public).to.be.false;
        done();
      });
  });

  // 剛創建的帳號為不公開
  it("應無法取得不公開之個人資料", (done) => {
    api.get(`/users/profile/${userA_id}`).expect(403, done());
  });

  it("修改個人資料(密碼以外)", (done) => {
    api
      .patch("/users/basic")
      .field({
        username: "Samuel",
        gender: "男",
        age: "30",
        description: "This is a test.",
        public: true,
      })
      .set("Authorization", jwtToken_A)
      .expect(200)
      .end(async (err, res) => {
        if (err) return done(err);
        done();
      });
  });

  it("修改個人資料(密碼以外)--驗證資料", (done) => {
    api
      .get("/users")
      .set("Authorization", jwtToken_A)
      .expect(200)
      .end(async (err, res) => {
        if (err) return done(err);
        expect(res.body).to.have.property("username");
        expect(res.body.username).equal("Samuel");
        expect(res.body).to.have.property("gender");
        expect(res.body.gender).equal("男");
        expect(res.body).to.have.property("age");
        expect(res.body.age).equal(30);
        expect(res.body).to.have.property("description");
        expect(res.body.description).equal("This is a test.");
        expect(res.body).to.have.property("public");
        expect(res.body.public).to.be.true;
        done();
      });
  });

  it("應可以取得公開之個人資料", (done) => {
    api
      .get(`/users/profile/${userA_id}`)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.have.property("_id");
        expect(res.body._id, "").to.be.a("string");
        expect(res.body).to.have.property("email");
        expect(res.body.email).equal(`test${testRandom}a@gmail.com`);
        expect(res.body.photo).to.be.a("object");
        expect(res.body).to.have.property("username");
        expect(res.body.username).equal("Samuel");
        expect(res.body).to.have.property("gender");
        expect(res.body.gender).equal("男");
        expect(res.body).to.have.property("age");
        expect(res.body.age).equal(30);
        expect(res.body).to.have.property("description");
        expect(res.body.description).equal("This is a test.");
        expect(res.body).to.not.have.property("password");
        done();
      });
  });

  it("修改個人資料(密碼) - 舊密碼不符合", (done) => {
    api
      .patch("/users/password")
      .send({
        oldPassword: "123456",
        password: "test54321",
        confirmPassword: "test54321",
      })
      .set("Authorization", jwtToken_A)
      .expect(400, done);
  });

  it("修改個人資料(密碼) - 新密碼、確認密碼不符合", (done) => {
    api
      .patch("/users/password")
      .send({
        oldPassword: "test12345",
        password: "test54321",
        confirmPassword: "test",
      })
      .set("Authorization", jwtToken_A)
      .expect(400, done);
  });

  it("修改個人資料(密碼) -- 成功修改", (done) => {
    api
      .patch("/users/password")
      .send({
        oldPassword: "test12345",
        password: "test54321",
        confirmPassword: "test54321",
      })
      .set("Authorization", jwtToken_A)
      .expect(200, done);
  });

  it("修改個人資料(密碼) -- 確認新密碼", (done) => {
    api
      .get("/users")
      .set("Authorization", jwtToken_A)
      .expect(200)
      .end(async (err, res) => {
        if (err) return done(err);
        expect(await bcrypt.compare("test54321", res.body.password)).to.be.true;
        done();
      });
  });
});

let siteA_id;
let siteB_id;

describe("測試景點增查改功能", () => {
  // User A 創建景點 A
  it("創建新的景點", (done) => {
    api
      .post("/sites/new")
      .field({
        title: "test",
        country: "日本",
        region: "關東",
        type: "其他",
        content: "測試A",
        public: false,
      })
      .set("Authorization", jwtToken_A)
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);
        siteA_id = res.body._id;
        done();
      });
  });

  // User A 創建景點 B
  it("創建新的景點", (done) => {
    api
      .post("/sites/new")
      .field({
        title: "test",
        country: "臺灣",
        region: "台北",
        type: "餐廳",
        content: "測試B",
        public: true,
      })
      .set("Authorization", jwtToken_A)
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);
        siteB_id = res.body._id;
        done();
      });
  });

  it("未登入下，無法查詢自己(user A)創建的景點", (done) => {
    api.get("/sites/mySite?page=1&numberPerPage=8").expect(401, done);
  });

  it("查詢自己(user A)創建的景點", (done) => {
    api
      .get("/sites/mySite?page=1&numberPerPage=8")
      .set("Authorization", jwtToken_A)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.be.a("array");
        expect(res.body).to.have.lengthOf(2);
        expect(res.body[0]).to.have.property("_id");
        expect(res.body[0]).to.have.property("title");
        expect(res.body[0]).to.have.property("country");
        expect(res.body[0]).to.have.property("region");
        expect(res.body[0]).to.have.property("content");
        expect(res.body[0]).to.have.property("author");
        expect(res.body[0].author).to.have.property("_id");
        expect(res.body[0].author).to.have.property("username");
        expect(res.body[0]).to.have.property("public");
        expect(res.body[0]).to.have.property("updateDate");
        expect(res.body[0]).to.have.property("num_of_like");
        done();
      });
  });

  it("查詢自己(user A)創建的景點設數量", (done) => {
    api
      .get("/sites/mySite/count")
      .set("Authorization", jwtToken_A)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.be.a("object");
        expect(res.body).to.have.property("count");
        expect(res.body.count).to.be.equal(2);
        done();
      });
  });

  it("查詢自己不公開的景點A 詳細資料(私人頁面)", (done) => {
    api
      .get(`/sites/mySite/detail/${siteA_id}`)
      .set("Authorization", jwtToken_A)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.be.a("object");
        expect(res.body).to.have.property("_id");
        expect(res.body).to.have.property("title");
        expect(res.body.title).to.be.equal("test");
        expect(res.body).to.have.property("country");
        expect(res.body.country).to.be.equal("日本");
        expect(res.body).to.have.property("region");
        expect(res.body.region).to.be.equal("關東");
        expect(res.body).to.have.property("type");
        expect(res.body.type).to.be.equal("其他");
        expect(res.body).to.have.property("content");
        expect(res.body.content).to.be.equal("測試A");
        expect(res.body).to.have.property("author");
        expect(res.body.author).to.have.property("_id");
        expect(res.body.author._id).to.be.equal(userA_id);
        expect(res.body.author).to.have.property("username");
        expect(res.body.author.username).to.be.equal("Samuel");
        expect(res.body).to.have.property("public");
        expect(res.body.public).to.be.false;
        expect(res.body).to.have.property("updateDate");
        expect(res.body).to.have.property("num_of_like");
        expect(res.body.num_of_like).to.be.equal(0);
        expect(res.body).to.have.property("num_of_collection");
        expect(res.body.num_of_collection).to.be.equal(0);
        done();
      });
  });

  it("查詢自己公開景點B 詳細資料(私人頁面)", (done) => {
    api
      .get(`/sites/mySite/detail/${siteB_id}`)
      .set("Authorization", jwtToken_A)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.be.a("object");
        expect(res.body).to.have.property("_id");
        expect(res.body).to.have.property("title");
        expect(res.body).to.have.property("country");
        expect(res.body).to.have.property("region");
        expect(res.body).to.have.property("type");
        expect(res.body).to.have.property("content");
        expect(res.body).to.have.property("author");
        expect(res.body.author).to.have.property("_id");
        expect(res.body.author).to.have.property("username");
        expect(res.body).to.have.property("public");
        expect(res.body.public).to.be.true;
        expect(res.body).to.have.property("updateDate");
        expect(res.body).to.have.property("num_of_like");
        expect(res.body).to.have.property("num_of_collection");
        done();
      });
  });

  it("未登入下，無法查詢自己景點 詳細資料(私人頁面)", (done) => {
    api.get(`/sites/mySite/detail/${siteB_id}`).expect(401, done);
  });

  it("不可於私人頁面查詢非自己創立的景點", (done) => {
    api
      .get(`/sites/mySite/detail/${siteA_id}`)
      .set("Authorization", jwtToken_B)
      .expect(403, done);
  });

  it("不可於私人頁面查詢非自己創立的景點", (done) => {
    api
      .get(`/sites/mySite/detail/${siteB_id}`)
      .set("Authorization", jwtToken_B)
      .expect(403, done);
  });

  it("公開頁面、未登入情況下，查詢不公開的景點A", (done) => {
    api.get(`/sites/detail/${siteA_id}`).expect(403, done);
  });

  it("公開頁面、未登入情況下，查詢公開的景點B", (done) => {
    api
      .get(`/sites/detail/${siteB_id}`)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        let data =
          Object.keys(res.body).length === 0 ? JSON.parse(res.text) : res.body; // 從 快取給資料 or 資料庫提取資料
        expect(data).to.be.a("object");
        expect(data).to.have.property("_id");
        expect(data).to.have.property("title");
        expect(data).to.have.property("country");
        expect(data).to.have.property("region");
        expect(data).to.have.property("type");
        expect(data).to.have.property("content");
        expect(data).to.have.property("author");
        expect(data.author).to.have.property("_id");
        expect(data.author).to.have.property("username");
        expect(data).to.have.property("public");
        expect(data.public).to.be.true;
        expect(data).to.have.property("updateDate");
        expect(data).to.have.property("num_of_like");
        expect(data).to.have.property("num_of_collection");
        done();
      });
  });

  it("修改景點A", (done) => {
    api
      .patch(`/sites/${siteA_id}`)
      .field({
        title: "modified test",
        country: "臺灣",
        region: "台中",
        type: "景點",
        content: "應該要改過",
        public: true,
      })
      .set("Authorization", jwtToken_A)
      .expect(200, done);
  });

  it("確認景點A有修改好", (done) => {
    api
      .get(`/sites/mySite/detail/${siteA_id}`)
      .set("Authorization", jwtToken_A)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.be.a("object");
        expect(res.body).to.have.property("_id");
        expect(res.body).to.have.property("title");
        expect(res.body.title).to.be.equal("modified test");
        expect(res.body).to.have.property("country");
        expect(res.body.country).to.be.equal("臺灣");
        expect(res.body).to.have.property("region");
        expect(res.body.region).to.be.equal("台中");
        expect(res.body).to.have.property("type");
        expect(res.body.type).to.be.equal("景點");
        expect(res.body).to.have.property("content");
        expect(res.body.content).to.be.equal("應該要改過");
        expect(res.body).to.have.property("author");
        expect(res.body).to.have.property("public");
        expect(res.body.public).to.be.true;
        done();
      });
  });
});

// 景點 點讚、收藏測試

describe("景點點讚、收藏測試", () => {
  it("未登入下無法對公開景點 點讚", (done) => {
    api.put(`/sites/like/${siteB_id}`).expect(401, done);
  });

  it("未登入下無法對公開景點 收藏", (done) => {
    api.put(`/sites/collection/${siteB_id}`).expect(401, done);
  });

  it("使用者A對自己建立的公開景點 點讚", (done) => {
    api
      .put(`/sites/like/${siteB_id}`)
      .set("Authorization", jwtToken_A)
      .expect(200, done);
  });

  it("使用者A對自己建立的公開景點 收藏", (done) => {
    api
      .put(`/sites/collection/${siteB_id}`)
      .set("Authorization", jwtToken_A)
      .expect(200, done);
  });

  it("使用者B對他人建立的公開景點 點讚", (done) => {
    api
      .put(`/sites/like/${siteB_id}`)
      .set("Authorization", jwtToken_B)
      .expect(200, done);
  });

  it("使用者B對他人建立的公開景點 收藏", (done) => {
    api
      .put(`/sites/collection/${siteB_id}`)
      .set("Authorization", jwtToken_B)
      .expect(200, done);
  });

  it("確認自己是否點過讚、收藏", (done) => {
    api
      .get(`/sites/like_collection/${siteB_id}`)
      .set("Authorization", jwtToken_B)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.be.a("object");
        expect(res.body).to.have.property("like");
        expect(res.body.like).to.be.true;
        expect(res.body).to.have.property("collection");
        expect(res.body.collection).to.be.true;
        done();
      });
  });

  it("確認按讚、收藏數量正確", (done) => {
    api
      .get(`/sites/mySite/detail/${siteB_id}`)
      .set("Authorization", jwtToken_A)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.be.a("object");
        expect(res.body).to.have.property("num_of_like");
        expect(res.body.num_of_like).to.be.equal(2);
        expect(res.body).to.have.property("num_of_collection");
        expect(res.body.num_of_collection).to.be.equal(2);
        done();
      });
  });

  it("B收回讚", (done) => {
    api
      .delete(`/sites/like/${siteB_id}`)
      .set("Authorization", jwtToken_B)
      .expect(200, done);
  });

  it("B取消收藏", (done) => {
    api
      .delete(`/sites/collection/${siteB_id}`)
      .set("Authorization", jwtToken_B)
      .expect(200, done);
  });

  it("確認自己是否點收回讚、取消收藏", (done) => {
    api
      .get(`/sites/like_collection/${siteB_id}`)
      .set("Authorization", jwtToken_B)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.be.a("object");
        expect(res.body).to.have.property("like");
        expect(res.body.like).to.be.false;
        expect(res.body).to.have.property("collection");
        expect(res.body.collection).to.be.false;
        done();
      });
  });
});

let tourA_id; // 不公開 --> 後續會改成 純分享 --> 再改成 找旅伴
let tourB_id; // 複製 tourA --> 不公開

// 旅程增查改功能

describe("旅程tour增查改功能", () => {
  it("沒登入無法新增旅程", (done) => {
    api
      .post("/tours/new")
      .send({
        title: "旅程A",
        description: "測試用",
        status: "不公開",
        limit: 3,
        totalDays: 5,
      })
      .expect(401, done);
  });

  it("新增旅程", (done) => {
    api
      .post("/tours/new")
      .send({
        title: "旅程A",
        description: "測試用",
        status: "不公開",
        limit: 3,
        totalDays: 5,
      })
      .set("Authorization", jwtToken_A)
      .expect(201, done);
  });

  it("未登入下查詢新增的旅程", (done) => {
    api.get("/tours/myTour?page=1&numberPerPage=8").expect(401, done);
  });

  it("查詢自己新增的旅程", (done) => {
    api
      .get("/tours/myTour?page=1&numberPerPage=8")
      .set("Authorization", jwtToken_A)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        tourA_id = res.body[0]._id;
        expect(res.body).to.be.a("array");
        expect(res.body).to.have.lengthOf(1);
        expect(res.body[0]).to.be.a("object");
        expect(res.body[0]).to.have.property("_id");
        expect(res.body[0]).to.have.property("title");
        expect(res.body[0]).to.have.property("description");
        expect(res.body[0]).to.have.property("limit");
        expect(res.body[0]).to.have.property("totalDays");
        expect(res.body[0]).to.have.property("status");
        expect(res.body[0]).to.have.property("updateDate");
        expect(res.body[0]).to.have.property("num_of_participants");
        done();
      });
  });

  it("查詢自己新增的旅程數", (done) => {
    api
      .get("/tours/myTour/count")
      .set("Authorization", jwtToken_A)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.be.a("object");
        expect(res.body).to.have.property("count");
        expect(res.body.count).to.be.equal(1);
        done();
      });
  });

  it("創立旅程後，自己同時成為主辦者", (done) => {
    api
      .get(`/tours/myType?tour_id=${tourA_id}`)
      .set("Authorization", jwtToken_A)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.be.a("object");
        expect(res.body).to.have.property("type");
        expect(res.body.type).to.be.equal("主辦者");
        done();
      });
  });

  it("剛新增旅程，旅程參與人數應只有自己", (done) => {
    api
      .get(`/tours/${tourA_id}/tourist`)
      .set("Authorization", jwtToken_A)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.be.a("array");
        expect(res.body).to.have.lengthOf(1);
        expect(res.body[0]).to.have.property("_id");
        expect(res.body[0]).to.have.property("user_id");
        expect(res.body[0].user_id).to.be.a("object");
        expect(res.body[0].user_id).to.have.property("_id");
        expect(res.body[0].user_id._id).to.be.equal(userA_id);
        expect(res.body[0].user_id).to.have.property("username");
        expect(res.body[0]).to.have.property("tour_id");
        expect(res.body[0]).to.have.property("type");
        done();
      });
  });

  it("查詢自己不公開的旅程A 詳細資料(私人頁面)", (done) => {
    api
      .get(`/tours/myTour/detail/${tourA_id}`)
      .set("Authorization", jwtToken_A)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.be.a("object");
        expect(res.body).to.have.property("foundTour");

        let foundTour = res.body.foundTour;
        expect(foundTour).to.have.property("_id");
        expect(foundTour).to.have.property("title");
        expect(foundTour.title).to.be.equal("旅程A");
        expect(foundTour).to.have.property("description");
        expect(foundTour.description).to.be.equal("測試用");
        expect(foundTour).to.have.property("limit");
        expect(foundTour.limit).to.be.equal(3);
        expect(foundTour).to.have.property("totalDays");
        expect(foundTour.totalDays).to.be.equal(5);
        expect(foundTour).to.have.property("status");
        expect(foundTour.status).to.be.equal("不公開");
        expect(foundTour).to.have.property("updateDate");
        expect(foundTour).to.have.property("participants");
        expect(foundTour).to.have.property("num_of_participants");
        expect(foundTour.num_of_participants).to.be.equal(1);

        expect(res.body).to.have.property("dayPlan");
        expect(res.body.dayPlan).to.have.a("array");

        done();
      });
  });

  it("未登入下，無法查詢自己旅程 詳細資料(私人頁面)", (done) => {
    api.get(`/tours/myTour/detail/${tourA_id}`).expect(401, done);
  });

  it("不可於私人頁面查詢非自己創立的旅程", (done) => {
    api
      .get(`/tours/myTour/detail/${tourA_id}`)
      .set("Authorization", jwtToken_B)
      .expect(403, done);
  });

  it("公開頁面，無法查詢不公開的旅程", (done) => {
    api.get(`/tours/detail/${tourA_id}`).expect(403, done);
  });

  it("不公開時，無法申請成為旅伴", (done) => {
    api
      .post(`/tours/apply/${tourA_id}`)
      .set("Authorization", jwtToken_B)
      .expect(403, done);
  });

  it("修改旅程A(不公開調整成純分享)", (done) => {
    api
      .patch(`/tours/${tourA_id}`)
      .send({
        title: "旅程AAA",
        description: "修改後",
        status: "純分享",
        limit: 5,
        totalDays: 7,
      })
      .set("Authorization", jwtToken_A)
      .expect(200, done);
  });

  it("旅程匯入自己建立/收藏的景點", (done) => {
    api
      .post(`/tours/${tourA_id}/addSites`)
      .send([
        { day: 5, site_id: siteA_id },
        { day: 7, site_id: siteB_id },
      ])
      .set("Authorization", jwtToken_A)
      .expect(201, done);
  });

  it("只有作者可以將自己創立的旅程 匯入自己建立/收藏的景點", (done) => {
    api
      .post(`/tours/${tourA_id}/addSites`)
      .send([
        { day: 5, site_id: siteA_id },
        { day: 7, site_id: siteB_id },
      ])
      .set("Authorization", jwtToken_B)
      .expect(403, done);
  });

  it("可於公開頁面，查詢公開的旅程", (done) => {
    api
      .get(`/tours/detail/${tourA_id}`)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.be.a("object");
        expect(res.body).to.have.property("foundTour");

        let foundTour = res.body.foundTour;
        expect(foundTour).to.have.property("_id");
        expect(foundTour._id).to.be.equal(tourA_id);
        expect(foundTour).to.have.property("title");
        expect(foundTour.title).to.be.equal("旅程AAA");
        expect(foundTour).to.have.property("description");
        expect(foundTour.description).to.be.equal("修改後");
        expect(foundTour).to.have.property("limit");
        expect(foundTour.limit).to.be.equal(5);
        expect(foundTour).to.have.property("totalDays");
        expect(foundTour.totalDays).to.be.equal(7);
        expect(foundTour).to.have.property("status");
        expect(foundTour.status).to.be.equal("純分享");
        expect(foundTour).to.have.property("updateDate");
        expect(foundTour).to.have.property("num_of_participants");

        expect(res.body).to.have.property("dayPlan");
        expect(res.body.dayPlan).to.have.a("array");
        expect(res.body.dayPlan).to.have.lengthOf(2);

        done();
      });
  });

  it("旅程公開時，其他使用者可複製旅程", (done) => {
    api
      .post(`/tours/copy/${tourA_id}`)
      .set("Authorization", jwtToken_B)
      .expect(201, done);
  });

  it("確認旅程複製成功", (done) => {
    api
      .get("/tours/myTour?page=1&numberPerPage=8")
      .set("Authorization", jwtToken_B)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        tourB_id = res.body[0]._id;
        expect(res.body).to.be.a("array");
        expect(res.body).to.have.lengthOf(1);
        done();
      });
  });

  it("確認旅程匯入的景點也複製成功", (done) => {
    api
      .get(`/tours/myTour/detail/${tourB_id}`)
      .set("Authorization", jwtToken_B)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.be.a("object");
        expect(res.body).to.have.property("foundTour");

        let foundTour = res.body.foundTour;
        expect(foundTour).to.have.property("_id");
        expect(foundTour._id).to.be.equal(tourB_id);
        expect(foundTour).to.have.property("title");
        expect(foundTour.title).to.be.equal("旅程AAA");
        expect(foundTour).to.have.property("description");
        expect(foundTour.description).to.be.equal("修改後");
        expect(foundTour).to.have.property("limit");
        expect(foundTour.limit).to.be.equal(1);
        expect(foundTour).to.have.property("totalDays");
        expect(foundTour.totalDays).to.be.equal(7);
        expect(foundTour).to.have.property("status");
        expect(foundTour.status).to.be.equal("不公開");
        expect(foundTour).to.have.property("updateDate");
        expect(foundTour).to.have.property("num_of_participants");

        expect(res.body).to.have.property("dayPlan");
        expect(res.body.dayPlan).to.have.a("array");
        expect(res.body.dayPlan).to.have.lengthOf(2);

        done();
      });
  });
});

let touristA_id;
let touristB_id;
let touristC_id;
// 旅伴增刪功能測試
describe("旅伴增刪功能測試", () => {
  it("旅程不公開時，無法申請成為旅伴", (done) => {
    api
      .post(`/tours/apply/${tourB_id}`)
      .set("Authorization", jwtToken_A)
      .expect(403, done);
  });

  it("旅程純分享時，無法申請成為旅伴", (done) => {
    api
      .post(`/tours/apply/${tourA_id}`)
      .set("Authorization", jwtToken_B)
      .expect(403, done);
  });

  it("修改旅程A(改找旅伴)", (done) => {
    api
      .patch(`/tours/${tourA_id}`)
      .send({
        title: "旅程AAA",
        description: "修改後",
        status: "找旅伴",
        limit: 5,
        totalDays: 7,
      })
      .set("Authorization", jwtToken_A)
      .expect(200, done);
  });

  it("未登入下，無法申請成旅伴", (done) => {
    api.post(`/tours/apply/${tourA_id}`).expect(401, done);
  });

  it("主辦者無法申請成旅伴", (done) => {
    api
      .post(`/tours/apply/${tourA_id}`)
      .set("Authorization", jwtToken_A)
      .expect(400, done);
  });

  it("未參加者可以申請成旅伴(B)", (done) => {
    api
      .post(`/tours/apply/${tourA_id}`)
      .set("Authorization", jwtToken_B)
      .expect(201, done);
  });

  it("未參加者可以申請成旅伴(C)", (done) => {
    api
      .post(`/tours/apply/${tourA_id}`)
      .set("Authorization", jwtToken_C)
      .expect(201, done);
  });

  it("報名參加後不可重複申請", (done) => {
    api
      .post(`/tours/apply/${tourA_id}`)
      .set("Authorization", jwtToken_B)
      .expect(400, done);
  });

  it("取得tourist_id", (done) => {
    api
      .get(`/tours/${tourA_id}/tourist`)
      .set("Authorization", jwtToken_A)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.be.a("array");
        expect(res.body).to.have.lengthOf(3);
        touristA_id = res.body[0]._id;
        touristB_id = res.body[1]._id;
        touristC_id = res.body[2]._id;
        done();
      });
  });

  it("只有主辦者或自己可取消申請者", (done) => {
    api
      .delete(`/tours/tourist/${touristB_id}`)
      .set("Authorization", jwtToken_C)
      .expect(403, done);
  });

  it("只有主辦者或自己可取消申請者", (done) => {
    api
      .delete(`/tours/tourist/${touristB_id}`)
      .set("Authorization", jwtToken_A)
      .expect(200, done);
  });

  it("只有主辦者或自己可取消申請者", (done) => {
    api
      .delete(`/tours/tourist/${touristC_id}`)
      .set("Authorization", jwtToken_C)
      .expect(200, done);
  });

  it("主辦者無法刪掉自己的參加狀態", (done) => {
    api
      .delete(`/tours/tourist/${touristA_id}`)
      .set("Authorization", jwtToken_A)
      .expect(400, done);
  });
});

// 刪除旅程測試
describe("刪除旅程測試", () => {
  it("未登入下不可以刪除旅程", (done) => {
    api.delete(`/tours/${tourA_id}`).expect(401, done);
  });

  it("不可以刪除別人建立的旅程", (done) => {
    api
      .delete(`/tours/${tourA_id}`)
      .set("Authorization", jwtToken_B)
      .expect(403, done);
  });

  // A 刪除自己的旅程 A
  it("可以刪除自己建立的旅程", (done) => {
    api
      .delete(`/tours/${tourA_id}`)
      .set("Authorization", jwtToken_A)
      .expect(200, done);
  });

  // B 刪除自己的旅程 B
  it("可以刪除自己建立的旅程", (done) => {
    api
      .delete(`/tours/${tourB_id}`)
      .set("Authorization", jwtToken_B)
      .expect(200, done);
  });

  it("刪除旅程後，同時移除該旅程參與者", (done) => {
    api
      .get(`/tours/${tourA_id}/tourist`)
      .set("Authorization", jwtToken_A)
      .expect(404, done);
  });
});

describe("刪除景點測試", () => {
  it("未登入下不可以刪除景點", (done) => {
    api.delete(`/sites/${siteA_id}`).expect(401, done);
  });

  it("不可以刪除別人建立的景點", (done) => {
    api
      .delete(`/sites/${siteA_id}`)
      .set("Authorization", jwtToken_B)
      .expect(403, done);
  });

  // A 刪除自己的景點 A
  it("刪除自己建立的景點A", (done) => {
    api
      .delete(`/sites/${siteA_id}`)
      .set("Authorization", jwtToken_A)
      .expect(200, done);
  });

  it("刪除自己建立的景點B", (done) => {
    api
      .delete(`/sites/${siteB_id}`)
      .set("Authorization", jwtToken_A)
      .expect(200, done);
  });
});

describe("刪除測試帳號", () => {
  it("刪除使用者A", (done) => {
    api.delete("/users/").set("Authorization", jwtToken_A).expect(200, done);
  });
  it("刪除使用者B", (done) => {
    api.delete("/users/").set("Authorization", jwtToken_B).expect(200, done);
  });
  it("刪除使用者C", (done) => {
    api.delete("/users/").set("Authorization", jwtToken_C).expect(200, done);
  });
});
