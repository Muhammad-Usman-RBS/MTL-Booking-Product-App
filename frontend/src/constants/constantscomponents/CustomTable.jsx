  import React, { useState, useEffect, useRef } from "react";
  import Icons from "../../assets/icons";
  import DownloadExcel from "../constantscomponents/DownloadExcel";

  const itemsPerPageOptions = [5, 10, 20, "All"];

  const CustomTable = ({
    tableHeaders = [],
    tableData = [],
    exportTableData = null,
    showSearch = true,
    showRefresh = true,
    showDownload = true,
    showPagination = true,
    showSorting = true,
    selectedRow,
    setSelectedRow
  }) => {
    const [search, setSearch] = useState("");
    const [perPage, setPerPage] = useState(5);
    const [page, setPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
    const tableRef = useRef();


    const requestSort = (key) => {
      let direction = "asc";
      if (sortConfig.key === key && sortConfig.direction === "asc") {
        direction = "desc";
      }
      setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => (
      <Icons.ArrowDownUp className="inline w-4 h-4 ml-4 text-gray-600" />
    );

    const filteredData = tableData.filter((item) => {
      const searchLower = search.toLowerCase().trim();
      return Object.values(item).some((value) =>
        String(value).toLowerCase().includes(searchLower)
      );
    });

    const sortedData = [...filteredData].sort((a, b) => {
      if (showSorting && sortConfig.key) {
        const aVal = a[sortConfig.key] || "";
        const bVal = b[sortConfig.key] || "";
        return sortConfig.direction === "asc"
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      }

      return new Date(a.createdAt) - new Date(b.createdAt);
    });

    const totalPages =
      perPage === "All" ? 1 : Math.ceil(sortedData.length / perPage);
    const paginatedData =
      perPage === "All"
        ? sortedData
        : sortedData.slice((page - 1) * perPage, page * perPage);

    useEffect(() => {
      if (page > totalPages) setPage(1);
    }, [filteredData, perPage]);

    return (
      <div className="space-y-4">
        {/* Top Bar */}
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between w-full">
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full">
            {showSearch && (
              <input
                type="text"
                placeholder="Search"
                className="border rounded border-gray-300 px-3 py-1 w-full sm:w-60"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            {showRefresh && (
              <button
                className="border py-2 px-3 rounded cursor-pointer border-gray-300"
                onClick={() => window.location.reload()}
                title="Reload"
              >
                <Icons.RefreshCcw size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div
          ref={tableRef}
          className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
        >
          <table className="w-full min-w-[700px] border border-gray-200 text-xs sm:text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                {tableHeaders.map((col, i) => (
                  <th
                    key={col.key}
                    onClick={() => showSorting && col.key && requestSort(col.key)}
                    className={`px-2 py-3 text-left align-middle whitespace-nowrap ${showSorting && col.key
                      ? "cursor-pointer bg-[#e7eff0] text-dark transition"
                      : ""
                      }`}
                  >
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      {col.label}
                      {showSorting && col.key && getSortIcon(col.key)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item, rowIdx) => (
                // <tr
                //   key={rowIdx}
                //   className="odd:bg-gray-50 even:bg-[#EDEDED] border-b border-gray-300 hover:bg-[#CFE2FF] transition"
                // >
                <tr
                key={item._id || rowIdx}
                onClick={
                  setSelectedRow
                    ? () =>
                        setSelectedRow(selectedRow === item._id ? null : item._id)
                    : undefined
                }
                className={`border-b border-gray-300 hover:bg-[#CFE2FF] transition ${
                  setSelectedRow ? "cursor-pointer " : ""
                } ${
                  setSelectedRow && selectedRow === item._id
                    ? "bg-[#CFE2FF] text-white"
                    : rowIdx % 2 === 0
                    ? "bg-gray-50"
                    : "bg-[#EDEDED]"
                }`}
              >
              
                  {tableHeaders.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className="px-2 py-2 text-sm text-gray-700 text-left align-middle break-words"
                    >
                      {item[col.key] ?? "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-4 text-sm w-full">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-start sm:items-center w-full sm:w-auto">
            <div className="btn btn-outline w-full sm:w-auto text-center">
              Total Records: {filteredData.length}
            </div>
            {showDownload && (
              <div className="w-full sm:w-auto">
                <DownloadExcel
                  tableData={exportTableData || tableData}
                  tableHeaders={tableHeaders}
                />

              </div>
            )}

          </div>

          {showPagination && (
            <div className="flex flex-wrap sm:flex-nowrap gap-2 items-center w-full sm:w-auto">
              <button
                className="btn btn-reset"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                <Icons.SkipBack size={16} />
              </button>

              <input
                type="number"
                value={page}
                onChange={(e) => {
                  const newPage = Number(e.target.value);
                  if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
                }}
                className="border w-16 text-center py-1 px-2 rounded border-gray-300"
              />
              <span className="text-gray-600">of {totalPages}</span>

              <button
                className="btn btn-reset"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                <Icons.SkipForward size={16} />
              </button>

              <select
                className="border py-1 px-3 rounded border-gray-300"
                value={perPage}
                onChange={(e) => {
                  const value =
                    e.target.value === "All" ? "All" : Number(e.target.value);
                  setPerPage(value);
                }}
              >
                {itemsPerPageOptions.map((item, i) => (
                  <option key={i} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    );
  };

  export default CustomTable;
