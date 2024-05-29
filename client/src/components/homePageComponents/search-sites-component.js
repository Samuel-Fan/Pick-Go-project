import React from "react";
import { useEffect, useState } from "react";
import siteService from "../../service/site";
import { useNavigate } from "react-router-dom";
import PageChooseComponent from "../smallComponents/pageChoose-component";
import SiteCardComponent from "../smallComponents/siteCard-component";

const SearchSitesComponent = () => {
  const navigate = useNavigate();

  const [sites, setSites] = useState();
  const [count, setCount] = useState(); // 計算有幾個sites 分頁用
  const [page, setPage] = useState(1);
  const [simpleSearch, setSimpleSearch] = useState(true); // 切換簡易搜尋及進階搜尋
  const [title, setTitle] = useState("");
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [type, setType] = useState("");
  const [username, setUsername] = useState("");
  const [orderBy, setOrderBy] = useState("date");
  const numberPerPage = 8; //每頁顯示幾個

  // 選擇頁數
  const handlePage = (e) => {
    if (e.target.value === "previous") {
      setPage(page - 1);
    } else if (e.target.value === "next") {
      setPage(page + 1);
    } else {
      setPage(Number(e.target.value));
    }
  };

  // 切換簡易搜尋及進階搜尋
  const handleSimpleSearch = () => {
    setSimpleSearch(!simpleSearch);
    setTitle("");
    setCountry("");
    setRegion("");
    setType("");
    setUsername("");
  };

  // 搜尋
  const handleSearch = async () => {
    try {
      // 更新總頁數
      let count_result = await siteService.get_sites_count(
        title,
        country,
        region,
        type,
        username
      );
      let count = count_result.data.count;
      setCount(Math.ceil(count / numberPerPage));

      // 假設找不到任何資料
      if (count === 0) {
        setSites("無");
        return;
      }

      // 更新搜尋
      let result = await siteService.get_search_sites(
        page,
        numberPerPage,
        title,
        country,
        region,
        type,
        username,
        orderBy
      );
      setSites(result.data);
    } catch (e) {
      console.log(e);
    }
  };

  // input 設定
  const handleTitle = (e) => {
    setTitle(e.target.value);
  };

  const handleUsername = (e) => {
    setUsername(e.target.value);
  };

  const handleCountry = (e) => {
    setCountry(e.target.value);
    setRegion("");
  };

  const handleRegion = (e) => {
    setRegion(e.target.value);
    console.log(region);
  };

  const handleType = (e) => {
    setType(e.target.value);
  };

  const handleSort = (e) => {
    setOrderBy(e.target.value);
  };

  // 剛進網站時，讀取site總數以設定分頁格式
  useEffect(() => {
    siteService
      .get_sites_count(title, country, region, type, username)
      .then((data) => {
        console.log("讀取sites總數");
        setCount(Math.ceil(data.data.count / numberPerPage));
      })
      .catch((e) => {
        if (e.response && e.response.status === 401) {
          localStorage.removeItem("auth");
          navigate("/login");
          navigate(0);
        }
      });
  }, [numberPerPage, navigate]);

  // 每次切換頁面讀取一次
  useEffect(() => {
    siteService
      .get_search_sites(
        page,
        numberPerPage,
        title,
        country,
        region,
        type,
        username,
        orderBy
      )
      .then((data) => {
        let result = data.data;
        console.log("讀取sites詳細資料");
        setSites(result);
      })
      .catch((e) => {
        if (e.response && e.response.status === 401) {
          localStorage.removeItem("auth");
          navigate("/login");
          navigate(0);
        }
      });
  }, [page, numberPerPage, orderBy, navigate]);

  return (
    <div className="container d-flex flex-column align-items-center my-3">
      <div className="d-flex align-items-center">
        {/* 簡易搜尋介面 */}
        {simpleSearch && (
          <div className="my-2 ">
            <div className="input-group">
              <div className="form-outline" data-mdb-input-init>
                <input
                  type="search"
                  id="search-site-by-title"
                  className="form-control"
                  placeholder="以關鍵字搜尋標題"
                  onChange={handleTitle}
                />
              </div>
              <button
                type="button"
                className="btn btn-primary"
                data-mdb-ripple-init
                onClick={handleSearch}
              >
                <i className="fas fa-search"></i>
              </button>
            </div>
          </div>
        )}
        {/* 進階搜尋介面 */}
        {!simpleSearch && (
          <form className="border p-2">
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                name="title"
                placeholder="以關鍵字搜尋標題"
                onChange={handleTitle}
              />
            </div>
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                name="username"
                placeholder="作者暱稱"
                onChange={handleUsername}
              />
            </div>
            <div className="mb-3">
              <div>
                <div className="form-check-inline ">
                  <div className="form-check form-check-inline ms-2">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="country"
                      id="japan_country"
                      value="日本"
                      onChange={handleCountry}
                    />
                    <label className="form-check-label" htmlFor="japan_country">
                      日本
                    </label>
                  </div>
                </div>
                <div className="form-check form-check-inline me-4">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="country"
                    id="taiwan_country"
                    value="臺灣"
                    onChange={handleCountry}
                  />
                  <label className="form-check-label" htmlFor="taiwan_country">
                    臺灣
                  </label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="country"
                    id="no_country"
                    value=""
                    onChange={handleCountry}
                  />
                  <label className="form-check-label" htmlFor="no_country">
                    不限定
                  </label>
                </div>
              </div>
            </div>
            <div className="mb-3">
              {!country && (
                <select
                  className="form-select"
                  aria-label="Default select example"
                >
                  <option>請選擇地區</option>
                </select>
              )}
              {country === "日本" && (
                <select
                  className="form-select"
                  aria-label="Default select example"
                  onChange={handleRegion}
                >
                  <option value="">請選擇地區</option>
                  <option value="北海道地區">北海道地區</option>
                  <option value="東北">東北地區</option>
                  <option value="關東">關東地區</option>
                  <option value="近畿">近畿地區</option>
                  <option value="中部">中部地區</option>
                  <option value="中國">中國地區</option>
                  <option value="九州">九州地區</option>
                  <option value="四國">四國地區</option>
                  <option value="沖繩">沖繩地區</option>
                  <option value="日本其他">其他地區</option>
                </select>
              )}
              {country === "臺灣" && (
                <select
                  className="form-select"
                  aria-label="Default select example"
                  onChange={handleRegion}
                >
                  <option value="">請選擇地區</option>
                  <option value="台北">台北</option>
                  <option value="新北">新北</option>
                  <option value="桃園">桃園</option>
                  <option value="台中">台中</option>
                  <option value="台南">台南</option>
                  <option value="高雄">高雄</option>
                  <option value="臺灣其他">其他</option>
                </select>
              )}
            </div>
            <div className="mb-3">
              <div>
                <div className="form-check-inline ">
                  <div className="form-check form-check-inline ms-2">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="type"
                      id="restaurant_type"
                      value="餐廳"
                      onChange={handleType}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="restaurant_type"
                    >
                      餐廳
                    </label>
                  </div>
                </div>
                <div className="form-check-inline ">
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="type"
                      id="spot_type"
                      value="景點"
                      onChange={handleType}
                    />
                    <label className="form-check-label" htmlFor="spot_type">
                      景點
                    </label>
                  </div>
                </div>
                <div className="form-check-inline ">
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="type"
                      id="shopping_type"
                      value="購物"
                      onChange={handleType}
                    />
                    <label className="form-check-label" htmlFor="shopping_type">
                      購物
                    </label>
                  </div>
                </div>
                <div className="form-check-inline ">
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="type"
                      id="other_type"
                      value="其他"
                      onChange={handleType}
                    />
                    <label className="form-check-label" htmlFor="other_type">
                      其他
                    </label>
                  </div>
                </div>
                <div className="form-check-inline ">
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="type"
                      id="no_type"
                      value=""
                      onChange={handleType}
                    />
                    <label className="form-check-label" htmlFor="no_type">
                      不限定
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="d-flex justify-content-center">
              <button
                id="add-new-site-button"
                type="button"
                className="btn btn-primary"
                onClick={handleSearch}
              >
                搜尋<i className="fas fa-search ms-2"></i>
              </button>
            </div>
          </form>
        )}
        <button
          className="btn btn-outline-primary ms-3 p-1"
          style={{ height: "2rem", border: "none" }}
          onClick={handleSimpleSearch}
        >
          切換成{simpleSearch ? "進階" : "簡易"}搜尋
        </button>
      </div>

      <div>
        <hr
          className="mx-4"
          style={{ border: "2px solid rgb(90, 178, 255)", opacity: "1" }}
        />
        {/* 頁數選擇 */}
        <div className="d-flex flex-wrap container ms-3">
          <PageChooseComponent
            page={page}
            handlePage={handlePage}
            count={count}
          />

          {/* 排序 */}
          <div className="mt-2">
            <div className="form-check form-check-inline me-4 ">
              <input
                className="form-check-input"
                type="radio"
                name="sort"
                id="sort_by_date"
                value="date"
                onChange={handleSort}
              />
              <label className="form-check-label" htmlFor="sort_by_date">
                依最新上傳時間排序
              </label>
            </div>
            <div className="form-check form-check-inline me-4">
              <input
                className="form-check-input"
                type="radio"
                name="sort"
                id="sort_by_like"
                value="like"
                onChange={handleSort}
              />
              <label className="form-check-label" htmlFor="sort_by_like">
                依最多讚數排序
              </label>
            </div>
          </div>
          <div className="mt-2 ms-5">
            備註： 點讚、新增、編輯景點後要{" "}
            <span style={{ color: "red", fontWeight: "bold" }}>1</span>{" "}
            分鐘才會同步於此頁面
          </div>
        </div>

        {/* 景點圖卡 */}
        {sites === "無" ? (
          <p className="h2 text-center mt-5">無搜尋到任何資料！</p>
        ) : (
          <SiteCardComponent sites={sites} />
        )}
      </div>
    </div>
  );
};

export default SearchSitesComponent;
