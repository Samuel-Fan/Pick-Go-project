import React from "react";
import { useEffect, useState } from "react";
import siteService from "../../service/site";

const Sites = () => {
  let [sites, setSites] = useState();

  useEffect(() => {
    siteService
      .get_mySite()
      .then((data) => {
        let result = data.data;
        console.log(sites);
        setSites(result);
      })
      .catch((e) => {
        console.log(e);
      });
  }, []);
  return (
    <div className="container">
      <div className="d-flex flex-wrap">
        {/* 景點圖卡 */}
        <div className="card m-2" style={{ width: "18rem" }}>
          <div
            className="bg-image hover-overlay"
            data-mdb-ripple-init
            data-mdb-ripple-color="light"
          >
            <img
              src="https://mdbcdn.b-cdn.net/img/new/standard/nature/111.webp"
              className="img-fluid"
            />
            <a href="#!">
              <div
                className="mask"
                style={{ backgroundColor: "rgba(251, 251, 251, 0.15)" }}
              ></div>
            </a>
          </div>
          <div className="card-body">
            <h5 className="card-title">Card title</h5>
            <p className="card-text">
              Some quick example text to build on the card title and make up the
              bulk of the card's content.
            </p>
            <a href="#!" className="btn btn-primary" data-mdb-ripple-init>
              Button
            </a>
          </div>
        </div>
        {sites &&
          sites.map((site) => {
            return (
              <div className="card m-2" style={{ width: "18rem" }}>
                <div
                  className="bg-image hover-overlay"
                  data-mdb-ripple-init
                  data-mdb-ripple-color="light"
                >
                  <img
                    src={
                      site.photo
                        ? site.photo.url
                        : "https://mdbcdn.b-cdn.net/img/new/standard/nature/111.webp"
                    }
                    className="img-fluid"
                  />

                  <a href="#!">
                    <div
                      className="mask"
                      style={{ backgroundColor: "rgba(251, 251, 251, 0.15)" }}
                    ></div>
                  </a>
                </div>
                <div className="card-body">
                  <h5 className="card-title">{site.title}</h5>
                  <p className="card-text">
                    {site.content.length >= 50
                      ? site.content.slice(0, 50) + "..."
                      : site.content}
                  </p>
                  <a href="#!" className="btn btn-primary" data-mdb-ripple-init>
                    Button
                  </a>
                </div>
              </div>
            );
          })}

        {/* 新增景點按鈕 */}
        <div
          className="m-2 d-flex justify-content-center align-items-center"
          style={{ width: "18rem" }}
        >
          <a href="/users/sites/new">
            <button type="button" className="btn btn-outline-primary">
              新增景點 +{" "}
            </button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Sites;
