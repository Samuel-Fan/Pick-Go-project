import travelImage from "../../../images/travel.png";
import planImage from "../../../images/plan.png";
import teamImage from "../../../images/team.png";
import React from "react";

const Home = () => {
  return (
    <div className="d-flex flex-column custom-homePage">
      <div
        className="vh-100 d-flex align-items-center justify-content-center"
        style={{ backgroundColor: "rgb(254, 255, 210)" }}
      >
        <div
          className="d-flex align-items-center"
          style={{ width: "80%", height: "70%" }}
        >
          <div style={{ flex: "1 1 200px" }}>
            <p className="display-1">Discovering</p>
            <p className="display-5">Finding Secret Destinations</p>
            <p className="display-5">尋找特別的旅遊景點</p>
          </div>
          <div style={{ flex: "1 1 200px" }}>
            <img
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              src={travelImage}
              alt="travelImage"
            />
          </div>
        </div>
      </div>
      <div
        className="vh-100 d-flex align-items-center justify-content-center"
        style={{ backgroundColor: "rgb(255, 191, 120)" }}
      >
        <div
          className="d-flex align-items-center"
          style={{ width: "80%", height: "70%" }}
        >
          <div style={{ flex: "1 1 200px" }}>
            <img
              style={{ width: "80%", height: "80%", objectFit: "contain" }}
              src={planImage}
              alt="planImage"
            />
          </div>
          <div style={{ flex: "1 1 200px" }}>
            <p className="display-1">Explore</p>
            <p className="display-5">Craft Your Own Adventure</p>
            <p className="display-5">打造自己的夢想旅程</p>
          </div>
        </div>
      </div>
      <div
        className="vh-100 d-flex align-items-center justify-content-center"
        style={{ backgroundColor: "rgb(255, 238, 169)" }}
      >
        <div
          className="d-flex align-items-center"
          style={{ width: "80%", height: "70%" }}
        >
          <div style={{ flex: "1 1 200px" }}>
            <p className="display-1">Connect</p>
            <p className="display-5">Seek Companions</p>
            <p className="display-5">尋找旅伴 共創回憶</p>
          </div>
          <div style={{ flex: "1 1 200px" }}>
            <img
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              src={teamImage}
              alt="teamImage"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
