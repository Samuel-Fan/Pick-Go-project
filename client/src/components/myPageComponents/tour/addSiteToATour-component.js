import React, { useCallback } from "react";
import { useEffect, useState } from "react";
import siteService from "../../../service/site";
import tourService from "../../../service/tour";
import { useNavigate, useParams } from "react-router-dom";
import PageChooseComponent from "../../smallComponents/pageChoose-component";

const AddSiteToATourComponent = () => {
  const navigate = useNavigate();

  const { tour_id, title, day } = useParams();

  const [sites, setSites] = useState();
  const [count, setCount] = useState(); // 計算有幾個sites 分頁用
  const [page, setPage] = useState(1);
  const [type, setType] = useState("mine");
  const [message, setMessage] = useState("");

  const numberPerPage = 8; //每頁顯示幾個

  // 切換我的景點、我的收藏

  const fetchCount = useCallback(() => {
    if (type === "mine") {
      return siteService.get_mySite_count();
    } else if (type === "collections") {
      return siteService.get_myCollection_count();
    }
  }, [type]);

  const fetchSites = useCallback(() => {
    if (type === "mine") {
      return siteService.get_mySite(page, numberPerPage);
    } else if (type === "collections") {
      return siteService.get_myCollection(page, numberPerPage);
    }
  }, [type, page, numberPerPage]);

  // 加入景點
  const handleAddSites = async (e) => {
    e.preventDefault();
    let formData = new FormData(e.currentTarget);
    let data = formData.getAll("site");
    data = data.map((site) => {
      return { site_id: site, day: day };
    });

    // loading中禁用submit按鈕
    document.querySelector("#add-new-site-button").disabled = true;
    try {
      document.body.style.cursor = "wait";
      await tourService.post_addSite(tour_id, data);
      alert("新增成功");
      navigate(`/users/tours/myTour/${tour_id}`);
      navigate(0);
    } catch (e) {
      // 回復游標與submit按鈕
      document.querySelector("#add-new-site-button").disabled = false;
      document.body.style.cursor = "default";

      console.log(e);

      if (e.response) {
        console.log(e.response.data);
        setMessage(e.response.data);
      } else {
        setMessage("伺服器發生問題，請稍後再試");
      }
    }
  };

  // 剛進網站時，讀取site總數以設定分頁格式
  useEffect(() => {
    fetchCount()
      .then((data) => {
        console.log(data.data);
        console.log("讀取sites總數");
        setCount(Math.ceil(data.data.count / numberPerPage));
      })
      .catch((e) => {
        if (e.response && e.response.status === 401) {
          localStorage.removeItem("auth");
          navigate("/login");
          navigate(0);
        }
      });
  }, [fetchCount, navigate]);

  // 每次切換頁面讀取一次
  useEffect(() => {
    fetchSites()
      .then((data) => {
        let result = data.data;
        console.log("讀取sites詳細資料");
        console.log(result);
        setSites(result);
      })
      .catch((e) => {
        if (e.response && e.response.status === 401) {
          localStorage.removeItem("auth");
          navigate("/login");
          navigate(0);
        }
      });
  }, [fetchSites, navigate]);

  return (
    <div className="mx-auto" style={{ width: "50%" }}>
      <h1 className="text-center mb-4">
        {title} : 第{day}天
      </h1>
      <div>
        {/* 選擇我建立的景點or我收藏的景點 */}
        <div className="me-5 mb-3">
          <button
            className={`btn btn-outline-primary me-3 ${
              type === "mine" && "active"
            }`}
            onClick={() => {
              setType("mine");
            }}
          >
            我建立的景點
          </button>
          <button
            className={`btn btn-outline-primary ${
              type === "collection" && "active"
            }`}
            onClick={() => {
              setType("collections");
            }}
          >
            我收藏的景點
          </button>
        </div>
        <div className="text-center">
          <PageChooseComponent page={page} setPage={setPage} count={count} />
        </div>
      </div>
      {/* 頁數選擇 */}

      {/* 錯誤訊息 */}
      <div className="small mb-2 pb-lg-2">
        {message && (
          <div className="alert alert-danger" role="alert">
            {message}
          </div>
        )}
      </div>

      <form className="mx-auto" onSubmit={handleAddSites}>
        <table className="table table-striped align-middle">
          <thead>
            <tr>
              <th style={{ width: "10%" }}>選取</th>
              <th style={{ width: "45%" }}>標題</th>
              <th style={{ width: "15%" }} className="text-center">
                國家
              </th>
              <th style={{ width: "15%" }} className="text-center">
                地區
              </th>
              <th style={{ width: "15%" }} className="text-center">
                類型
              </th>
            </tr>
          </thead>
          <tbody>
            {sites &&
              sites.map((site) => {
                return (
                  <tr key={site._id}>
                    <th>
                      <input type="checkbox" name="site" value={site._id} />
                    </th>
                    <th>
                      <a href={`/site/${site._id}`}>{site.title}</a>
                    </th>
                    <td className="text-center">{site.country}</td>
                    <td className="text-center">{site.region}</td>
                    <td className="text-center">{site.type}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
        <button id="add-new-site-button" className="btn btn-primary">
          匯入至旅程
        </button>
      </form>
    </div>
  );
};

export default AddSiteToATourComponent;
