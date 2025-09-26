import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { rowData } from "../constant/rowData";
import { DownloadCSV, fetchUpdateShopifyData, fetchVariants } from "../services/variantService";
import { CustomCheckbox } from "./CustomCheckbox";


const CustomTable = ({ searchQuery, filters, nowLoad }) => {
  const [rows, setRows] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedRows, setSelectedRows] = useState([]);
  const [summaryTotals, setSummaryTotals] = useState({});
  const [selectionMode, setSelectionMode] = useState("page");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(localStorage.getItem('resultPerPage') ? localStorage.getItem('resultPerPage') : 50);


  const tableRef = useRef();

  const {
    vendor = [],
    brand = [],
    collection = [],
    is_active,
    date_from,
    date_to,
  } = filters;

  const isLoadingRef = useRef(false);
  const currentRequestRef = useRef(null);


  const last_sync = localStorage.getItem("last_sync")

  const formattedSyncTime = new Date(last_sync).toLocaleString("en-US", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "short",
    day: "numeric",
    // hour: "2-digit",
    // minute: "2-digit",
  });

  const load = async () => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    const requestToken = Date.now();
    currentRequestRef.current = requestToken;

    setLoading(true);
    setError(null);

    try {
      const extra = {};
      if (vendor.length) extra.vendor = vendor;
      if (brand.length) extra.brand = brand;
      if (collection.length) extra.collection = collection;
      if (is_active !== undefined) extra.is_active = is_active;
      if (date_from) extra.date_from = date_from;
      if (date_to) extra.date_to = date_to;

      const shop_id = localStorage.getItem("sb_id");
      const res = await fetchVariants(shop_id, currentPage, rowsPerPage, extra);

      if (currentRequestRef.current !== requestToken) return;

      const { count, results, totals } = res.data;
      setSummaryTotals(totals || {});

      const mapped = results?.map((v) => ({
        name: v.variant_detail_name,
        name2: v.title,
        sku: v.sku ?? '—',
        barcode: v.product_detail.raw_data.variants.edges[0].node.barcode ?? '—',
        stock: v.inventory_quantity,
        sale7: v.total_orders.last_7_days,
        sale30: v.total_orders.last_30_days,
        sale60: v.total_orders.last_60_days,
        sale90: v.total_orders.last_90_days,
        sale120: v.total_orders.last_120_days ?? 0,
        sale180: v.total_orders.last_180_days,
        sale365: v.total_orders.last_365_days,
        onOrder: v.total_orders.in_progress,
      }));

      setRows(mapped);
      setTotalCount(count);
    } catch (err) {
      console.error(err);
      setError('Failed to load variants');
    } finally {
      isLoadingRef.current = false;
      setLoading(false);
    }
  };


  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const isSelected = (sku) => selectedRows.includes(sku);

  const toggleRow = (sku) => {
    setSelectedRows((prev) =>
      prev.includes(sku) ? prev.filter((id) => id !== sku) : [...prev, sku]
    );
  };

  const toggleSelectAll = () => {
    if (selectedRows.length === filteredRows.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredRows.map((r) => r.sku));
    }
  };

  useEffect(() => {
    load();
    setSelectedRows([]);
  }, [currentPage, rowsPerPage, filters, nowLoad]);

  const refreshData = async () => {
    const shop = localStorage.getItem("sb_shop")
    const dataUpdated = await fetchUpdateShopifyData(shop);
    localStorage.setItem("last_sync", dataUpdated.data.store.last_sync)
    await load();
  }

  const filteredRows = rows?.filter(
    (row) =>
      row.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.barcode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(totalCount / rowsPerPage);

  const handleDownloadCSV = async () => {
    const shop_id = localStorage.getItem("sb_id")
    const dataUpdated = await DownloadCSV(shop_id);

    const blob = new Blob([dataUpdated.data], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;

    const disposition = dataUpdated.headers["content-disposition"];
    let filename = "Product_Vairant.csv";
    if (disposition && disposition.indexOf("filename=") !== -1) {
      filename = disposition
        .split("filename=")[1]
        .replace(/['"]/g, "")
        .trim();
    }

    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const displayedRows = filteredRows.map((row, i) => (
    <div
      key={i}
      className="min-w-[900px] flex flex-row items-start gap-4 rounded-xl mb-2 shadow px-4 py-2 md:px-6 bg-white hover:bg-gray-100 overflow-x-auto"
    >
      {/* Name/Checkbox column */}
      <div className="w-[250px] lg:w-[700px] flex gap-3 items-start">
        <CustomCheckbox
          checked={isSelected(row.sku)}
          onChange={() => toggleRow(row.sku)}
        />
        <div className="flex-1">
          <div className="relative inline-block group">
            <div className="text-black text-xs font-bold w-[16rem] truncate">
              {row.name}
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-max px-2 py-1 bg-black text-white text-sm rounded hidden group-hover:block z-50">
              {row.name}
            </div>
          </div>
  
          <div className="relative inline-block group">
            <div className="text-black text-xs font-bold w-[16rem] truncate">
              {row.name2}
            </div>
            <div className="absolute bottom-full mb-1 w-max max-w-xs whitespace-normal bg-gray-800 text-white text-[10px] px-2 py-1 rounded shadow-lg opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 z-1000">
              {row.name2}
            </div>
          </div>
  
          <div className="text-xs text-black mt-1">
            <span>SKU: </span>
            <span className="text-black me-1 font-bold">{row.sku}</span>
            <span>UPC: </span>
            <span className="text-black font-bold">{row.barcode}</span>
          </div>
        </div>
      </div>
  
      {/* Data columns */}
      <div className="flex-1 min-w-[100px] text-right text-[#000000]">{row.stock}</div>
      <div className="flex-1 min-w-[100px] text-right text-[#000000]">{row.sale7}</div>
      <div className="flex-1 min-w-[100px] text-right text-[#000000] font-medium">{row.sale30}</div>
      <div className="flex-1 min-w-[100px] text-right text-[#000000]">{row.sale60}</div>
      <div className="flex-1 min-w-[100px] text-right text-[#000000]">{row.sale90}</div>
      <div className="flex-1 min-w-[100px] text-right text-[#000000]">{row.sale120}</div>
      <div className="flex-1 min-w-[100px] text-right text-[#000000]">{row.sale180}</div>
      <div className="flex-1 min-w-[100px] text-right text-[#000000]">{row.sale365}</div>
    </div>
  ));
  

  if (!loading && !error && rows.length === 0) {
    return (
      <>
        <div className="p-6 text-center text-[var(--dark-gray)]">
          For now there is no record available for your store — please reload after 20 mins!
        </div>
        {/* <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-6 px-4 w-full">
          <div className="flex flex-row gap-2">
            <button
              onClick={refreshData}
              className="flex items-center gap-2 bg-[#CFFF04] text-md font-bold text-black px-4 py-2.5 rounded-xl w-full md:w-auto"
            >
              Refresh Data
            </button>
          </div>
        </div> */}
      </>
    );
  }

  return (
    <>
      <div className=" w-full overflow-x-auto" ref={tableRef}>
        <div>
        <div
  className="overflow-x-auto w-full"
  style={{
    background: "var(--background-neutral, rgba(244, 246, 248, 1))",
    boxShadow: "0px 4px 8px 0px rgba(145, 158, 171, 0.16)",
  }}
>
  <div className="min-w-[900px] flex items-start gap-4 text-[#637381] font-semibold text-sm px-6 py-4 rounded-md">
    <div className=" flex gap-3 items-center">
      <div className="flex justify-center item-center">
        <CustomCheckbox
          checked={
            filteredRows.length > 0 && selectedRows.length === filteredRows.length
          }
          onChange={toggleSelectAll}
        />
        {selectedRows.length > 0 && (
          <div className="px-4 text-sm font-medium text-gray-700">
            {selectedRows.length} Selected
          </div>
        )}

        {selectedRows.length > 0 && (
          <select
            onChange={(e) => {
              const option = e.target.value;
              if (option === "page") {
                setSelectedRows(filteredRows.map((r) => r.sku));
                setSelectionMode("page");
              } else if (option === "all") {
                setSelectedRows(rows.map((r) => r.sku));
                setSelectionMode("all");
              } else if (option === "clear") {
                setSelectedRows([]);
                setSelectionMode("clear");
              }
            }}
            className="text-xs px-3 py-1 rounded-xl border border-[#CFFF04] bg-white text-gray-700 shadow-sm focus:ring-2 focus:ring-[#CFFF04] focus:outline-none"
            defaultValue=""
            value={selectionMode}
          >
            <option value="" disabled>Select Option</option>
            <option value="page">Select Paginated Records</option>
            <option value="all">Select All in This Store</option>
            <option value="clear">Clear Selection</option>
          </select>
        )}
      </div>

      <div
        className="w-[250px] lg:w-auto truncate text-[#606870] text-md"
        style={{ fontWeight: "700" }}
      >
        Name
      </div>
    </div>

    {["Stock", "7 Days", "30 Days", "60 Days", "90 Days", "120 Days", "180 Days", "365 Days"].map((label, idx) => (
      <div
        key={idx}
        className="flex-1 min-w-[100px] text-right truncate text-[#606870] text-md"
        style={{ fontWeight: "700" }}
      >
        {label}
      </div>
    ))}
  </div>
</div>

          <div className="flex flex-col gap-2 mt-4 w-full">{displayedRows}</div>
        </div>
      </div>
      <div className="w-full overflow-x-auto">
  <div className="min-w-[900px] flex flex-row flex-wrap items-start gap-4 mt-4 px-6 py-2 bg-[#F4F6F8] font-bold text-black sticky bottom-[75px] z-20">
    <div className="w-[250px] pl-6 lg:w-auto">Totals</div>
    <div className="flex-1 text-right">{summaryTotals?.total_stock ?? 0}</div>
    <div className="flex-1 text-right">{summaryTotals?.orders?.last_7_days ?? 0}</div>
    <div className="flex-1 text-right">{summaryTotals?.orders?.last_30_days ?? 0}</div>
    <div className="flex-1 text-right">{summaryTotals?.orders?.last_60_days ?? 0}</div>
    <div className="flex-1 text-right">{summaryTotals?.orders?.last_90_days ?? 0}</div>
    <div className="flex-1 text-right">{summaryTotals?.orders?.last_120_days ?? 0}</div>
    <div className="flex-1 text-right">{summaryTotals?.orders?.last_180_days ?? 0}</div>
    <div className="flex-1 text-right">{summaryTotals?.orders?.last_365_days ?? 0}</div>
  </div>
</div>

      {/* <div className="md:fixed bottom-0 left-0 w-full z-[999] bg-white border-t shadow px-4 py-2">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-6 px-4 w-full">
          <div className="flex flex-col md:flex-row justify-between items-start gap-2">
            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-2 mb-2 bg-[#CFFF04] text-md font-bold text-black px-4 py-2.5 rounded-xl w-full md:w-auto"
            >
              Export Data
              <svg
                width="20"
                height="20"
                viewBox="0 0 25 25"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12.8161 15.0101V5.01013M12.8161 15.0101C12.1159 15.0101 10.8076 13.0158 10.3161 12.5101M12.8161 15.0101C13.5163 15.0101 14.8246 13.0158 15.3161 12.5101"
                  stroke="black"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M20.8161 17.0101C20.8161 19.4921 20.2981 20.0101 17.8161 20.0101H7.81606C5.33406 20.0101 4.81606 19.4921 4.81606 17.0101"
                  stroke="black"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              onClick={refreshData}
              className="flex items-center gap-2 mb-2 bg-[#CFFF04] text-md font-bold text-black px-4 py-2.5 rounded-xl w-full md:w-auto"
            >
              <RefreshCw
                size={16}
                color="#000000"
              />

              <span
                className="font-semibold text-sm text-[#000000] px-1"
              >
                Sync Data ({formattedSyncTime})
              </span>
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[#637381]">
              Results per page:
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                  localStorage.setItem('resultPerPage', Number(e.target.value));
                }}
                className="border border-[#CFFF04] px-3 py-1 rounded"
              >
                {[25, 50, 100, 250, 500].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 border rounded"
            >
              <ChevronLeft size={20} />
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx + 1)}
                className={`w-8 h-8 rounded border text-sm font-semibold ${currentPage === idx + 1
                  ? 'border-[#000000] text-[#000000]'
                  : 'border-[var(--light-gray)] text-[#637381]'
                  }`}
              >
                {idx + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 border rounded"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div> */}
    </>
  );
};

export default CustomTable;
