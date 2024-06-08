import React from "react";
import { useNavigate } from "react-router-dom";
import tourService from "../../service/tour";

// 申請/取消 加入旅程

const ApplyBtn = ({
  tour_id,
  tour,
  type, // 登入者於此旅程的參加狀態
  tourist_id,
  setMessage,
}) => {
  const navigate = useNavigate();

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
      navigate(`/tour/${tour_id}`);
    } catch (e) {
      if (e.response) {
        setMessage(e.response.data);
      } else {
        setMessage("伺服器發生問題");
      }
    }
  };

  return (
    // 旅程詳細資料
    tour && (
      <div className="me-3">
        {/* 參加人員 */}
        {(tour.status === "找旅伴" ||
          type === "參加者" ||
          type === "申請者") && (
          <div>
            <div className="d-flex align-items-center">
              {type === "無" ? (
                <button className="btn bg-primary-subtle" onClick={handleApply}>
                  申請參加
                </button>
              ) : type === "參加者" ? (
                <button className="btn bg-danger-subtle" onClick={handleQuit}>
                  退出旅程
                </button>
              ) : type === "申請者" ? (
                <button className="btn bg-danger-subtle" onClick={handleQuit}>
                  取消申請
                </button>
              ) : (
                ""
              )}
            </div>
          </div>
        )}
      </div>
    )
  );
};

export default ApplyBtn;
