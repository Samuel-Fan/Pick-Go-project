import React from "react";
import { useEffect, useState } from "react";
import siteService from "../../../../service/site";
import { useNavigate, Link } from "react-router-dom";
import SiteCard from "../../../card/siteCard";
import PageChoose from "../../../btn/pageChoose";
import Delete from "../../../modal/delete";

// 我建立的景點總覽

const MySitesOverview = () => {
  const navigate = useNavigate();

  const [sites, setSites] = useState();
  const [count, setCount] = useState(); // 計算有幾個sites 分頁用
  const [page, setPage] = useState(1);
  const [numberPerPage, setNumberPerPage] = useState(4); //每頁顯示幾個

  const [message, setMessage] = useState(""); //錯誤訊息

  const [deleteId, setDeleteId] = useState(); // 設定即將要刪除的目標
  const deleteFunction = siteService.delete_site;

  // 每頁幾張?
  const handlePerPage = (e) => {
    if (e.target.value > 0 && e.target.value <= 8) {
      setNumberPerPage(e.target.value);
      setPage(1);
    }
  };

  // 處理刪除景點
  const handleDelete = (e) => {
    setDeleteId(e.target.name);
    document.querySelector("#siteDeleteConfirm").style.display = "flex";
    document.querySelector("#gray_cover").style.display = "block";
  };

  // 剛進網站時，讀取site總數以設定分頁格式
  useEffect(() => {
    siteService
      .get_mySite_count()
      .then((data) => {
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
      .get_mySite(page, numberPerPage)
      .then((data) => {
        let result = data.data;
        setSites(result);
      })
      .catch((e) => {
        if (e.response) {
          switch (e.response.status) {
            case 401:
              alert("請重新登入");
              localStorage.removeItem("auth");
              navigate("/login");
              navigate(0);
              break;
            case 403:
              navigate("/noAuth");
              break;
            case 404:
              navigate("/404");
              break;
            default:
              alert(e.response.data);
              break;
          }
        } else {
          alert("伺服器發生問題");
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
            className="btn btn-outline-primary me-3 active"
            disabled
          >
            我建立的景點
          </Link>
          <Link
            to="/users/sites/overview/collections"
            className="btn btn-outline-primary"
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

        {/* 新增景點按鈕 */}
        <div style={{ width: "18rem" }}>
          <a href="/users/sites/new">
            <button type="button" className="btn btn-outline-primary">
              新增景點 +{" "}
            </button>
          </a>
        </div>
      </div>

      {/* 自己建立的景點圖卡 */}
      <SiteCard sites={sites} sitePublic={false} handleDelete={handleDelete} />

      {/* // 錯誤訊息 */}
      <div className="small mb-2 pb-lg-2">
        {message && (
          <div className="alert alert-danger" role="alert">
            {message}
          </div>
        )}
      </div>

      {/* // 刪除景點功能 */}
      <Delete
        deleteFunction={deleteFunction}
        deleteId={deleteId}
        setDeleteId={setDeleteId}
        setMessage={setMessage}
      />
    </div>
  );
};

export default MySitesOverview;
