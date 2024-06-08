import React from "react";

// 每日景點資料

const TourSiteCard = ({ days, tour, sites, type, tour_id, handleDelete }) => {
  return (
    <div className="d-flex flex-wrap mx-2">
      {days &&
        days.map((day) => {
          return (
            <div
              className="m-2"
              style={{ flex: "1 1 35rem" }}
              key={tour._id + "_day=" + day}
            >
              <p className="h3">第{day}天：</p>
              <table className="table table-striped align-middle">
                <thead>
                  <tr>
                    <th style={{ width: "35%" }}>標題</th>
                    <th style={{ width: "10%" }} className="text-center">
                      國家
                    </th>
                    <th style={{ width: "10%" }} className="text-center">
                      地區
                    </th>
                    <th style={{ width: "10%" }} className="text-center">
                      類型
                    </th>
                    <th style={{ width: "35%" }}>設定</th>
                  </tr>
                </thead>
                <tbody>
                  {sites &&
                    sites.map((site) => {
                      return (
                        site.day === day && (
                          <tr key={site._id}>
                            <th>
                              {site.title || (
                                <p style={{ color: "red" }} className="my-auto">
                                  此景點已被刪除
                                </p>
                              )}
                            </th>
                            <td className="text-center">{site.country}</td>
                            <td className="text-center">{site.region}</td>
                            <td className="text-center">{site.type}</td>
                            <td>
                              <a
                                href={"/site/" + site.site_id}
                                className="btn bg-primary-subtle"
                              >
                                檢視
                              </a>
                              {type === "主辦者" && (
                                <button
                                  type="button"
                                  className="btn bg-danger-subtle ms-2 my-2"
                                  name={site._id}
                                  onClick={handleDelete}
                                >
                                  刪除
                                </button>
                              )}
                            </td>
                          </tr>
                        )
                      );
                    })}
                </tbody>
              </table>

              {/* 新增景點按鈕 */}
              {type === "主辦者" && (
                <div style={{ width: "18rem" }}>
                  <a
                    href={`/users/tours/${tour_id}/${tour.title}/${day}/addSite`}
                    type="button"
                    className="btn btn-outline-primary"
                  >
                    新增景點 +
                  </a>
                </div>
              )}
              <hr />
            </div>
          );
        })}
    </div>
  );
};

export default TourSiteCard;
