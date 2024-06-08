import React from "react";
import tourService from "../../service/tour";
import { useNavigate } from "react-router-dom";

const CopyTour = ({ tour_id, setMessage }) => {
  const navigate = useNavigate();

  // 複製景點
  const handleCopy = async () => {
    try {
      await tourService.post_copy(tour_id);
      alert("複製成功!");
      navigate(0);
    } catch (e) {
      if (e.response) {
        if (e.response.status === 401) {
          setMessage("您必須先登入!");
        } else {
          setMessage(e.response.data);
        }
      } else {
        setMessage("伺服器發生問題");
      }
    }
  };

  return (
    <div className="me-3">
      <button className="btn bg-primary-subtle" onClick={handleCopy}>
        複製至我的旅程
      </button>
    </div>
  );
};

export default CopyTour;
