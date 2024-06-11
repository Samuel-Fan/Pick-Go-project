import React from "react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import tourService from "../../../../service/tour";
import TourInfoCard from "../../../card/tour_Info_Card";
import CopyTourBtn from "../../../btn/copyTour";
import ApplyBtn from "../../../btn/applyBtn";
import TourSiteCard from "../../../card/tourSiteCard";
import Participants from "../../../modal/participants";

// 旅程詳細資料(只限公開的)

const TourDetail = () => {
  const navigate = useNavigate();

  const { tour_id } = useParams();

  const [tour, setTour] = useState(""); // 景點詳細資料
  const [sites, setSites] = useState(""); // 每天行程
  const [days, setDays] = useState([""]); // 設定每天格式用
  const [type, setType] = useState(""); // 確認自己的參加狀態
  const [tourist_id, setTourist_id] = useState(""); // 使用者於此行程的參加id

  // 參加者查看簡易個人頁面
  const [checkParticipants, setCheckParticipants] = useState("");

  // 處理錯誤訊息
  const [message, setMessage] = useState(""); // 錯誤訊息

  // 旅程資訊
  useEffect(() => {
    tourService
      .get_tour_detail(tour_id)
      .then((data) => {
        console.log(data.data);
        setTour(data.data.foundTour);
        setSites(data.data.dayPlan);

        let array = new Array(data.data.foundTour.totalDays).fill("");
        setDays(array.map((n, i) => i + 1));
      })
      .catch((e) => {
        if (e.response) {
          switch (e.response.status) {
            case 401:
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
  }, [navigate, tour_id]);

  // 自己的參加狀態
  useEffect(() => {
    tourService
      .get_myType(tour_id)
      .then((data) => {
        console.log(data.data);
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
    <div className="mt-3">
      {/* 旅程簡易資料 */}
      <TourInfoCard tour={tour} />

      <div className="mx-4 my-4 d-flex">
        {/* 複製旅程 */}
        <CopyTourBtn tour_id={tour_id} setMessage={setMessage} />

        {/* 申請、取消加入旅程 */}
        <ApplyBtn
          tour_id={tour_id}
          tour={tour}
          type={type}
          tourist_id={tourist_id}
          setMessage={setMessage}
        />
      </div>

      {/* 錯誤訊息 */}
      {message && (
        <div className="alert alert-danger mt-2" role="alert">
          {message}
        </div>
      )}

      <hr
        className="my-1"
        style={{ border: "2px solid rgb(90, 178, 255)", opacity: "1" }}
      />

      {/* 每日行程 */}
      <TourSiteCard
        tour={tour}
        tour_id={tour_id}
        sites={sites}
        days={days}
        type={type}
        handleDelete={() => {}}
      />

      {/* 查看參加人員(參加者版本) */}
      {checkParticipants && (
        <Participants
          tour_id={tour_id}
          setCheckParticipants={setCheckParticipants}
        />
      )}
    </div>
  );
};

export default TourDetail;
