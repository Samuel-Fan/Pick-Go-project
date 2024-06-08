import React from "react";

const CheckParticipants = ({ type, tour_id, setCheckParticipants }) => {
  return (
    <div className="me-3">
      {type === "主辦者" && (
        <a a href={`/users/tours/${tour_id}/participants`}>
          <button className="btn bg-primary-subtle">查看參加人員</button>
        </a>
      )}
      {type === "參加者" && (
        <button
          className="btn bg-primary-subtle"
          onClick={() => {
            setCheckParticipants(true);
          }}
        >
          查看參加人員
        </button>
      )}
    </div>
  );
};

export default CheckParticipants;
