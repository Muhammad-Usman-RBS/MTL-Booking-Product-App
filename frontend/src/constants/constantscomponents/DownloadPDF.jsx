import React from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Icons from "../../assets/icons";

const DownloadPDF = ({ targetRef }) => {
  const handleDownload = async () => {
    if (!targetRef.current) return;

    const table = targetRef.current;

    // Save original scroll position
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    // Expand the table container width to fit all content
    const originalStyle = table.getAttribute("style") || "";
    table.style.width = "max-content";
    table.style.minWidth = "100%";
    table.style.color = "#000";
    table.style.backgroundColor = "#fff";

    // Hide "Actions" column from all rows
    const rows = table.querySelectorAll("tr");
    const hiddenCells = [];

    rows.forEach((row) => {
      const lastCell = row.lastElementChild;
      if (lastCell) {
        hiddenCells.push(lastCell);
        lastCell.style.display = "none";
      }
    });

    // Ensure consistent styles for all table elements
    const elements = table.querySelectorAll("*");
    elements.forEach((el) => {
      el.style.color = "#000";
      el.style.backgroundColor = "#fff";
      el.style.borderColor = "#ccc";
    });

    // Use html2canvas to capture the table
    const canvas = await html2canvas(table, {
      scale: 3,
      useCORS: true,
      scrollX: 0,
      scrollY: -window.scrollY, // Avoid vertical offset
      windowWidth: document.body.scrollWidth,
    });

    // Restore hidden cells and original styles
    hiddenCells.forEach((cell) => (cell.style.display = ""));
    table.setAttribute("style", originalStyle);
    window.scrollTo(scrollX, scrollY); // Restore scroll

    // Convert to PDF
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("l", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("BookingTable.pdf");
  };

  return (
    <button
      className="btn btn-outline border-gray-300 py-2 px-3 rounded cursor-pointer w-full sm:w-auto"
      onClick={handleDownload}
      title="Download Table as PDF"
    >
      <Icons.Download size={16} className="inline mr-2" />
      Download PDF
    </button>
  );
};

export default DownloadPDF;
