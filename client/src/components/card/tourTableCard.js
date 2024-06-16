import React from "react";
import { Link } from "react-router-dom";

// 旅程一覽表

const TourTableCard = ({ tours, setUser_id, tourPublic }) => {
  // 處理description的文字長度
  const handleDescription = (string) => {
    return string.length >= 60 ? string.slice(0, 40) + "..." : string;
  };

  return (
    <table className="table table-striped align-middle">
      <thead>
        <tr>
          <th style={{ width: "15%" }}>標題</th>
          <th style={{ width: "15%" }}>作者</th>
          <th style={{ width: "35%" }}>簡介</th>
          <th style={{ width: "8%" }} className="text-center">
            總天數
          </th>
          <th style={{ width: "11%" }} className="text-center">
            目前人數/上限
          </th>
          <th style={{ width: "8%" }} className="text-center">
            狀態
          </th>
          <th style={{ width: "8%" }}>詳細資料</th>
        </tr>
      </thead>
      <tbody>
        {tours &&
          tours.map((tour) => {
            return (
              <tr key={tour._id} style={{ height: "5rem" }}>
                <th>{tour.title}</th>
                <td>
                  {tour.author ? (
                    <button
                      className="custom-botton-link"
                      onClick={() => {
                        setUser_id(tour.author._id);
                      }}
                    >
                      {tour.author.username}
                    </button>
                  ) : (
                    "使用者已被刪除"
                  )}
                </td>
                <td style={{ wordWrap: "break-word", maxWidth: "9rem" }}>
                  {handleDescription(tour.description)}
                </td>
                <td className="text-center">{tour.totalDays}</td>
                <td className="text-center">
                  {tour.status === "找旅伴" || !tourPublic
                    ? `${tour.num_of_participants}/${tour.limit}`
                    : "---"}
                </td>
                <td className="text-center">{tour.status}</td>
                <td>
                  <Link
                    to={
                      tourPublic
                        ? `/tour/${tour._id}`
                        : `/users/tours/myTour/${tour._id}`
                    }
                    className="btn bg-primary-subtle"
                  >
                    檢視
                  </Link>
                </td>
              </tr>
            );
          })}
      </tbody>
    </table>
  );
};

export default TourTableCard;
