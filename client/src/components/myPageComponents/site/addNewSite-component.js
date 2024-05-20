import React from "react";
import { useState, useEffect } from "react";
import siteService from "../../../service/site";
import { useNavigate } from "react-router-dom";

const AddNewSiteComponent = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState();
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [type, setType] = useState("");
  const [content, setContent] = useState("");
  const [photo, setPhoto] = useState("");
  const [message, setMessage] = useState("");

  const handleAddSite = async () => {
    const formData = new FormData();
    formData.append("file-to-upload", photo);
    formData.append("title", title);
    formData.append("country", country);
    formData.append("region", region);
    formData.append("type", type);
    formData.append("content", content);

    try {
      let result = await siteService.post_new_site(formData);
      console.log(result);
      alert("新增完成");
      navigate("/users/sites");
      navigate(0);
    } catch (e) {
      console.log(e);
      if (e.response) {
        console.log(e.response.data);
        setMessage(e.response.data);
      } else {
        setMessage("伺服器發生問題，請稍後再試");
      }
    }
  };

  const handleTitle = (e) => {
    setTitle(e.target.value);
  };

  const handleCountry = (e) => {
    setCountry(e.target.value);
    setRegion("");
  };

  const handleRegion = (e) => {
    setRegion(e.target.value);
    console.log(region);
  };

  const handleType = (e) => {
    setType(e.target.value);
  };

  const handleContent = (e) => {
    setContent(e.target.value);
  };

  const handleImage = (e) => {
    if (e.target.files[0]) {
      let file = e.target.files[0];
      let size = file.size;
      let type = file.type;
      console.log(file);

      if (
        type !== "image/jpeg" &&
        type !== "image/png" &&
        type !== "image/jpg"
      ) {
        // 只允許上傳 jpeg 或 png 檔

        setMessage("只能上傳 jpeg, jpg 或 png 檔!");
        document.querySelector("#photo_site").value = null;
      } else if (size > 1000000) {
        // 如果檔案大小大於 1 MB，不允許上傳

        setMessage("圖片過大，請使用其它方式上傳！");
        document.querySelector("#photo_site").value = null;
      } else {
        setMessage("");
        setPhoto(file);
      }
    } else {
      setPhoto("");
    }
  };

  return (
    <div className="container">
      <div className="d-flex flex-wrap">
        <h2 className="me-4 my-2">新增景點</h2>
      </div>
      <hr />
      <form>
        <div className="mb-3">
          <label className="form-label">標題</label>
          <input
            type="text"
            className="form-control"
            id="titleEdit"
            name="title"
            onChange={handleTitle}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">國家</label>
          <div>
            <div className="form-check-inline ">
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  name="country"
                  id="japan_country"
                  value="日本"
                  onChange={handleCountry}
                />
                <label className="form-check-label" htmlFor="japan_country">
                  日本
                </label>
              </div>
            </div>
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                name="country"
                id="taiwan_country"
                value="臺灣"
                onChange={handleCountry}
              />
              <label className="form-check-label" htmlFor="taiwan_country">
                臺灣
              </label>
            </div>
          </div>
        </div>
        <div className="mb-3">
          <label htmlFor="ageEdit" className="form-label">
            地區
          </label>
          {!country && (
            <select className="form-select" aria-label="Default select example">
              <option>請選擇地區</option>
            </select>
          )}
          {country === "日本" && (
            <select
              className="form-select"
              aria-label="Default select example"
              onChange={handleRegion}
            >
              <option value="">請選擇地區</option>
              <option value="北海道地區">北海道地區</option>
              <option value="東北">東北地區</option>
              <option value="關東">關東地區</option>
              <option value="近畿">近畿地區</option>
              <option value="中部">中部地區</option>
              <option value="中國">中國地區</option>
              <option value="九州">九州地區</option>
              <option value="四國">四國地區</option>
              <option value="沖繩">沖繩地區</option>
              <option value="日本其他">其他地區</option>
            </select>
          )}
          {country === "臺灣" && (
            <select
              className="form-select"
              aria-label="Default select example"
              onChange={handleRegion}
            >
              <option value="">請選擇地區</option>
              <option value="台北">台北</option>
              <option value="新北">新北</option>
              <option value="桃園">桃園</option>
              <option value="台中">台中</option>
              <option value="台南">台南</option>
              <option value="高雄">高雄</option>
              <option value="臺灣其他">其他</option>
            </select>
          )}
        </div>
        <div className="mb-3">
          <label className="form-label">類型</label>
          <div>
            <div className="form-check-inline ">
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  name="type"
                  id="restaurant_type"
                  value="餐廳"
                  onChange={handleType}
                />
                <label className="form-check-label" htmlFor="restaurant_type">
                  餐廳
                </label>
              </div>
            </div>
            <div className="form-check-inline ">
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  name="type"
                  id="spot_type"
                  value="景點"
                  onChange={handleType}
                />
                <label className="form-check-label" htmlFor="spot_type">
                  景點
                </label>
              </div>
            </div>
            <div className="form-check-inline ">
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  name="type"
                  id="shopping_type"
                  value="購物"
                  onChange={handleType}
                />
                <label className="form-check-label" htmlFor="shopping_type">
                  購物
                </label>
              </div>
            </div>
            <div className="form-check-inline ">
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  name="type"
                  id="other_type"
                  value="其他"
                  onChange={handleType}
                />
                <label className="form-check-label" htmlFor="other_type">
                  其他
                </label>
              </div>
            </div>
          </div>
        </div>
        <div className="mb-3">
          <label htmlFor="content_site" className="mb-3">
            內文
          </label>
          <textarea
            className="form-control"
            id="content_site"
            style={{ whiteSpace: "pre-line" }}
            onChange={handleContent}
          ></textarea>
        </div>
        <div className="mb-3">
          <label htmlFor="photo_site" className="mb-3">
            上傳照片
          </label>
          <input
            type="file"
            className="form-control"
            id="photo_site"
            onChange={handleImage}
          />
        </div>
        <div className="small mb-2 pb-lg-2">
          {message && (
            <div className="alert alert-danger" role="alert">
              {message}
            </div>
          )}
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleAddSite}
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default AddNewSiteComponent;
