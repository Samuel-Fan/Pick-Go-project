import React from "react";
import authService from "../../service/auth";
import siteService from "../../service/site";
import { useState } from "react";

const HomeComponent = ({ currentUser }) => {
  const [image, setImage] = useState("");
  const [testState, setTest] = useState([]);
  const [message, setMessage] = useState("");

  const test = async () => {
    try {
      let result = await authService.get_auth_test();
      console.log(result);
      console.log(currentUser);
      return result;
    } catch (e) {
      console.log(e);
    }
  };

  const handleUpload = async (file) => {
    let data = { photoBinData: file.imgCode, photoSize: file.size };
    try {
      let result = await siteService.post_site_test(data);
      console.log(result);
    } catch (e) {
      console.log(e);
      if (e.response && e.response.status === 400) {
        setMessage(e.response.data);
      } else {
        setMessage("伺服器發生問題，請稍後再試");
      }
    }
  };

  const handleImage = (e) => {
    let file = e.target.files[0];
    let size = file.size;
    let type = file.type;

    console.log(file);

    if (type !== "image/jpeg" && type !== "image/png") {
      // 只允許上傳 jpeg 或 png 檔

      setMessage("只能上傳 jpeg 或 png 檔!");
      document.querySelector("#image-upload").value = null;
    } else if (size > 1000000) {
      // 如果檔案大小大於 1 MB，不允許上傳

      setMessage("圖片過大，請使用其它方式上傳！");
      document.querySelector("#image-upload").value = null;
    } else {
      setMessage("");
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function (e) {
        // 讀取到的圖片base64 數據編碼 將此編碼字符串傳給後臺即可
        const imgCode = e.target.result;

        // 上傳照片數據
        handleUpload({ imgCode, size });
      };
    }
  };

  const showImage = async () => {
    try {
      let foundSites = await siteService.get_site_test();
      console.log(foundSites.data);
      setTest(foundSites.data);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div>
      <input type="file" id="image-upload" onChange={handleImage}></input>
      <button type="button" onClick={showImage}></button>
      {testState.length !== 0 &&
        testState.map((image) => {
          return (
            <div className="container" style={{ width: "100px" }}>
              123
              <img src={image} className="img-thumbnail" alt="..." />
            </div>
          );
        })}
      {message && (
        <div className="small mb-2 pb-lg-2">
          {message && (
            <div className="alert alert-danger" role="alert">
              {message}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HomeComponent;
