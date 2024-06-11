import React from "react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import adminService from "../../../service/admin";
import TourInfoCard from "../../card/tour_Info_Card";
import TourSiteCard from "../../card/tourSiteCard";
import Participants from "../../modal/participants";

// 旅程詳細資料(只限公開的)

const TourDetail = () => {
  const navigate = useNavigate();

  const { tour_id } = useParams();

  const [tour, setTour] = useState(""); // 景點詳細資料
  const [sites, setSites] = useState(""); // 每天行程
  const [days, setDays] = useState([""]); // 設定每天格式用

  // 參加者查看簡易個人頁面
  const [checkParticipants, setCheckParticipants] = useState("");

  // 旅程資訊
  useEffect(() => {
    adminService
      .get_tour_detail(tour_id)
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
        } else if (e.response && e.response.status === 404) {
          navigate("/404");
        }
      });
  }, [navigate, tour_id]);

  return (
    <div className="mt-3">
      {/* 旅程簡易資料 */}
      <TourInfoCard tour={tour} />

      {/* 每日行程 */}
      <TourSiteCard
        tour={tour}
        tour_id={tour_id}
        sites={sites}
        days={days}
        type="無"
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
