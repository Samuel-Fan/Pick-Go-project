import React from "react";

// 旅程簡易資料

const TourInfoCard = ({ tour }) => {
  // 調整時間格式
  const convertTime = (string) => {
    return string.match(/\d+-\d+-\d+/);
  };

  return (
    <div className="mt-4 mx-4">
      <div className="d-flex justify-content-between mb-3">
        <h2>旅程標題：{tour.title}</h2>
      </div>

      <div
        className="d-flex justify-content-between"
        style={{ height: "1rem" }}
      >
        <p>作者：{tour.author && tour.author.username}</p>
        {tour.status === "找旅伴" && (
          <p className="me-5">
            目前人數 / 人數限制：{tour.num_of_participants} / {tour.limit}
          </p>
        )}
        <p className="ms-5">
          最後更新時間：
          {tour.updateDate && convertTime(tour.updateDate)}
        </p>
      </div>
      <hr />
      <p>簡介：</p>
      <p style={{ whiteSpace: "pre-line" }}>{tour.description}</p>
    </div>
  );
};

export default TourInfoCard;
