import myPhoto from "../../../images/myPhoto.jpg";
import React from "react";

const About = () => {
  return (
    <div className="mx-5">
      <div
        className="d-flex flex-wrap justify-content-around"
        style={{ marginTop: "30px" }}
      >
        <div>
          <img
            src={myPhoto}
            alt="我的照片"
            style={{
              width: "400px",
              height: "400px",
              objectFit: "cover",
              borderRadius: "50%",
            }}
          />
          <p style={{ fontSize: "1.5rem", marginTop: "20px" }}>
            Project By <span className="mx-5">范子軒 / Samuel Fan</span>
          </p>
          <p>
            <span style={{ fontSize: "1.5rem", verticalAlign: "middle" }}>
              Contact:
            </span>
            <a
              href="https://www.linkedin.com/in/tzuhsienfan"
              style={{
                margin: "50px",
                fontSize: "3rem",
                verticalAlign: "middle",
              }}
            >
              <i className="fab fa-linkedin"></i>
            </a>
            <a
              href="https://github.com/Samuel-Fan"
              style={{ fontSize: "3rem", verticalAlign: "middle" }}
            >
              <i className="fa-brands fa-github" style={{ color: "black" }}></i>
            </a>
          </p>
          <p style={{ fontSize: "1.5rem" }}>Email: Samuel40411@gmail.com</p>
        </div>
        <div style={{ flex: "1 1 500px" }}>
          <p style={{ fontSize: "4.0rem" }}>歡迎來到 Pick & Go !</p>
          <div style={{ fontSize: "1.5rem" }}>
            <p style={{ textAlign: "justify" }}>
              我是Samuel，一個熱愛旅遊的人。由於希望能有簡單輕鬆的旅遊規劃工具，所以嘗試做了此網站。設計目標為讓使用者可隨手收藏覺得不錯的旅遊景點，再利用這些景點來籌劃旅程。
            </p>
            <p>在這個網站，目前您可以：</p>
            <ul>
              <li>
                瀏覽他人分享的旅遊景點
                <a className="ms-2" href="/sites">
                  <i className="fa-solid fa-arrow-right"></i>
                </a>
              </li>
              <li>
                搜尋並複製他人規劃的旅遊行程
                <a className="ms-2" href="/tours">
                  <i className="fa-solid fa-arrow-right"></i>
                </a>
              </li>
              <li>
                尋找一起旅遊的旅伴
                <a className="ms-2" href="/tours">
                  <i className="fa-solid fa-arrow-right"></i>
                </a>
              </li>
            </ul>
            <p>若對此網站有建議，可以隨時連絡我，希望各位都能使用的順手!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
