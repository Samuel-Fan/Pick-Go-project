import axios from "axios";
axios.defaults.withCredentials = true;

const apiURL = process.env.REACT_APP_API_URL;

// 負責"景點"相關與server的互動
class siteService {
  // 取得景點資訊
  get_site_test() {
    return axios.get(apiURL + "/api/sites");
  }

  // 建立新景點
  post_site_test(data) {
    return axios.post(apiURL + "/api/sites/test/upload", data, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: "Client-ID {42dd75588885b5e}",
      },
    });
  }
}

export default new siteService();
