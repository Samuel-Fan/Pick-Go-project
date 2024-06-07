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
  const [country, setCountry] = useState("");
  const [orderBy, setOrderBy] = useState("date");
  const numberPerPage = 8; //每頁顯示幾個

  const [query, setQuery] = useState({
    title: "",
    country: "",
    region: "",
    type: "",
    username: "",
  });

  // 切換簡易搜尋及進階搜尋
  const ChangeSearchMode = () => {
    setSimpleSearch(!simpleSearch);
  };

  // 搜尋
  const handleSearch = async (e) => {
    e.preventDefault();
    let form = new FormData(e.currentTarget);
    let data = Object.fromEntries(form.entries());
    if (simpleSearch) {
      setQuery(
        // 簡單搜尋 只有title
        Object.assign({}, query, data, {
          country: "",
          region: "",
          type: "",
          username: "",
        })
      );
    } else {
      // 進階搜尋
      setQuery(Object.assign({}, query, data));
    }
    setPage(1);
  };

  // input 設定

  const handleCountry = (e) => {
    setCountry(e.target.value);
  };

  // 剛進網站時，讀取site總數以設定分頁格式
  useEffect(() => {
    siteService
      .get_sites_count(query)
      .then((data) => {
        console.log(data.data.count);
        if (data.data.count === 0) {
          setCount("無");
        } else {
          setCount(Math.ceil(data.data.count / numberPerPage));
        }
      })
      .catch((e) => {
        if (e.response) {
          alert(e.response.data);
        } else {
          alert("伺服器發生問題");
        }
      });
  }, [numberPerPage, query, navigate]);

  // 每次切換頁面讀取一次
  useEffect(() => {
    console.log(query);
    siteService
      .get_search_sites(query, numberPerPage, page, orderBy)
      .then((data) => {
        let result = data.data;
        console.log(data.data);
        setSites(result);
      })
      .catch((e) => {
        if (e.response) {
          alert(e.response.data);
        } else {
          alert("伺服器發生問題");
        }
      });
  }, [orderBy, page, numberPerPage, query, navigate]);

  return (
    <div className="container d-flex flex-column align-items-center my-3">
      <div className="d-flex align-items-center">
        {/* 簡易搜尋介面 */}
        {simpleSearch && (
          <form className="my-2" onSubmit={handleSearch}>
            <div className="input-group">
              <div className="form-outline">
                <input
                  type="search"
                  id="search-site-by-title"
                  className="form-control"
                  placeholder="以關鍵字搜尋標題"
                  name="title"
                />
              </div>
              <button className="btn btn-primary" style={{ zIndex: 0 }}>
                <i className="fas fa-search"></i>
              </button>
            </div>
          </form>
        )}
        {/* 進階搜尋介面 */}
        {!simpleSearch && (
          <form className="border p-2" onSubmit={handleSearch}>
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                name="title"
                placeholder="以關鍵字搜尋標題"
              />
            </div>
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                name="username"
                placeholder="作者暱稱"
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
                  name="region"
                >
                  <option value="">請選擇地區</option>
                </select>
              )}
              {country === "日本" && (
                <select
                  className="form-select"
                  aria-label="Default select example"
                  name="region"
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
                  name="region"
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
                    />
                    <label className="form-check-label" htmlFor="no_type">
                      不限定
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="d-flex justify-content-center">
              <button id="add-new-site-button" className="btn btn-primary">
                搜尋<i className="fas fa-search ms-2"></i>
              </button>
            </div>
          </form>
        )}
        <button
          className="btn btn-outline-primary ms-3 p-1"
          style={{ height: "2rem", border: "none" }}
          onClick={ChangeSearchMode}
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
          <PageChooseComponent page={page} setPage={setPage} count={count} />

          {/* 排序 */}
          <div className="mt-2">
            <div className="form-check form-check-inline me-4 ">
              <input
                className="form-check-input"
                type="radio"
                name="sort"
                id="sort_by_date"
                onClick={() => {
                  setOrderBy("date");
                }}
                defaultChecked
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
                onClick={() => {
                  setOrderBy("like");
                }}
              />
              <label className="form-check-label" htmlFor="sort_by_like">
                依最多讚數排序
              </label>
            </div>
          </div>
          <div className="mt-2 ms-5">
            備註： 點讚、新增、編輯景點後要{" "}
            <span style={{ color: "red", fontWeight: "bold" }}>1</span>{" "}
            分鐘才會同步於此搜尋頁面
          </div>
        </div>

        {/* 景點圖卡 */}
        {count === "無" ? (
          <p className="h2 text-center mt-5">無搜尋到任何資料！</p>
        ) : (
          <SiteCardComponent sites={sites} />
        )}
      </div>
    </div>
  );
};

export default SearchSitesComponent;
