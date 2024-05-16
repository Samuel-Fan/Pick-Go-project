import React from "react";
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import siteService from "../../../service/site";

const siteDetailComponent = () => {
  const navigate = useNavigate();

  const { site_id } = useParams();
  const [site, setSite] = useState("");
  const [message, setMessage] = useState("");

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

  // 處理刪除景點
  const handleDelete = (e) => {
    document.querySelector("#siteDeleteConfirm").style.display = "flex";
    document.querySelector("#gray_cover").style.display = "block";
  };

  // 確認後不刪除
  const cancelDelete = () => {
    document.querySelector("#siteDeleteConfirm").style.display = "none";
    document.querySelector("#gray_cover").style.display = "none";
  };
  // 確認後刪除
  const deleteIt = async (site) => {
    console.log(site._id);
    try {
      let result = await siteService.delete_site(site._id);
      alert(result.data);
      navigate("/users/sites");
      navigate(0);
    } catch (e) {
      alert("發生問題，刪除失敗");
    }
    document.querySelector("#siteDeleteConfirm").style.display = "none";
    document.querySelector("#gray_cover").style.display = "none";
  };

  useEffect(() => {
    siteService
      .get_site_detail(site_id)
      .then((data) => {
        setSite(data.data);
        console.log(data.data);
      })
      .catch((e) => {
        if (e.response) {
          console.log(e.response.data);
          setMessage(e.response.data);
        } else {
          setMessage("伺服器發生問題，請稍後再試");
        }
      });
  }, []);

  return (
    <div className="container d-flex justify-content-center">
      {site && (
        <div className="card" style={{ width: "40rem" }}>
          <img
            src="https://mdbcdn.b-cdn.net/img/new/standard/nature/111.webp"
            className="card-img-top"
            alt="Chicago Skyscrapers"
          />
          <div className="card-body">
            <div className="d-flex align-items-center justify-content-between">
              <h4 className="card-title fw-bold">{site.title}</h4>
              <p className="my-auto">
                {site.country}--{site.region}地區 || 類型：{site.type}
              </p>
            </div>
            <hr />
            <p className="card-text" style={{ whiteSpace: "pre-line" }}>
              {site.content}
            </p>
            <hr className="mb-1" />
            <div className="d-flex justify-content-between">
              <p className="my-auto">作者：{site.author.username}</p>
              <p className="my-auto">
                最後編輯時間:{handleTime(site.updateDate)}
              </p>
            </div>
            <hr className="mt-1" />
            <div className="d-flex align-items-center">
              <Link
                to="#"
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
      )}
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
              onClick={() => {
                deleteIt(site);
              }}
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

export default siteDetailComponent;
