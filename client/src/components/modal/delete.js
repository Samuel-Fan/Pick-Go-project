import React from "react";
import { useNavigate } from "react-router-dom";

// 處理各種刪除防呆

const Delete = ({ deleteFunction, deleteId, setDeleteId, setMessage }) => {
  const navigate = useNavigate();

  // 確認後不刪除
  const cancelDelete = () => {
    setDeleteId("");
    document.querySelector("#siteDeleteConfirm").style.display = "none";
    document.querySelector("#gray_cover").style.display = "none";
  };

  // 確認後刪除
  const deleteIt = async () => {
    // 設定游標、暫停按鈕功能
    document.body.style.cursor = "wait";
    document.querySelectorAll("button").forEach((button) => {
      button.disabled = true;
    });

    try {
      let result = await deleteFunction(deleteId);
      alert(result.data);
      navigate(0);
    } catch (e) {
      document.body.style.cursor = "default";
      document.querySelectorAll("button").forEach((button) => {
        button.disabled = false;
      });

      if (e.response) {
        console.log(e.response.data);
        setMessage(e.response.data);
      } else {
        setMessage("伺服器發生問題，請稍後再試");
      }
    }
    document.querySelector("#siteDeleteConfirm").style.display = "none";
    document.querySelector("#gray_cover").style.display = "none";
    setDeleteId("");
  };

  return (
    <div>
      {/* 確定刪除按鈕 */}
      <div
        id="siteDeleteConfirm"
        className="bg-light-subtle justify-content-center align-items-center rounded"
        style={{
          display: "none",
          height: "8rem",
          width: "15rem",
          position: "fixed",
          top: "37%",
          left: "46%",
          zIndex: "2",
        }}
      >
        <div className="container text-center">
          <p className="mb-3 fs-2">確定刪除?</p>
          <div>
            <button
              type="button"
              className="deleteConfirmButton bg-success-subtle"
              onClick={cancelDelete}
            >
              取消
            </button>
            <button
              type="button"
              className="deleteConfirmButton bg-danger-subtle"
              onClick={deleteIt}
            >
              刪除
            </button>
          </div>
        </div>
      </div>

      {/* 遮罩 */}
      <div
        id="gray_cover"
        style={{
          display: "none",
          height: "100vh",
          width: "100vw",
          opacity: "80%",
          backgroundColor: "black",
          position: "fixed",
          top: "0",
          left: "0",
          zIndex: "1",
        }}
      ></div>
    </div>
  );
};

export default Delete;
