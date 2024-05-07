import axios from "axios";
axios.defaults.withCredentials = true;

const apiURL =
  "https://8080-samuelfan-pickgoproject-063jy55okjc.ws-us113.gitpod.io";

// 負責使用者相關與server的互動
class AuthService {
  // 登入系統
  async post_login(username, password) {
    return await axios.post(apiURL + "/api/users/login", {
      username,
      password,
    });
  }

  // 登出系統

  async get_logout() {
    return await axios.get(apiURL + "/api/users/logout");
  }

  // 得到使用者資訊
  async get_auth_user() {
    return await axios.get(apiURL + "/api/users");
  }

  // 註冊系統
  async post_signup(data) {
    return await axios.post(apiURL + "/api/users/register", data);
  }

  async get_auth_test() {
    return await axios.get(apiURL + "/api/users/test");
  }
}

export default new AuthService();
