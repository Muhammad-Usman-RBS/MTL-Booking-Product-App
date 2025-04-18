import React from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Icons from "../../assets/icons";

const DownloadPDF = ({ targetRef }) => {
  const handleDownload = async () => {
    if (!targetRef.current) return;

    const table = targetRef.current;

    // Save original scroll position and style
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const originalStyle = table.getAttribute("style") || "";

    // Expand table for rendering
    table.style.width = "max-content";
    table.style.minWidth = "100%";
    table.style.color = "#000";
    table.style.backgroundColor = "#fff";

    // Hide the last column ("Actions")
    const rows = table.querySelectorAll("tr");
    const hiddenCells = [];

    rows.forEach((row) => {
      const cells = row.querySelectorAll("td, th");
      const lastCell = cells[cells.length - 1];
      if (lastCell) {
        hiddenCells.push(lastCell);
        lastCell.style.display = "none";
      }
    });

    // Apply uniform style
    const elements = table.querySelectorAll("*");
    elements.forEach((el) => {
      el.style.color = "#000";
      el.style.backgroundColor = "#fff";
      el.style.borderColor = "#ccc";
    });

    // Capture screenshot
    const canvas = await html2canvas(table, {
      scale: 3,
      useCORS: true,
      scrollX: 0,
      scrollY: -scrollY,
      windowWidth: document.body.scrollWidth,
    });

    // Restore styles
    hiddenCells.forEach((cell) => (cell.style.display = ""));
    table.setAttribute("style", originalStyle);
    window.scrollTo(scrollX, scrollY);

    // Generate PDF
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
