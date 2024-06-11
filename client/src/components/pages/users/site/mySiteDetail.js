import React from "react";
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import siteService from "../../../../service/site";

// 我的景點詳細資料(非公開)

const MySiteDetail = () => {
  const navigate = useNavigate();

  const { site_id } = useParams();
  const [site, setSite] = useState("");

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

  useEffect(() => {
    siteService
      .get_mySite_detail(site_id)
      .then((data) => {
        console.log(data.data);
        setSite(data.data);
      })
      .catch((e) => {
        if (e.response) {
          switch (e.response.status) {
            case 401:
              alert('請重新登入')
              navigate("/login");
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
  }, [navigate, site_id]);

  return (
    <div>
      <div className="mx-5 mb-3">
        <Link
          to="/users/sites/overview/mine"
          className="btn btn-outline-primary me-3"
        >
          回到我的景點
        </Link>
      </div>
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
            <div style={{ height: "400px" }}>
              {site.photo.url ? (
                <img
                  src={site.photo.url}
                  alt={site.photo.photoName}
                  className="img-fluid"
                  style={{
                    objectFit: "contain",
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
      <hr
        className="mx-4 "
        style={{ border: "2px solid rgb(90, 178, 255)", opacity: "1" }}
      />
    </div>
  );
};

export default MySiteDetail;
