import React from "react";
import { useState, useEffect } from "react";
import siteService from "../../../../service/site";
import { useNavigate, useParams } from "react-router-dom";

// 編輯景點

const EditSite = () => {
  const navigate = useNavigate();
  const { site_id } = useParams();

  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [removeOriginPhoto, setRemoveOriginPhoto] = useState(false);
  const [sitePublic, setSitePublic] = useState("");
  const [message, setMessage] = useState("");

  const handleEditSite = async (e) => {
    e.preventDefault();
    // 處理form data
    const formData = new FormData(e.currentTarget);
    formData.append("public", sitePublic);

    // 如有編輯新照片或移除舊照片，則設定參數告訴後台要刪除照片
    if (formData.get("photo").name) {
      formData.append("removeOriginPhoto", true);
    } else {
      formData.append("removeOriginPhoto", removeOriginPhoto);
    }

    // loading中禁用submit按鈕
    document.querySelector("#edit-site-submit-button").disabled = true;

    try {
      document.body.style.cursor = "wait";
      let result = await siteService.patch_edit_site(site_id, formData);
      console.log(result);
      alert("修改完成");
      navigate("/users/sites/overview/mine");
      navigate(0);
    } catch (e) {
      // 回復游標與submit按鈕
      document.body.style.cursor = "default";
      document.querySelector("#edit-site-submit-button").disabled = false;

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

  const handleCountry = (e) => {
    setCountry(e.target.value);
    setRegion("");
  };

  const handleRegion = (e) => {
    setRegion(e.target.value);
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
      } else if (size > 2.5 * 1024 * 1024) {
        // 如果檔案大小大於 2.5 MB，不允許上傳

        setMessage("圖片過大，請使用其它方式上傳！(限制 2.5 MB)");
        document.querySelector("#photo_site").value = null;
      } else {
        setMessage("");
      }
    } else {
      document.querySelector("#photo_site").value = null;
    }
  };

  const removePhoto = () => {
    setRemoveOriginPhoto(true);
    document.querySelector("#origin_photo").textContent = "";
    document.querySelector("#removePhotoButton").style.display = "none";
  };

  const handlePublic = () => {
    setSitePublic(!sitePublic);
  };

  useEffect(() => {
    document.body.style.cursor = "wait";
    document.querySelector("#edit-site-submit-button").disabled = true;

    siteService
      .get_mySite_detail(site_id)
      .then((data) => {
        document.body.style.cursor = "default";
        document.querySelector("#edit-site-submit-button").disabled = false;
        let siteInfo = data.data;
        console.log(siteInfo);
        // 如果作者與編輯人不符，跳轉頁面
        if (
          !siteInfo.author._id === JSON.parse(localStorage.getItem("auth"))._id
        ) {
          navigate("/noAuth");
          navigate(0);
        }

        // 更新標題
        document.querySelector("#title_site_edit").value = siteInfo.title;

        // 選取國家
        setCountry(siteInfo.country);
        switch (siteInfo.country) {
          case "日本":
            document.querySelector("#japan_country").checked = true;
            break;
          case "臺灣":
            document.querySelector("#taiwan_country").checked = true;
            break;
          default:
            break;
        }

        // 更新地區
        setRegion(siteInfo.region);

        // 選取類型
        switch (siteInfo.type) {
          case "餐廳":
            document.querySelector("#restaurant_type").checked = true;
            break;
          case "景點":
            document.querySelector("#spot_type").checked = true;
            break;
          case "購物":
            document.querySelector("#shopping_type").checked = true;
            break;
          case "其他":
            document.querySelector("#other_type").checked = true;
            break;
          default:
            break;
        }

        // 更新內容
        document.querySelector("#content_site_edit").value = siteInfo.content;

        // 顯示舊相片名稱
        document.querySelector("#origin_photo").textContent =
          siteInfo.photo.photoName;

        // 公開設定
        setSitePublic(siteInfo.public);
        if (siteInfo.public) {
          document.querySelector("#publicButton").checked = true;
        }
      })
      .catch((e) => console.log(e));
  }, [navigate, site_id]);

  return (
    <div className="container">
      <div className="d-flex flex-wrap">
        <h2 className="me-4 my-2">編輯景點</h2>
      </div>
      <hr />
      <form onSubmit={handleEditSite}>
        <div className="mb-3">
          <label className="form-label">標題</label>
          <input
            type="text"
            className="form-control"
            id="title_site_edit"
            name="title"
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
          <label className="form-label">地區</label>
          {!country && (
            <select
              className="form-select"
              aria-label="Default select example"
              name="region"
            >
              <option>請選擇地區</option>
            </select>
          )}
          {country === "日本" && (
            <select
              className="form-select"
              aria-label="Default select example"
              name="region"
              onChange={handleRegion}
              value={region}
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
              name="region"
              onChange={handleRegion}
              value={region}
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
                />
                <label className="form-check-label" htmlFor="other_type">
                  其他
                </label>
              </div>
            </div>
          </div>
        </div>
        <div className="mb-3">
          <label className="mb-3">內文</label>
          <textarea
            className="form-control"
            id="content_site_edit"
            style={{ whiteSpace: "pre-line", height: "200px" }}
            name="content"
          ></textarea>
        </div>
        <div className="mb-3">
          <div className="d-flex my-2">
            <div className="my-auto">
              原照片：<span id="origin_photo"></span>
            </div>
            <button
              id="removePhotoButton"
              className="btn bg-danger-subtle ms-2"
              type="button"
              onClick={removePhoto}
            >
              移除照片
            </button>
          </div>

          <label htmlFor="photo_site_edit" className="mb-3">
            更換照片
          </label>
          <input
            type="file"
            className="form-control"
            id="photo_site_edit"
            name="photo"
            onChange={handleImage}
          />
        </div>
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            id="publicButton"
            onChange={handlePublic}
          />
          <label className="form-check-label" htmlFor="publicButton">
            {sitePublic ? "公開" : "不公開"}
          </label>
        </div>
        <div className="small mb-2 pb-lg-2">
          {message && (
            <div className="alert alert-danger" role="alert">
              {message}
            </div>
          )}
        </div>
        <button id="edit-site-submit-button" className="btn btn-primary">
          Submit
        </button>
      </form>
    </div>
  );
};

export default EditSite;
