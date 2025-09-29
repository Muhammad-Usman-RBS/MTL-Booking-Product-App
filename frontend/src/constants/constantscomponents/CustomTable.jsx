import React, { useState, useEffect, useRef, useMemo } from "react";
import Icons from "../../assets/icons";
import DownloadExcel from "../constantscomponents/DownloadExcel";

const itemsPerPageOptions = [10, 20, 30, 40, 50, 100, "All"];

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
  setSelectedRow,
  onRowDoubleClick,
  filename,
  emptyMessage = "No Data Found..",
}) => {
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState(() => {
    const saved = localStorage.getItem("customTablePerPage");
    if (saved) {
      return saved === "All" ? "All" : Number(saved);
    }
    return 10;
  });
  const [page, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const tableRef = useRef();
  const persistKey = "customTableColumnOrder";
  const fixedStartCols = ["checkbox"]; // fixed at start
  const fixedEndCols = ["actions"]; // fixed at end
  const defaultOrder = useMemo(() => {
    return tableHeaders
      .map((h) => h.key)
      .filter(
        (key) => !fixedStartCols.includes(key) && !fixedEndCols.includes(key)
      );
  }, [tableHeaders]);
  const [internalOrder, setInternalOrder] = useState(defaultOrder);

  // Local EmptyTableMessage
  const EmptyTableMessage = ({ message, colSpan }) => (
    <tr>
      <td colSpan={colSpan} className="text-center py-3 text-gray-500">
        {message}
      </td>
    </tr>
  );

  useEffect(() => {
    localStorage.setItem("customTablePerPage", perPage);
  }, [perPage]);

  // Load saved order (if any) when component mounts or key changes
  useEffect(() => {
    if (!persistKey) return;
    const saved = localStorage.getItem(persistKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const valid = parsed.filter((k) => defaultOrder.includes(k));
        const missing = defaultOrder.filter((k) => !valid.includes(k));
        setInternalOrder([...valid, ...missing]);
        return;
      } catch { }
    }
    setInternalOrder(defaultOrder);
  }, [persistKey]);

  useEffect(() => {
    setInternalOrder((prev) => {
      const valid = prev.filter((k) => defaultOrder.includes(k));
      const missing = defaultOrder.filter((k) => !valid.includes(k));
      return [...valid, ...missing];
    });
  }, [defaultOrder]);

  // If parent controls order, use it; else internal
  const order = internalOrder;
  const combinedOrder = [
    ...fixedStartCols.filter((key) => tableHeaders.find((h) => h.key === key)),
    ...order,
    ...fixedEndCols.filter((key) => tableHeaders.find((h) => h.key === key)),
  ];

  const dragSrcKeyRef = useRef(null);
  const reorder = (arr, srcKey, targetKey) => {
    const next = [...arr];
    const from = next.indexOf(srcKey);
    const to = next.indexOf(targetKey);
    if (from === -1 || to === -1) return arr;
    next.splice(to, 0, next.splice(from, 1)[0]);
    return next;
  };

  const handleDragStart = (key) => (e) => {
    dragSrcKeyRef.current = key;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", key); // Firefox needs data set
  };

  const handleDragOver = () => (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (targetKey) => (e) => {
    e.preventDefault();
    const srcKey =
      dragSrcKeyRef.current || e.dataTransfer.getData("text/plain");
    if (
      !srcKey ||
      srcKey === targetKey ||
      fixedStartCols.includes(srcKey) ||
      fixedEndCols.includes(srcKey) ||
      fixedStartCols.includes(targetKey) ||
      fixedEndCols.includes(targetKey)
    ) {
      return;
    }
    const newOrder = reorder(order, srcKey, targetKey);
    setInternalOrder(newOrder);

    if (persistKey) {
      localStorage.setItem(persistKey, JSON.stringify(newOrder));
    }
  };

  const headerByKey = (key) => tableHeaders.find((h) => h.key === key);
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => (
    <Icons.ArrowDownUp className="inline w-4 h-4 ml-4 text-[var(--dark-gray)]" />
  );

  const filteredData = tableData.filter((item) => {
    const searchLower = search.toLowerCase().trim();
    return Object.values(item).some((value) =>
      String(value).toLowerCase().includes(searchLower)
    );
  });

  // REPLACE the sortedData section in CustomTable.jsx with this improved version:

  const sortedData = [...filteredData].sort((a, b) => {
    if (showSorting && sortConfig.key) {
      const aVal = a[sortConfig.key] || "";
      const bVal = b[sortConfig.key] || "";
      return sortConfig.direction === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    }

    const getBookingDateTime = (item) => {
      if (item.date && item.date !== "-") {
        try {
          const dateStr =
            typeof item.date === "string" ? item.date : String(item.date);

          const parts = dateStr.split(", ");
          if (parts.length === 2) {
            const [datePart, timePart] = parts;
            const [day, month, year] = datePart.split("/");
            const isoString = `${year}-${month.padStart(2, "0")}-${day.padStart(
              2,
              "0"
            )}T${timePart}`;
            const parsedDate = new Date(isoString);
            if (!isNaN(parsedDate.getTime())) {
              return parsedDate;
            }
          }
          const fallbackDate = new Date(dateStr);
          if (!isNaN(fallbackDate.getTime())) {
            return fallbackDate;
          }
        } catch (error) {
          console.warn("Date parsing failed:", error, item.date);
        }
      }
      return new Date(item.createdAt || 0);
    };

    const dateA = getBookingDateTime(a);
    const dateB = getBookingDateTime(b);

    return dateA - dateB;
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
              className="border rounded border-[var(--light-gray)] px-3 py-1 w-full sm:w-60"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          )}
          {showRefresh && (
            <button
              className="icon-box icon-box-outline"
              onClick={() => window.location.reload()}
              title="Reload"
            >
              <Icons.RefreshCcw size={16} />
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2  w-full sm:w-auto">
          {showPagination && (
            <div className="flex flex-wrap sm:flex-nowrap gap-2 items-center w-full sm:w-auto ">
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
                className="border w-16 text-center py-1 px-2 rounded border-[var(--light-gray)]"
              />
              <span className="text-[var(--dark-gray)] whitespace-nowrap">
                of {totalPages}
              </span>

              <button
                className="btn btn-reset"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                <Icons.SkipForward size={16} />
              </button>

              <select
                className="border py-1 px-3 rounded border-[var(--light-gray)]"
                value={perPage.toString()}
                onChange={(e) => {
                  const value =
                    e.target.value === "All" ? "All" : Number(e.target.value);
                  setPerPage(value);
                  setPage(1);
                }}
              >
                {itemsPerPageOptions.map((item, i) => (
                  <option key={i} value={item.toString()}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
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
            <tr className="bg-[#e7eff0]">
              {combinedOrder
                .map(headerByKey)
                .filter(Boolean)
                .map((col) => (
                  <th
                    key={col.key}
                    draggable={
                      !fixedStartCols.includes(col.key) &&
                      !fixedEndCols.includes(col.key)
                    }
                    onDragStart={
                      !fixedStartCols.includes(col.key) &&
                        !fixedEndCols.includes(col.key)
                        ? handleDragStart(col.key)
                        : undefined
                    }
                    onDragOver={
                      !fixedStartCols.includes(col.key) &&
                        !fixedEndCols.includes(col.key)
                        ? handleDragOver(col.key)
                        : undefined
                    }
                    onDrop={
                      !fixedStartCols.includes(col.key) &&
                        !fixedEndCols.includes(col.key)
                        ? handleDrop(col.key)
                        : undefined
                    }
                    onClick={() =>
                      showSorting &&
                        col.key &&
                        !fixedStartCols.includes(col.key) &&
                        !fixedEndCols.includes(col.key)
                        ? requestSort(col.key)
                        : undefined
                    }
                    className={`px-2 py-3 text-left align-middle whitespace-nowrap ${showSorting &&
                      col.key &&
                      !fixedStartCols.includes(col.key) &&
                      !fixedEndCols.includes(col.key)
                      ? "cursor-pointer text-dark transition"
                      : "cursor-default"
                      }`}
                      title={col.label}

                  >
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      {col.label}
                      {showSorting &&
                        col.key &&
                        !fixedStartCols.includes(col.key) &&
                        !fixedEndCols.includes(col.key) &&
                        getSortIcon(col.key)}
                    </div>
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0  ? (
              <EmptyTableMessage message={emptyMessage} colSpan={combinedOrder.length} />
            ) : (
              paginatedData.map((item, rowIdx) => (
                <tr
                  key={item._id || rowIdx}
                  onClick={
                    setSelectedRow
                      ? () =>
                        setSelectedRow(
                          selectedRow === item._id ? null : item._id
                        )
                      : undefined
                  }
                  onDoubleClick={() => onRowDoubleClick?.(item)}
                  className={`border-b border-[var(--light-gray)] hover:bg-[#CFE2FF] transition ${setSelectedRow ? "cursor-pointer " : ""
                    } ${setSelectedRow && selectedRow === item._id
                      ? "bg-[#CFE2FF] text-white"
                      : rowIdx % 2 === 0
                        ? "bg-gray-50"
                        : "bg-[#EDEDED]"
                    }`}
                >
                  {combinedOrder
                    .map(headerByKey)
                    .filter(Boolean)
                    .map((col, colIdx) => (
                      <td
                        key={colIdx}
                        className="px-2 py-2 text-sm text-gray-700 text-left align-middle break-words"
                      >
                        {item[col.key] ?? "-"}
                      </td>
                    ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom Bar */}
      <div className="flex justify-end gap-2 sm:gap-3 items-center w-full">
        {showDownload && (
          <div>
            <DownloadExcel
              tableData={exportTableData || tableData}
              tableHeaders={tableHeaders}
              filename={filename}
            />
          </div>
        )}
        <div className="btn btn-outline text-center">
          Total Records: {filteredData.filter(item => !item.customRow).length}
        </div>
      </div>
    </div>
  );
};

export default CustomTable;
