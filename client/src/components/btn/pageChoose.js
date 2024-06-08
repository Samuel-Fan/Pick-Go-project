import React from "react";

const PageChoose = ({ page, setPage, count }) => {
  // 選擇頁數
  const handlePage = (e) => {
    if (e.target.value === "previous") {
      setPage(page - 1);
    } else if (e.target.value === "next") {
      setPage(page + 1);
    } else {
      setPage(Number(e.target.value));
    }
  };

  return (
    <nav aria-label="Page navigation example" className="me-5">
      <ul className="pagination">
        <li className="page-item">
          <button
            className={`page-link ${page === 1 && "disabled"}`}
            value={"previous"}
            onClick={handlePage}
          >
            Previous
          </button>
        </li>
        {page - 2 > 0 && (
          <li className="page-item">
            <button className="page-link" value={page - 2} onClick={handlePage}>
              {page - 2}
            </button>
          </li>
        )}
        {page - 1 > 0 && (
          <li className="page-item">
            <button className="page-link" value={page - 1} onClick={handlePage}>
              {page - 1}
            </button>
          </li>
        )}
        <li className="page-item active" style={{ zIndex: 0 }}>
          <button className="page-link">{page} </button>
        </li>
        {count >= page + 1 && (
          <li className="page-item">
            <button className="page-link" value={page + 1} onClick={handlePage}>
              {page + 1}
            </button>
          </li>
        )}
        {count >= page + 2 && (
          <li className="page-item">
            <button className="page-link" value={page + 2} onClick={handlePage}>
              {page + 2}
            </button>
          </li>
        )}
        <li className="page-item">
          <button
            className={`page-link ${count === page && "disabled"}`}
            value={"next"}
            onClick={handlePage}
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default PageChoose;
