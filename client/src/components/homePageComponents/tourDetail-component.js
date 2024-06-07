import React from "react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import tourService from "../../service/tour";
import TourCardComponent from "../smallComponents/tourCard-component";

const TourDetailComponent = () => {
  const navigate = useNavigate();

  const { tour_id } = useParams();

  const [tour, setTour] = useState(""); // 景點詳細資料
  const [sites, setSites] = useState(""); // 每天行程
  const [days, setDays] = useState([""]); // 設定每天格式用
  const [type, setType] = useState(""); // 確認自己的參加狀態
  const [tourist_id, setTourist_id] = useState(""); // 使用者於此行程的參加id

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
        if (e.response && e.response.status === 403) {
          navigate("/noAuth");
        } else if (e.response && e.response.status === 404) {
          navigate("/404");
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
    <div>
      <hr
        className="mx-4 "
        style={{ border: "2px solid rgb(90, 178, 255)", opacity: "1" }}
      />

      {/* 旅程詳細資料 */}
      <TourCardComponent
        tour_id={tour_id}
        tour={tour}
        sites={sites}
        days={days}
        type={type}
        tourist_id={tourist_id}
      />
    </div>
  );
};

export default TourDetailComponent;
