import React from "react";
import { useEffect, useState } from "react";
import tourService from "../../../../service/tour";
import { useNavigate, Link } from "react-router-dom";
import PageChoose from "../../../btn/pageChoose";
import Delete from "../../../modal/delete";

// 自己建立的旅程總覽

const MyToursOverview = () => {
  const navigate = useNavigate();

  const [tours, setTours] = useState();
  const [count, setCount] = useState(); // 計算有幾個sites 分頁用
  const [page, setPage] = useState(1);
  const numberPerPage = 8; //每頁顯示幾個
  const [edit, setEdit] = useState(""); // 選擇編輯

  const [deleteId, setDeleteId] = useState(); // 設定即將要刪除的目標
  const deleteFunction = tourService.delete_tour;

  const [message, setMessage] = useState(""); // 錯誤訊息

  // 編輯旅程基本資訊
  const handleEdit = async (e) => {
    e.preventDefault();
    let formData = new FormData(e.currentTarget);
    let data = Object.fromEntries(formData.entries());

    // 設定人數不得少於限制人數
    if (data.limit < edit.num_of_participants) {
      setMessage("人數限制不得少於目前人數，請踢掉一些人!");
      return;
    }

    // (double check)若總天數減少，會刪除超出天數的景點
    if (data.totalDays < edit.totalDays) {
      let check = prompt("超出天數的景點將會被刪除，確定繼續? Y");
      if (check !== "Y") {
        return;
      }
    }

    try {
      document.body.style.cursor = "wait";
      document.querySelectorAll("button").forEach((button) => {
        button.disabled = true;
      });
      await tourService.patch_edit_tour(edit._id, data); // 修改資料

      if (data.totalDays < edit.totalDays) {
        await tourService.delete_over_totalDays(edit._id, data.totalDays); // 刪除超出天數的景點
      }

      document.body.style.cursor = "default";
      navigate(0);
    } catch (e) {
      // 回復游標與submit按鈕
      document.body.style.cursor = "default";
      document.querySelectorAll("button").forEach((button) => {
        button.disabled = false;
      });

      // 處理錯誤訊息
      console.log(e);
      if (e.response) {
        console.log(e.response.data);
        setMessage(e.response.data);
      } else {
        setMessage("伺服器發生問題，請稍後再試");
      }
    }
  };

  // 處理刪除旅程
  const handleDelete = (e) => {
    setDeleteId(e.target.name);
    document.querySelector("#siteDeleteConfirm").style.display = "flex";
    document.querySelector("#gray_cover").style.display = "block";
  };

  // 處理description的文字長度
  const handleDescription = (string) => {
    return string.length >= 40 ? string.slice(0, 40) + "..." : string;
  };

  // 剛進網站時，讀取site總數以設定分頁格式
  useEffect(() => {
    tourService
      .get_myTour_count()
      .then((data) => {
        console.log(data.data);
        console.log("讀取sites總數");
        setCount(Math.ceil(data.data.count / numberPerPage));
      })
      .catch((e) => {
        if (e.response) {
          switch (e.response.status) {
            case 401:
              alert("請重新登入");
              localStorage.removeItem("auth");
              navigate("/login");
              navigate(0);
              break;
            default:
              alert(e.response.data);
              break;
          }
        } else {
          alert("伺服器發生問題");
        }
      });
  }, [navigate]);

  // 每次切換頁面讀取一次
  useEffect(() => {
    tourService
      .get_myTour(page, numberPerPage)
      .then((data) => {
        let result = data.data;
        console.log(result);
        console.log("讀取tours詳細資料");
        setTours(result);
      })
      .catch((e) => {
        console.log(e);
      });
  }, [page, navigate]);

  return (
    <div className="container">
      <div className="d-flex">
        {/* 選擇我建立的景點or我收藏的景點 */}
        <div className="me-5 mb-3">
          <Link
            to="/users/tours/overview"
            className="btn btn-outline-primary me-3 active"
            disabled
          >
            我建立的旅程
          </Link>
          <Link
            to="/users/tours/overview/Apply"
            className="btn btn-outline-primary"
          >
            我參加的旅程
          </Link>
        </div>
        {/* 頁數選擇 */}
        <PageChoose page={page} setPage={setPage} count={count} />
        {/* 新增旅程按鈕 */}
        <div style={{ width: "18rem" }}>
          <a href="/users/tours/new">
            <button type="button" className="btn btn-outline-primary">
              新增旅程 +
            </button>
          </a>
        </div>
      </div>

      {/* 旅程表列 */}
      <form onSubmit={handleEdit}>
        <table className="table table-striped align-middle">
          <thead>
            <tr>
              <th style={{ width: "7rem" }}>標題</th>
              <th style={{ width: "9rem" }}>簡介</th>
              <th style={{ width: "4rem" }} className="text-center">
                總天數
              </th>
              <th style={{ width: "6rem" }} className="text-center">
                目前人數/上限
              </th>
              <th style={{ width: "3rem" }} className="text-center">
                狀態
              </th>
              <th style={{ width: "8rem" }}>設定</th>
            </tr>
          </thead>

          <tbody>
            {!edit &&
              tours &&
              tours.map((tour) => {
                return (
                  <tr key={tour._id} style={{ height: "5rem" }}>
                    <th>{tour.title}</th>
                    <td style={{ wordWrap: "break-word", maxWidth: "9rem" }}>
                      {handleDescription(tour.description)}
                    </td>
                    <td className="text-center">{tour.totalDays}</td>
                    <td className="text-center">
                      {tour.num_of_participants}/{tour.limit}
                    </td>
                    <td className="text-center">{tour.status}</td>
                    <td>
                      <Link
                        to={`/users/tours/myTour/${tour._id}`}
                        className="btn bg-primary-subtle"
                      >
                        檢視
                      </Link>
                      <button
                        type="button"
                        className="btn bg-danger-subtle ms-2 my-2"
                        name={tour._id}
                        onClick={() => {
                          setEdit(tour);
                        }}
                      >
                        編輯
                      </button>
                      <button
                        type="button"
                        className="btn bg-danger-subtle ms-2 my-2"
                        name={tour._id}
                        onClick={handleDelete}
                      >
                        刪除
                      </button>
                    </td>
                  </tr>
                );
              })}
            {edit && (
              <tr>
                <th className="text-start me-4">
                  <input
                    className="m-2"
                    maxLength="20"
                    name="title"
                    style={{ width: "100%" }}
                    defaultValue={edit.title}
                  />
                </th>
                <td>
                  <textarea
                    rows="5"
                    maxLength="500"
                    name="description"
                    style={{ width: "100%" }}
                    defaultValue={edit.description}
                  />
                </td>
                <td className="text-center">
                  <input
                    style={{ width: "2rem", textAlign: "center" }}
                    type="number"
                    name="totalDays"
                    min="1"
                    max="7"
                    defaultValue={edit.totalDays}
                  />
                </td>
                <td className="text-center">
                  <span>{edit.num_of_participants} / </span>
                  <input
                    style={{ width: "3rem", textAlign: "center" }}
                    type="number"
                    name="limit"
                    min="1"
                    max="10"
                    defaultValue={edit.limit}
                  />
                </td>
                <td className="text-center">
                  <select name="status" defaultValue={edit.status}>
                    <option value="不公開">不公開</option>
                    <option value="純分享">純分享</option>
                    <option value="找旅伴">找旅伴</option>
                  </select>
                </td>
                <td className="text-start">
                  <button type="submit" className="btn bg-primary-subtle">
                    儲存
                  </button>
                  <button
                    type="button"
                    className="btn bg-primary-subtle ms-2 my-2"
                    onClick={() => {
                      setEdit("");
                      setMessage("");
                    }}
                  >
                    取消
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </form>

      {/* // 錯誤訊息 */}
      <div className="small mb-2 pb-lg-2">
        {message && (
          <div className="alert alert-danger" role="alert">
            {message}
          </div>
        )}
      </div>

      {/* // 刪除旅程功能 */}
      <Delete
        deleteFunction={deleteFunction}
        deleteId={deleteId}
        setDeleteId={setDeleteId}
        setMessage={setMessage}
      />
    </div>
  );
};

export default MyToursOverview;
