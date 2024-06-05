import React from "react";
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import tourService from "../../../service/tour";
import DeleteSiteOrTourComponent from "../../smallComponents/delete_siteOrTour-component";

const MyTourDetailComponent = () => {
  const navigate = useNavigate();

  const { tour_id } = useParams();

  const [tour, setTour] = useState(""); // 景點詳細資料
  const [sites, setSites] = useState(""); // 每天行程
  const [days, setDays] = useState([""]); // 設定每天格式用

  const [deleteId, setDeleteId] = useState(); // 設定即將要刪除的目標
  const deleteFunction = tourService.delete_tour_someSite;

  // 處理刪除景點
  const handleDelete = (e) => {
    setDeleteId(e.target.name);
    document.querySelector("#siteDeleteConfirm").style.display = "flex";
    document.querySelector("#gray_cover").style.display = "block";
  };

  // 調整時間格式
  const convertTime = (string) => {
    return string.match(/\d+-\d+-\d+/);
  };

  useEffect(() => {
    tourService
      .get_myTour_detail(tour_id)
      .then((data) => {
        console.log(data.data);
        setTour(data.data.foundTour);
        setSites(data.data.dayPlan);

        let array = new Array(data.data.foundTour.totalDays).fill("");
        setDays(array.map((n, i) => i + 1));
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
  }, [navigate, tour_id]);

  return (
    <div>
      <div className="mx-5 mb-3">
        <Link
          to="/users/tours/overview"
          className="btn btn-outline-primary me-3"
        >
          回到我的旅程
        </Link>
      </div>
      <hr
        className="mx-4 "
        style={{ border: "2px solid rgb(90, 178, 255)", opacity: "1" }}
      />

      {/* 本頁旅程資訊 */}
      {tour && (
        <div className="mt-4 mx-4">
          <h2>旅程標題：{tour.title}</h2>
          <div
            className="d-flex justify-content-between"
            style={{ height: "1rem" }}
          >
            <p>作者：{tour.author && tour.author.username}</p>
            <p className="ms-5">
              最後更新時間：
              {convertTime(tour.updateDate)}
            </p>
          </div>
          <hr />
          <p>簡介：</p>
          <p style={{ whiteSpace: "pre-line" }}>{tour.description}</p>

          <hr style={{ border: "2px solid rgb(90, 178, 255)", opacity: "1" }} />

          {/* 參加人員 */}
          <div>
            <span className="me-5">
              目前人數 / 人數限制：{tour.num_of_participants} / {tour.limit}
            </span>
            <a href={`/users/tours/${tour_id}/participants`}>查看申請人員</a>
          </div>

          <hr style={{ border: "2px solid rgb(90, 178, 255)", opacity: "1" }} />

          {/* 每日行程 */}
          <div className="d-flex flex-wrap">
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
                        {sites.map((site) => {
                          return (
                            site.day === day && (
                              <tr key={site._id}>
                                <th>
                                  {site.title || (
                                    <p
                                      style={{ color: "red" }}
                                      className="my-auto"
                                    >
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
                                  <button
                                    type="button"
                                    className="btn bg-danger-subtle ms-2 my-2"
                                    name={site._id}
                                    onClick={handleDelete}
                                  >
                                    刪除
                                  </button>
                                </td>
                              </tr>
                            )
                          );
                        })}
                      </tbody>
                    </table>

                    {/* 新增景點按鈕 */}
                    <div style={{ width: "18rem" }}>
                      <a
                        href={`/users/tours/${tour_id}/${tour.title}/${day}/addSite`}
                        type="button"
                        className="btn btn-outline-primary"
                      >
                        新增景點 +
                      </a>
                    </div>
                    <hr />
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* // 刪除景點功能 */}
      <DeleteSiteOrTourComponent
        deleteFunction={deleteFunction}
        deleteId={deleteId}
        setDeleteId={setDeleteId}
      />
    </div>
  );
};

export default MyTourDetailComponent;
