import axios from "axios";
axios.defaults.withCredentials = true;

const apiURL = process.env.REACT_APP_API_URL;

// 負責"景點"相關與server的互動
class siteService {
  // 取得使用者自己建立的景點資訊
  get_mySite() {
    return axios.get(apiURL + "/api/sites/mySite");
  }

  // 查詢景點詳細資訊
  get_site_detail(_id) {
    return axios.get(apiURL + "/api/sites/detail/" + _id);
  }

  // 建立新景點
  post_new_site(data) {
    return axios.post(apiURL + "/api/sites/new", data, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: "Client-ID {42dd75588885b5e}",
      },
    });
  }

  // 編輯景點
  patch_edit_site(_id, data) {
    return axios.patch(apiURL + "/api/sites/modify/" + _id, data, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: "Client-ID {42dd75588885b5e}",
      },
    });
  }

  // 刪除景點
  delete_site(_id) {
    return axios.delete(apiURL + "/api/sites/" + _id);
  }
}

export default new siteService();
