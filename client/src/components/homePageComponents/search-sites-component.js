import React from "react";
import { useEffect, useState } from "react";
import siteService from "../../service/site";
import { useNavigate, Link } from "react-router-dom";

const SearchSitesComponent = () => {
  const navigate = useNavigate();

  const [sites, setSites] = useState();
  const [count, setCount] = useState(); // 計算有幾個sites 分頁用
  const [page, setPage] = useState(1);
  const [numberPerPage, setNumberPerPage] = useState(8); //每頁顯示幾個

  // 選擇頁數
  const handlePage = (e) => {
    console.log(count);
    console.log(typeof page);
    if (e.target.value === "previous") {
      setPage(page - 1);
    } else if (e.target.value === "next") {
      setPage(page + 1);
    } else {
      setPage(Number(e.target.value));
    }
  };

  // 每頁幾張?
  const handlePerPage = (e) => {
    if (e.target.value > 0 && e.target.value <= 8) {
      setNumberPerPage(e.target.value);
    }
  };

  // 顯示時間的格式調整
  const handleTime = (time) => {
    const createDate = new Date(time);

    let hour = Math.floor(
      (new Date().getTime() - createDate.getTime()) / 1000 / 60 / 60
    ); // 差幾小時
    let day = Math.floor(hour / 24);
    let month = Math.floor(day / 30);
    let year = Math.floor(month / 12);

    if (hour < 1) {
      return "不久前";
    } else if (hour < 24) {
      return hour + "小時前";
    } else if (day <= 30) {
      return day + "天前";
    } else if (month < 12) {
      return month + "個月前";
    } else {
      return year + "年前";
    }
  };

  // 剛進網站時，讀取site總數以設定分頁格式
  useEffect(() => {
    siteService
      .get_sites_count()
      .then((data) => {
        console.log(data.data);
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
      .get_search_sites(page, numberPerPage)
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
  }, [page, numberPerPage, navigate]);

  return (
    <div className="container d-flex flex-column align-items-center my-5 border">
      <div>
        <div className="my-2">
          <div className="input-group">
            <div className="form-outline" data-mdb-input-init>
              <input
                type="search"
                id="search-site-by-title"
                className="form-control"
                placeholder="search by title"
              />
            </div>
            <button
              type="button"
              className="btn btn-primary"
              data-mdb-ripple-init
            >
              <i className="fas fa-search"></i>
            </button>
          </div>
        </div>
      </div>
      <hr />
      <div>
        <div className="d-flex flex-wrap container">
          {/* 頁數選擇 */}
          <nav aria-label="Page navigation example" className="me-5">
            <ul className="pagination">
              <li className="page-item">
                <button
                  className={`page-link ${page === 1 && "disabled"}`}
                  value={"previous"}
                  onClick={handlePage}
                >
                  Previous
                </button>
              </li>
              {page - 2 > 0 && (
                <li className="page-item">
                  <button
                    className="page-link"
                    value={page - 2}
                    onClick={handlePage}
                  >
                    {page - 2}
                  </button>
                </li>
              )}
              {page - 1 > 0 && (
                <li className="page-item">
                  <button
                    className="page-link"
                    value={page - 1}
                    onClick={handlePage}
                  >
                    {page - 1}
                  </button>
                </li>
              )}
              <li className="page-item active">
                <button className="page-link">{page} </button>
              </li>
              {count >= page + 1 && (
                <li className="page-item">
                  <button
                    className="page-link"
                    value={page + 1}
                    onClick={handlePage}
                  >
                    {page + 1}
                  </button>
                </li>
              )}
              {count >= page + 2 && (
                <li className="page-item">
                  <button
                    className="page-link"
                    value={page + 2}
                    onClick={handlePage}
                  >
                    {page + 2}
                  </button>
                </li>
              )}
              <li className="page-item">
                <button
                  className={`page-link ${count === page && "disabled"}`}
                  value={"next"}
                  onClick={handlePage}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>

          {/* 每頁顯示幾個? */}
          <div className="mt-1 me-5">
            <label htmlFor="set-Number-Per-Page" className="me-2">
              每頁顯示幾個?(1-8)
            </label>
            <input
              type="number"
              min="1"
              max="8"
              id="set-Number-Per-Page"
              style={{ width: "2rem" }}
              onChange={handlePerPage}
            />
          </div>
        </div>

        <div className="d-flex flex-wrap">
          {/* 景點圖卡 */}
          {sites &&
            sites.map((site) => {
              return (
                <div
                  className="card m-2"
                  style={{ width: "18rem", height: "25rem" }}
                  key={site._id}
                >
                  <div
                    className="d-flex"
                    style={{ height: "45%", borderBottom: "1px solid black" }}
                  >
                    {site.photo.url ? (
                      <img
                        src={site.photo.url}
                        alt={site.photo.photoName}
                        className="img-fluid"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          fontSize: "3rem",
                          transform: "rotate(20deg) translate(30px,40px)",
                          color: "black",
                        }}
                      >
                        No photo
                      </div>
                    )}
                  </div>

                  <div className="card-body">
                    <h5 className="card-title">{site.title}</h5>
                    <p className="card-text" style={{ height: "2.5rem" }}>
                      {site.content.length >= 30
                        ? site.content.slice(0, 30) + "..."
                        : site.content}
                    </p>
                    <Link to={"/site/" + site._id}>顯示更多</Link>
                    <hr className="my-2" />
                    <div
                      className="d-flex justify-content-between flex-wrap"
                      style={{ height: "1.8rem" }}
                    >
                      <p>
                        {site.country}-{site.region}地區
                      </p>
                      <p>最後更新：{handleTime(site.updateDate)}</p>
                    </div>
                    <hr className="my-1" />
                    <div className="mt-2">共 {site.num_of_like} 人按讚</div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default SearchSitesComponent;
