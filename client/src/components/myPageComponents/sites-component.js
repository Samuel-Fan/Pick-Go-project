import React from "react";
import { useEffect, useState } from "react";
import siteService from "../../service/site";
import { useNavigate } from "react-router-dom";

const Sites = () => {
  const navigate = useNavigate();

  let [sites, setSites] = useState();
  let [deleteId, setDeleteId] = useState(); // 設定即將要刪除的目標

  // 處理刪除景點
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
      console.log(deleteId);
      let result = await siteService.delete_site(deleteId);
      alert(result.data);
      navigate(0);
    } catch (e) {
      console.log(e);
    }
    document.querySelector("#siteDeleteConfirm").style.display = "none";
    document.querySelector("#gray_cover").style.display = "none";
    setDeleteId("");
  };

  // 進網頁時先讀取資料
  useEffect(() => {
    siteService
      .get_mySite()
      .then((data) => {
        let result = data.data;
        console.log(sites);
        setSites(result);
      })
      .catch((e) => {
        if (e.response.status === 401) {
          navigate("/login");
        }
      });
  }, []);
  return (
    <div className="container">
      <div className="d-flex flex-wrap">
        {/* 景點圖卡 */}
        {sites &&
          sites.map((site) => {
            return (
              <div
                className="card m-2"
                style={{ width: "18rem", height: "25rem" }}
              >
                <div
                  className="bg-image hover-overlay"
                  data-mdb-ripple-init
                  data-mdb-ripple-color="light"
                  style={{ height: "12rem" }}
                >
                  <img
                    src={
                      site.photo
                        ? site.photo.url
                        : "https://mdbcdn.b-cdn.net/img/new/standard/nature/111.webp"
                    }
                    className="img-fluid"
                    style={{
                      objectFit: "cover",
                    }}
                  />

                  <a href="#!">
                    <div
                      className="mask"
                      style={{ backgroundColor: "rgba(251, 251, 251, 0.15)" }}
                    ></div>
                  </a>
                </div>

                <div className="card-body">
                  <h5 className="card-title">{site.title}</h5>
                  <p className="card-text" style={{ height: "4.5rem" }}>
                    {site.content.length >= 40
                      ? site.content.slice(0, 40) + "..."
                      : site.content}
                  </p>
                  <hr />
                  <div className="d-flex align-items-center">
                    <a
                      href="#!"
                      className="btn bg-primary-subtle"
                      data-mdb-ripple-init
                    >
                      編輯
                    </a>
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

        {/* 新增景點按鈕 */}
        <div
          className="m-2 d-flex justify-content-center align-items-center"
          style={{ width: "18rem" }}
        >
          <a href="/users/sites/new">
            <button type="button" className="btn btn-outline-primary">
              新增景點 +{" "}
            </button>
          </a>
        </div>
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
          <p className="mb-3 fs-2">刪除景點?</p>
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

export default Sites;
