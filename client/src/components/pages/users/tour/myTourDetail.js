import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import tourService from "../../../../service/tour";
import TourInfoCard from "../../../card/tour_Info_Card";
import ApplyBtn from "../../../btn/applyBtn";
import TourSiteCard from "../../../card/tourSiteCard";
import Participants from "../../../modal/participants";
import Delete from "../../../modal/delete";
import CheckParticipantsBtn from "../../../btn/checkParticipants";

// 旅程詳細資料 (非公開) (主辦者、參加者可看)

const MyTourDetail = () => {
  const navigate = useNavigate();

  const { tour_id } = useParams();

  const [tour, setTour] = useState(""); // 景點詳細資料
  const [sites, setSites] = useState(""); // 每天行程
  const [days, setDays] = useState([""]); // 設定每天格式用
  const [type, setType] = useState(""); // 主辦人 or 參加者?
  const [tourist_id, setTourist_id] = useState(""); // 使用者於此行程的參加id

  // 處理錯誤訊息
  const [message, setMessage] = useState(""); // 錯誤訊息

  // 刪除景點
  const [deleteId, setDeleteId] = useState(); // 設定即將要刪除的目標
  const deleteFunction = tourService.delete_tour_someSite;

  // 參加者查看簡易個人頁面
  const [checkParticipants, setCheckParticipants] = useState("");

  // 處理刪除景點
  const handleDelete = (e) => {
    setDeleteId(e.target.name);
    document.querySelector("#siteDeleteConfirm").style.display = "flex";
    document.querySelector("#gray_cover").style.display = "block";
  };

  // 得到景點資訊
  useEffect(() => {
    tourService
      .get_myTour_detail(tour_id)
      .then((data) => {
        setTour(data.data.foundTour);
        setSites(data.data.dayPlan);

        let array = new Array(data.data.foundTour.totalDays).fill("");
        setDays(array.map((n, i) => i + 1));
      })
      .catch((e) => {
        if (e.response) {
          switch (e.response.status) {
            case 401:
              alert("請重新登入");
              navigate("/login");
              navigate(0);
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
  }, [navigate, tour_id]);

  // 自己的參加狀態
  useEffect(() => {
    tourService
      .get_myType(tour_id)
      .then((data) => {
        setType(data.data.type);
        setTourist_id(data.data._id);
      })
      .catch((e) => {
        if (e.response && e.response.status === 401) {
          setType("無登入");
        }
      });
  }, [navigate, tour_id]);

  return (
    <div>
      <div className="mx-4 mb-3">
        <Link
          to="/users/tours/overview"
          className="btn btn-outline-primary me-3"
        >
          回到我的旅程
        </Link>
      </div>

      {/* 旅程簡易資料 */}
      <TourInfoCard tour={tour} />

      <div className="mx-4 my-4 d-flex">
        {/* 參加人員資料 */}
        <CheckParticipantsBtn
          type={type}
          tour_id={tour_id}
          setCheckParticipants={setCheckParticipants}
        />

        {/* 申請、取消加入旅程 */}
        <ApplyBtn
          tour_id={tour_id}
          tour={tour}
          type={type}
          tourist_id={tourist_id}
          setMessage={setMessage}
        />
      </div>

      <hr style={{ border: "2px solid rgb(90, 178, 255)", opacity: "1" }} />

      {/* 每日行程 */}
      <TourSiteCard
        tour={tour}
        tour_id={tour_id}
        sites={sites}
        days={days}
        type={type}
        handleDelete={handleDelete}
      />

      {/* 錯誤訊息 */}
      {message && (
        <div className="alert alert-danger mt-2" role="alert">
          {message}
        </div>
      )}

      {/* 查看參加人員(參加者版本) */}
      {checkParticipants && (
        <Participants
          tour_id={tour_id}
          setCheckParticipants={setCheckParticipants}
        />
      )}

      {/* // 刪除景點功能 */}
      <Delete
        deleteFunction={deleteFunction}
        deleteId={deleteId}
        setDeleteId={setDeleteId}
        setMessage={setMessage}
      />
    </div>
  );
};

export default MyTourDetail;
