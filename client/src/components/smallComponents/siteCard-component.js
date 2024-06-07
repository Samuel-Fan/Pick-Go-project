import React from "react";
import { Link } from "react-router-dom";

const SiteCardComponent = ({ sites }) => {
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

  return (
    <div className="d-flex flex-wrap mx-4">
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
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div>共 {site.num_of_like} 人按讚</div>
                  <div>by {site.author && site.author.username}</div>
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default SiteCardComponent;
