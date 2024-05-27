import React from "react";
import { useEffect, useState } from "react";
import siteService from "../../../service/site";
import { useNavigate, Link } from "react-router-dom";
import PageChooseComponent from "../../smallComponents/pageChoose_component";

const MySites = () => {
  const navigate = useNavigate();

  const [sites, setSites] = useState();
  const [count, setCount] = useState(); // 計算有幾個sites 分頁用
  const [page, setPage] = useState(1);
  const [numberPerPage, setNumberPerPage] = useState(4); //每頁顯示幾個
  const [deleteId, setDeleteId] = useState(); // 設定即將要刪除的目標

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

  // 每頁幾張?
  const handlePerPage = (e) => {
    if (e.target.value > 0 && e.target.value <= 8) {
      setNumberPerPage(e.target.value);
    }
  };

  // 處理刪除景點 or 移除收藏
  const handleDelete = (e) => {
    setDeleteId(e.target.name);
    document.querySelector("#siteDeleteConfirm").style.display = "flex";
    document.querySelector("#gray_cover").style.display = "block";
  };

  // 確認後不刪除
  const cancelDelete = () => {
    setDeleteId("");
    document.querySelector("#siteDeleteConfirm").style.display = "none";
    document.querySelector("#gray_cover").style.display = "none";
  };

  // 確認後刪除
  const deleteIt = async () => {
    try {
      document.body.style.cursor = "wait";
      let result = await siteService.delete_site(deleteId);
      alert(result.data);
      navigate(0);
    } catch (e) {
      if (e.response) {
        alert(e.response.data);
      }
    }
    document.querySelector("#siteDeleteConfirm").style.display = "none";
    document.querySelector("#gray_cover").style.display = "none";
    setDeleteId("");
  };

  // 剛進網站時，讀取site總數以設定分頁格式
  useEffect(() => {
    siteService
      .get_mySite_count()
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
      .get_mySite(page, numberPerPage)
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
        <PageChooseComponent
          page={page}
          handlePage={handlePage}
          count={count}
        />

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

      <div className="d-flex flex-wrap">
        {/* 自己建立的景點圖卡 */}
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
                  <Link to={"/users/mySite/" + site._id}>顯示更多</Link>
                  <hr />
                  <div className="d-flex align-items-center">
                    <Link
                      to={"/users/sites/edit/" + site._id}
                      className="btn bg-primary-subtle"
                      data-mdb-ripple-init
                    >
                      編輯
                    </Link>
                    <button
                      href="#!"
                      className="btn bg-danger-subtle ms-2"
                      name={site._id}
                      onClick={handleDelete}
                      data-mdb-ripple-init
                    >
                      刪除
                    </button>
                    <div className="ms-3">
                      狀態：{site.public ? "公開" : "未公開"}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* 確定刪除按鈕 */}
      <div
        id="siteDeleteConfirm"
        className="bg-light-subtle justify-content-center align-items-center rounded"
        style={{
          display: "none",
          height: "8rem",
          width: "15rem",
          position: "fixed",
          top: "37%",
          left: "46%",
          zIndex: "2",
        }}
      >
        <div className="container text-center">
          <p className="mb-3 fs-2">確定刪除景點?</p>
          <div>
            <button
              type="button"
              className="deleteConfirmButton bg-success-subtle"
              onClick={cancelDelete}
            >
              取消
            </button>
            <button
              type="button"
              className="deleteConfirmButton bg-danger-subtle"
              onClick={deleteIt}
            >
              刪除
            </button>
          </div>
        </div>
      </div>

      {/* 遮罩 */}
      <div
        id="gray_cover"
        style={{
          display: "none",
          height: "100vh",
          width: "100vw",
          opacity: "80%",
          backgroundColor: "black",
          position: "fixed",
          top: "0",
          left: "0",
          zIndex: "1",
        }}
      ></div>
    </div>
  );
};

export default MySites;
