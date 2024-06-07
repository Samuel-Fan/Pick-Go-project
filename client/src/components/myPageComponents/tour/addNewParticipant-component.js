import React from "react";
import { useEffect, useState } from "react";
import tourService from "../../../service/tour";
import { useParams } from "react-router-dom";
import TouristComponent from "../../smallComponents/tourist-component";
import ProfileComponent from "../../smallComponents/profile-component";
import DeleteSiteOrTourComponent from "../../smallComponents/delete_siteOrTour-component";

const AddNewParticipantComponent = () => {
  const { tour_id } = useParams();

  const [participant, setParticipant] = useState(""); // 參加者
  const [applicant, setApplicant] = useState(""); // 申請者
  const [user_id, setUser_id] = useState(""); // 設定想查看的profile

  const [message, setMessage] = useState(""); //錯誤訊息

  const [deleteId, setDeleteId] = useState(); // 設定即將要刪除的目標
  const deleteFunction = tourService.delete_tourist;

  // 處理刪除參加人員
  const handleDelete = (e) => {
    setDeleteId(e.target.name);
    document.querySelector("#siteDeleteConfirm").style.display = "flex";
    document.querySelector("#gray_cover").style.display = "block";
  };

  // 申請者資訊
  useEffect(() => {
    tourService
      .get_myTour_tourist(tour_id)
      .then((data) => {
        console.log(data.data);
        setParticipant(data.data.filter((user) => user.type !== "申請者"));
        setApplicant(data.data.filter((user) => user.type === "申請者"));
      })
      .catch((e) => console.log(e));
  }, [tour_id]);

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-around">
        <div className="me-5" style={{ flex: "1 1 400px" }}>
          <p className="h1">已參與的人員</p>
          <TouristComponent
            tourists={participant}
            handleDelete={handleDelete}
            setUser_id={setUser_id}
          />
        </div>
        <div className="me-5" style={{ flex: "1 1 400px" }}>
          <p className="h1">申請中的人員</p>
          <TouristComponent
            tourists={applicant}
            handleDelete={handleDelete}
            setUser_id={setUser_id}
            tourPublic={false}
          />
        </div>
      </div>
      {/* // 錯誤訊息 */}
      <div className="small mb-2 pb-lg-2">
        {message && (
          <div className="alert alert-danger" role="alert">
            {message}
          </div>
        )}
      </div>

      {/* // 查看profile */}
      {user_id && (
        <ProfileComponent user_id={user_id} setUser_id={setUser_id} />
      )}

      {/* // 刪除參加人員功能 */}
      <DeleteSiteOrTourComponent
        deleteFunction={deleteFunction}
        deleteId={deleteId}
        setDeleteId={setDeleteId}
        setMessage={setMessage}
      />
    </div>
  );
};

export default AddNewParticipantComponent;
