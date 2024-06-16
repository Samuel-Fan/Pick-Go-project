import React, { useCallback } from "react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import adminService from "../../../service/admin";
import siteService from "../../../service/site";

const SiteDetail = () => {
  const navigate = useNavigate();

  const { site_id } = useParams();

  const [site, setSite] = useState("");
  const [checkLike, setCheckLike] = useState(false); // 確認點讚狀態
  const [checkCollection, setCheckCollection] = useState(false); // 確認收藏狀態

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

  // 按讚 or 收回讚
  const clickLike = useCallback(
    (site_id) => {
      return checkLike
        ? siteService.delete_click_like(site_id)
        : siteService.put_click_like(site_id);
    },
    [checkLike]
  );

  const handleLike = async () => {
    try {
      await clickLike(site_id);
      navigate(0);
    } catch (e) {
      console.log(e);
      if (e.response && e.response.status === 401) {
        alert("您需要先登入");
      }
    }
  };

  // 收藏 or 移除收藏
  const clickCollect = useCallback(
    (site_id) => {
      return checkCollection
        ? siteService.delete_click_collection(site_id)
        : siteService.put_click_collection(site_id);
    },
    [checkCollection]
  );

  const handleCollect = async () => {
    try {
      await clickCollect(site_id);
      navigate(0);
    } catch (e) {
      console.log(e);
      if (e.response && e.response.status === 401) {
        alert("您需要先登入!");
      }
    }
  };

  useEffect(() => {
    adminService
      .get_site_detail(site_id)
      .then((data) => {
        setSite(data.data);
      })
      .catch((e) => {
        if (e.response && e.response.status === 403) {
          navigate("/noAuth");
        } else if (e.response && e.response.status === 401) {
          alert("請先登入");
          navigate("/login");
        } else if (e.response && e.response.status === 404) {
          navigate("/404");
        }
      });
    siteService
      .get_site_like_and_collection(site_id)
      .then((data) => {
        setCheckLike(data.data.like);
        setCheckCollection(data.data.collection);
      })
      .catch((e) => {
        console.log(e);
      });
  }, [navigate, site_id]);

  return (
    <div>
      <hr
        className="mx-4 "
        style={{ border: "2px solid rgb(90, 178, 255)", opacity: "1" }}
      />

      {/* 本頁景點資訊 */}
      {site && (
        <div className="d-flex mt-4 mx-4 flex-wrap">
          <div
            className="mx-auto p-4"
            style={{
              flex: "0 1 450px",
            }}
          >
            <div style={{ height: "300px" }}>
              {site.photo.url ? (
                <img
                  src={site.photo.url}
                  alt={site.photo.photoName}
                  className="img-fluid"
                  style={{
                    objectFit: "cover",
                    width: "100%",
                    height: "100%",
                  }}
                />
              ) : (
                <div
                  style={{
                    fontSize: "3rem",
                    transform: "rotate(20deg) translate(120px,120px)",
                    color: "black",
                  }}
                >
                  No photo
                </div>
              )}
            </div>
            <hr />
            <div className="d-flex flex-wrap justify-content-between mt-2">
              <div className="text-start">
                {site.num_of_like}人按讚，{site.num_of_collection}人收藏
              </div>
              <div className="text-end">
                最後更新時間：{handleTime(site.updateDate)}
              </div>
            </div>
            <hr />
            <div>
              <button
                type="button"
                className="btn btn-outline-primary me-2"
                onClick={handleLike}
              >
                {checkLike && "收回"}讚<i className="fa fa-thumbs-up ms-2"></i>
              </button>
              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={handleCollect}
              >
                {checkCollection && "移除"}收藏
              </button>
            </div>
            <hr />
            <div className="d-flex flex-wrap justify-content-between mt-2">
              <div>
                <span>地區：{site.country}-</span>
                <span>{site.region}</span>
              </div>
              <div>景點類型：{site.type}</div>
            </div>
          </div>
          <div className="p-4" style={{ flex: "1 1 800px" }}>
            <h2>景點標題：{site.title}</h2>
            <h6>作者：{site.author && site.author.username}</h6>
            <hr />
            <p style={{ whiteSpace: "pre-line" }}>{site.content}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SiteDetail;
