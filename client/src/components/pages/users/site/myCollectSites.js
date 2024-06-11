import React from "react";
import { useEffect, useState } from "react";
import siteService from "../../../../service/site";
import { useNavigate, Link } from "react-router-dom";
import PageChoose from "../../../btn/pageChoose";
import SiteCard from "../../../card/siteCard";

// 我收藏的景點資料總覽

const MyCollectSites = () => {
  const navigate = useNavigate();

  const [sites, setSites] = useState();
  const [count, setCount] = useState(); // 計算有幾個sites 分頁用
  const [page, setPage] = useState(1);
  const [numberPerPage, setNumberPerPage] = useState(4); //每頁顯示幾個

  // 每頁幾張?
  const handlePerPage = (e) => {
    if (e.target.value > 0 && e.target.value <= 8) {
      setNumberPerPage(e.target.value);
    }
  };

  // 剛進網站時，讀取site總數以設定分頁格式
  useEffect(() => {
    siteService
      .get_myCollection_count()
      .then((data) => {
        console.log(data.data);
        console.log("讀取sites總數");
        setCount(Math.ceil(data.data.count / numberPerPage));
      })
      .catch((e) => {
        console.log(e);
        if (e.response) {
          switch (e.response.status) {
            case 401:
              alert("請重新登入");
              localStorage.removeItem("auth");
              navigate("/login");
              navigate(0);
              break;
            default:
              alert(e.response.data);
              break;
          }
        } else {
          alert("伺服器發生問題");
        }
      });
  }, [numberPerPage, navigate]);

  // 每次切換頁面讀取一次
  useEffect(() => {
    siteService
      .get_myCollection(page, numberPerPage)
      .then((data) => {
        console.log(data.data);
        console.log("讀取sites詳細資料");
        setSites(data.data);
      })
      .catch((e) => {
        console.log(e);
        if (e.response && e.response.status === 401) {
          localStorage.removeItem("auth");
          navigate("/login");
          navigate(0);
        }
      });
  }, [page, numberPerPage, navigate]);

  return (
    <div className="container">
      <div className="d-flex flex-wrap container">
        {/* 選擇我建立的景點or我收藏的景點 */}
        <div className="me-5 mb-3">
          <Link
            to="/users/sites/overview/mine"
            className="btn btn-outline-primary me-3"
          >
            我建立的景點
          </Link>
          <Link
            to="/users/sites/overview/collections"
            className="btn btn-outline-primary active"
          >
            我收藏的景點
          </Link>
        </div>

        {/* 頁數選擇 */}
        <PageChoose page={page} setPage={setPage} count={count} />

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
        <SiteCard sites={sites} sitePublic={true} handleDelete={() => {}} />
      </div>
    </div>
  );
};

export default MyCollectSites;
