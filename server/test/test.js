const supertest = require("supertest");
const bcrypt = require("bcrypt");
require("dotenv").config();

const api = supertest(process.env.SERVER_URI + "/api");

let testRandomA = Math.floor(Math.random() * 1000000).toString();
let testRandomB = Math.floor(Math.random() * 1000000).toString();

// 註冊、登入取得JWT token、使用者相關操作

let userA_id;
let jwtToken_A;
let userB_id;
let jwtToken_B;
describe("註冊、登入系統", () => {
  // user 功能測試用
  it("註冊帳號 A", (done) => {
    api
      .post("/users/register")
      .send({
        email: `test${testRandomA}@gmail.com`,
        password: "test12345",
        confirmPassword: "test12345",
        username: "test",
      })
      .set("Accept", "application/json")
      .expect(201, done);
  });

  // site, tour 功能測試用
  it("註冊帳號 B", (done) => {
    api
      .post("/users/register")
      .send({
        email: `test${testRandomB}@gmail.com`,
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
        email: `test${testRandomA}@gmail.com`,
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

  it("登入帳號", (done) => {
    api
      .post("/users/login")
      .send({
        email: `test${testRandomB}@gmail.com`,
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
        expect(res.body.email).equal(`test${testRandomA}@gmail.com`);
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
        expect(res.body.email).equal(`test${testRandomA}@gmail.com`);
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

describe("測試景點增刪查改功能", () => {
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

describe("刪除景點測試", () => {
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
});
