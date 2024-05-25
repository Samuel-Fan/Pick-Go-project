import axios from "axios";
axios.defaults.withCredentials = true;

const apiURL = process.env.REACT_APP_API_URL;

// 負責"景點"相關與server的互動
class siteService {
  // 取得使用者自己建立的景點資訊
  // 用來計算幾頁
  get_mySite_count() {
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
  // 用來計算幾頁
  get_myCollection_count() {
    return axios.get(apiURL + "/api/sites/myCollection/count");
  }

  // 取得資訊
  get_myCollection(page, numberPerPage) {
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

  // 查詢景點詳細資訊
  get_site_detail(_id) {
    return axios.get(apiURL + "/api/sites/detail/" + _id);
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
        Authorization: "Client-ID {42dd75588885b5e}",
      },
    });
  }

  // 收藏 or 取消讚
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
