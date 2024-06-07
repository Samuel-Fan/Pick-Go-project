import React from "react";
import { useEffect, useState } from "react";
import tourService from "../../service/tour";
import ProfileComponent from "./profile-component";

const ParticipantsComponet = ({ tour_id, setCheckParticipants }) => {
  const [participants, setParticipants] = useState(""); // 參加者
  const [user_id, setUser_id] = useState(""); // 設定想查看的profile

  // 申請者資訊
  useEffect(() => {
    tourService
      .get_myTour_tourist(tour_id)
      .then((data) => {
        setParticipants(data.data.filter((user) => user.type !== "申請者"));
      })
      .catch((e) => console.log(e));
  }, [tour_id]);
  return (
    <div className="container">
      <div
        className="rounded border"
        style={{
          position: "absolute",
          zIndex: "5",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "white",
          padding: "1rem",
          width: "40rem",
          height: "30rem",
          overflowY: "scroll",
        }}
      >
        <h2 className="me-4 my-2 text-center">已參與的人員</h2>
        <hr />
        <table className="table table-striped align-middle">
          <thead>
            <tr>
              <th style={{ width: "25%" }}>暱稱</th>
              <th style={{ width: "25%" }}>身分</th>
              <th style={{ width: "50%" }}>設定</th>
            </tr>
          </thead>
          <tbody>
            {participants &&
              participants.map((tourist) => {
                return (
                  <tr key={tourist._id} style={{ height: "4.5rem" }}>
                    <th>{tourist.user_id.username} </th>
                    <td>{tourist.type}</td>
                    <td>
                      <div>
                        <button
                          className="btn bg-primary-subtle"
                          onClick={() => {
                            setUser_id(tourist.user_id._id);
                          }}
                        >
                          檢視
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>

        <button
          type="button"
          className="btn-close"
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
          }}
          onClick={() => {
            setCheckParticipants(false);
          }}
        ></button>
      </div>

      {/* // 查看profile */}
      {user_id && (
        <ProfileComponent user_id={user_id} setUser_id={setUser_id} />
      )}

      {/* 遮罩 */}
      <div
        id="gray_cover"
        style={{
          display: "block",
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

export default ParticipantsComponet;
