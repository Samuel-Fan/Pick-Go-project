import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import tourService from "../../service/tour";
import ParticipantsComponet from "./participants-componet";
import DeleteSiteOrTourComponent from "./delete_siteOrTour-component";

const TourCardComponent = ({
  tour_id,
  tour,
  days, // 旅程有幾天?
  sites, // 旅程中的景點
  type, // 登入者於此旅程的參加狀態
  tourist_id,
}) => {
  const navigate = useNavigate();

  // 主辦者可使用的功能
  const [deleteId, setDeleteId] = useState(); // 設定即將要刪除的目標
  const deleteFunction = tourService.delete_tour_someSite;

  // 參加者查看簡易個人頁面
  const [checkParticipants, setCheckParticipants] = useState("");

  // 申請加入、退出的錯誤訊息
  const [message, setMessage] = useState(""); // 錯誤訊息

  // 複製景點
  const handleCopy = async () => {
    try {
      await tourService.post_copy(tour_id);
      alert("複製成功!");
      navigate(0);
    } catch (e) {
      if (e.response) {
        setMessage(e.response.data);
      } else {
        setMessage("伺服器發生問題");
      }
    }
  };

  // 申請加入旅程
  const handleApply = async () => {
    try {
      await tourService.post_apply(tour_id);
      navigate(0);
    } catch (e) {
      if (e.response) {
        setMessage(e.response.data);
      } else {
        setMessage("伺服器發生問題");
      }
    }
  };

  // 退出旅程
  const handleQuit = async () => {
    try {
      await tourService.delete_tourist(tourist_id);
      navigate(0);
    } catch (e) {
      if (e.response) {
        setMessage(e.response.data);
      } else {
        setMessage("伺服器發生問題");
      }
    }
  };

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

  return (
    //  本頁旅程資訊
    tour && (
      <div className="mt-4 mx-4">
        <div className="d-flex justify-content-between mb-3">
          <h2>旅程標題：{tour.title}</h2>
          {(type === "申請者" || type === "參加者" || type === "無") && (
            <button className="btn bg-primary-subtle" onClick={handleCopy}>
              複製至我的旅程
            </button>
          )}
        </div>

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
        {tour.status === "找旅伴" ? (
          <div>
            <div className="d-flex align-items-center">
              <span className="me-5">
                目前人數 / 人數限制：{tour.num_of_participants} / {tour.limit}
              </span>
              {type && type === "主辦者" ? (
                <a href={`/users/tours/${tour_id}/participants`}>
                  查看申請人員
                </a>
              ) : type === "參加者" ? (
                <div className="d-flex align-items-center">
                  <button
                    className="me-5 custom-botton-link"
                    onClick={() => {
                      setCheckParticipants(true);
                    }}
                  >
                    查看申請人員
                  </button>
                  <button className="btn bg-danger-subtle" onClick={handleQuit}>
                    退出旅程
                  </button>
                </div>
              ) : type === "申請者" ? (
                <button className="btn bg-danger-subtle" onClick={handleQuit}>
                  取消申請
                </button>
              ) : type === "無" ? (
                <button className="btn bg-primary-subtle" onClick={handleApply}>
                  申請參加
                </button>
              ) : (
                ""
              )}
            </div>
            {message && (
              <div className="alert alert-danger mt-2" role="alert">
                {message}
              </div>
            )}
            <hr
              style={{ border: "2px solid rgb(90, 178, 255)", opacity: "1" }}
            />
          </div>
        ) : (
          <div>
            <div className="d-flex align-items-center">
              <span className="me-5">
                目前人數 / 人數限制：{tour.num_of_participants} / {tour.limit}
              </span>
              {type && type === "主辦者" ? (
                <a href={`/users/tours/${tour_id}/participants`}>
                  查看申請人員
                </a>
              ) : type === "參加者" ? (
                <div className="d-flex align-items-center">
                  <button
                    className="me-5 custom-botton-link"
                    onClick={() => {
                      setCheckParticipants(true);
                    }}
                  >
                    查看申請人員
                  </button>
                  <button className="btn bg-danger-subtle" onClick={handleQuit}>
                    退出旅程
                  </button>
                </div>
              ) : (
                ""
              )}
            </div>
            {message && (
              <div className="alert alert-danger mt-2" role="alert">
                {message}
              </div>
            )}
            <hr
              style={{ border: "2px solid rgb(90, 178, 255)", opacity: "1" }}
            />
          </div>
        )}

        {/* 查看參加人員(參加者版本) */}
        {checkParticipants && (
          <ParticipantsComponet
            tour_id={tour_id}
            setCheckParticipants={setCheckParticipants}
          />
        )}

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
        {/* // 刪除景點功能 */}
        <DeleteSiteOrTourComponent
          deleteFunction={deleteFunction}
          deleteId={deleteId}
          setDeleteId={setDeleteId}
          setMessage={setMessage}
        />
      </div>
    )
  );
};

export default TourCardComponent;
