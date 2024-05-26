import React from "react";
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import siteService from "../../service/site";

const SiteDetailComponent = () => {
  const navigate = useNavigate();

  const { site_id } = useParams();

  const [site, setSite] = useState("");
  const [like, setLike] = useState("");
  const [checkLike, setCheckLike] = useState(false); // 確認點讚狀態
  const [collect, setCollect] = useState("");
  const [checkCollect, setCheckCollect] = useState(false); // 確認收藏狀態
  const [otherSites, setOtherSites] = useState(""); // 找尋該作者的其他景點

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
  const handleLike = async () => {
    try {
      let result = await siteService.post_click_like(site_id);
      console.log(result);
      setCheckLike(!checkLike);
    } catch (e) {
      console.log(e);
      if (e.response && e.response.status === 401) {
        // localStorage.removeItem("auth");
        // navigate("/login");
        // navigate(0);
        alert("401!");
      }
    }
  };

  // 收藏 or 移除收藏
  const handleCollect = async () => {
    try {
      let result = await siteService.post_click_collect(site_id);
      console.log(result);
      setCheckCollect(!checkCollect);
    } catch (e) {
      console.log(e);
      if (e.response && e.response.status === 401) {
        // localStorage.removeItem("auth");
        // navigate("/login");
        // navigate(0);
        alert("401!");
      }
    }
  };

  useEffect(() => {
    siteService
      .get_site_detail(site_id)
      .then((data) => {
        setSite(data.data.site);
        setLike(data.data.like);
        setCollect(data.data.collect);
      })
      .catch((e) => {
        if (e.response && e.response.status === 403) {
          navigate("/noAuth");
        } else if (e.response && e.response.status === 401) {
          alert("請先登入");
          navigate("/login");
        }
      });
    siteService
      .get_site_like_and_collect(site_id)
      .then((data) => {
        setCheckLike(data.data.like);
        setCheckCollect(data.data.collect);
      })
      .catch((e) => {
        console.log(e);
      });
  }, []);

  useEffect(() => {
    if (site) {
      siteService
        .get_other_sites(site.author._id, site_id)
        .then((data) => {
          console.log(data.data);
          setOtherSites(data.data);
        })
        .catch((e) => {
          console.log(e);
        });
    }
  }, [site]);

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
                {like}人按讚，{collect}人收藏
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
                {checkCollect && "移除"}收藏
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
      <hr
        className="mx-4 "
        style={{ border: "2px solid rgb(90, 178, 255)", opacity: "1" }}
      />

      {/* 其他推薦的景點 */}
      <div className="ms-4">
        {site.author && site.author.username}的其他景點：
      </div>
      <div className="d-flex flex-wrap justify-content-center">
        {/* 景點圖卡 */}
        {otherSites &&
          otherSites.map((otherSite) => {
            return (
              <div
                className="card m-2"
                style={{ width: "18rem", height: "20rem" }}
                key={otherSite._id}
              >
                <div
                  className="d-flex"
                  style={{ height: "55%", borderBottom: "1px solid black" }}
                >
                  {otherSite.photo.url ? (
                    <img
                      src={otherSite.photo.url}
                      alt={otherSite.photo.photoName}
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
                        transform: "rotate(20deg) translate(40px,50px)",
                        color: "black",
                      }}
                    >
                      No photo
                    </div>
                  )}
                </div>
                <div className="card-body">
                  <h5 className="card-title">{otherSite.title}</h5>
                  <p className="card-text" style={{ height: "2.5rem" }}>
                    {otherSite.content.length >= 30
                      ? otherSite.content.slice(0, 30) + "..."
                      : otherSite.content}
                  </p>
                  <a href={"/site/" + otherSite._id}>顯示更多</a>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default SiteDetailComponent;
