import axios from "axios";

const apiURL = process.env.REACT_APP_API_URL;

// 設定token
let token;
if (localStorage.getItem("auth")) {
  token = JSON.parse(localStorage.getItem("auth")).jwtToken;
} else {
  token = "";
}

axios.defaults.headers.common["Authorization"] = token;

// 負責"景點"相關與server的互動
class SiteService {
  // 取得公開的景點資料

  get_search_sites(page, numberPerPage) {
    // 取得景點簡易圖卡資料
    return axios.get(
      apiURL +
        "/api/sites/search/" +
        `?page=${page}&numberPerPage=${numberPerPage}`
    );
  }

  get_sites_count() {
    // 取得公開景點的資料筆數
    return axios.get(apiURL + "/api/sites/count");
  }

  // 取得使用者自己建立的景點資訊
  get_mySite_count() {
    // 用來計算幾頁
    return axios.get(apiURL + "/api/sites/mySite/count");
  }

  get_mySite(page, numberPerPage) {
    // 取得資訊
    return axios.get(
      apiURL +
        "/api/sites/mySite" +
        `?page=${page}&numberPerPage=${numberPerPage}`
    );
  }

  // 取得使用者收藏的景點資訊

  get_myCollection_count() {
    // 用來計算幾頁
    return axios.get(apiURL + "/api/sites/myCollection/count");
  }

  get_myCollection(page, numberPerPage) {
    // 取得資訊
    return axios.get(
      apiURL +
        "/api/sites/myCollections" +
        `?page=${page}&numberPerPage=${numberPerPage}`
    );
  }

  // 確認有無點過讚或收藏
  get_site_like_and_collect(_id) {
    return axios.get(apiURL + "/api/sites/check/like-collect/" + _id);
  }

  // 查詢景點詳細資訊(公開版)
  get_site_detail(_id) {
    return axios.get(apiURL + "/api/sites/detail/" + _id);
  }

  // 查詢景點詳細資訊(私人)
  get_mySite_detail(_id) {
    return axios.get(apiURL + "/api/sites/mySite/detail/" + _id);
  }

  // 得到同作者的其他景點
  get_other_sites(author_id, site_id) {
    return axios.get(
      apiURL + `/api/sites/other?author_id=${author_id}&site_id=${site_id}`
    );
  }

  // 建立新景點
  post_new_site(data) {
    return axios.post(apiURL + "/api/sites/new", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  // 按讚 or 收回讚
  post_click_like(_id) {
    return axios.post(apiURL + "/api/sites/click/like/" + _id);
  }

  // 收藏 or 取消收藏
  post_click_collect(_id) {
    return axios.post(apiURL + "/api/sites/click/collect/" + _id);
  }

  // 編輯景點
  patch_edit_site(_id, data) {
    return axios.patch(apiURL + "/api/sites/modify/" + _id, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  // 刪除景點
  delete_site(_id) {
    return axios.delete(apiURL + "/api/sites/" + _id);
  }

  // 設定 jwt token
  setToken() {
    if (localStorage.getItem("auth")) {
      return JSON.parse(localStorage.getItem("auth")).jwtToken;
    } else {
      return "";
    }
  }
}
let siteService = new SiteService();

export default siteService;
