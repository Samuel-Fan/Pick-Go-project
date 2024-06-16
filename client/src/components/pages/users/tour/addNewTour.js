import React from "react";
import { useState } from "react";
import tourService from "../../../../service/tour";
import { useNavigate } from "react-router-dom";

// 新增旅程

const AddNewTour = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  const handleAddSite = async (e) => {
    e.preventDefault();
    // 處理form data
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    // loading中禁用submit按鈕
    document.querySelector("#add-new-site-button").disabled = true;

    try {
      document.body.style.cursor = "wait";
      let result = await tourService.post_new_tour(data);
      alert("新增完成");
      navigate("/users/tours/overview");
      navigate(0);
    } catch (e) {
      // 回復游標與submit按鈕
      document.querySelector("#add-new-site-button").disabled = false;
      document.body.style.cursor = "default";

      // 處理錯誤訊息
      console.log(e);
      if (e.response) {
        setMessage(e.response.data);
      } else {
        setMessage("伺服器發生問題，請稍後再試");
      }
    }
  };

  return (
    <div className="container">
      <div className="d-flex flex-wrap">
        <h2 className="me-4 my-2">新增旅程</h2>
      </div>
      <hr />
      <form onSubmit={handleAddSite}>
        <div className="mb-3">
          <label className="form-label">標題</label>
          <input type="text" className="form-control" name="title" />
        </div>
        <div className="mb-3">
          <label className="form-label">人數上限</label>
          <input
            type="number"
            className="form-control"
            name="limit"
            min="1"
            max="10"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">總天數</label>
          <input
            type="number"
            className="form-control"
            name="totalDays"
            min="1"
            max="7"
          />
        </div>
        <div className="mb-3">
          <label className="form-label me-2">狀態</label>
          <select name="status">
            <option value="不公開">不公開</option>
            <option value="純分享">純分享</option>
            <option value="找旅伴">找旅伴</option>
          </select>
        </div>
        <div className="mb-3">
          <label className="mb-3">說明</label>
          <textarea
            className="form-control"
            style={{ whiteSpace: "pre-line", height: "200px" }}
            name="description"
            maxlength="500"
          ></textarea>
        </div>

        {/* 錯誤訊息 */}
        <div className="small mb-2 pb-lg-2">
          {message && (
            <div className="alert alert-danger" role="alert">
              {message}
            </div>
          )}
        </div>
        <button id="add-new-site-button" className="btn btn-primary">
          Submit
        </button>
      </form>
    </div>
  );
};

export default AddNewTour;
