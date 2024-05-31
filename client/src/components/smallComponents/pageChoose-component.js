import React from "react";

const PageChooseComponent = ({ page, handlePage, count }) => {
  
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
        <li className="page-item active">
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

export default PageChooseComponent;
