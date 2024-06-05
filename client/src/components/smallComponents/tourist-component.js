import React, { useState } from "react";
import tourService from "../../service/tour";
import { useNavigate } from "react-router-dom";

const TouristComponent = ({ tourists, handleDelete, setUser_id }) => {
  const navigate = useNavigate();

  // 將申請者更新為參加者
  const handleAddTourist = async (e) => {
    // 設定游標、暫停按鈕功能
    document.body.style.cursor = "wait";
    document.querySelectorAll("button").forEach((button) => {
      button.disabled = true;
    });

    try {
      await tourService.patch_add_to_participant(e.target.name);
      alert("加入成功");
      navigate(0);
    } catch (e) {
      // 回復游標、按鈕功能
      document.body.style.cursor = "default";
      document.querySelectorAll("button").forEach((button) => {
        button.disabled = false;
      });

      if (e.response) {
        alert(e.response.data);
      } else {
        alert("伺服器發生問題，請稍後再試");
      }
    }
  };

  return (
    <table className="table table-striped align-middle">
      <thead>
        <tr>
          <th style={{ width: "25%" }}>暱稱</th>
          <th style={{ width: "25%" }}>身分</th>
          <th style={{ width: "50%" }}>設定</th>
        </tr>
      </thead>
      <tbody>
        {tourists &&
          tourists.map((tourist) => {
            return (
              <tr key={tourist._id} style={{ height: "4.5rem" }}>
                <th>{tourist.user_id.username} </th>
                <td>{tourist.type}</td>
                <td>
                  {tourist.type !== "主辦者" && (
                    <div>
                      <button
                        className="btn bg-primary-subtle"
                        onClick={() => {
                          setUser_id(tourist.user_id._id);
                        }}
                      >
                        檢視
                      </button>
                      <button
                        type="button"
                        className="btn bg-primary-subtle ms-2 my-2"
                        name={tourist._id}
                        onClick={handleAddTourist}
                      >
                        加入
                      </button>
                      {tourist.type !== "主辦者" && (
                        <button
                          type="button"
                          className="btn bg-danger-subtle ms-2 my-2"
                          name={tourist._id}
                          onClick={handleDelete}
                        >
                          刪除
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
      </tbody>
    </table>
  );
};

export default TouristComponent;
