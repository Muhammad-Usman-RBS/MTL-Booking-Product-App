import html2pdf from "html2pdf.js";
import { toast } from "react-toastify";

export const downloadPDF = (elementId, filename = "statement.pdf") => {
  const element = document.getElementById(elementId);
  if (!element) {
    toast.error("Invoice element not found!");
    return;
  }

  try {
    html2pdf()
      .set({
        margin: 0.5,
        filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      })
      .from(element)
      .save()
      .then(() => {
        toast.success("PDF downloaded successfully!");
      });
  } catch (err) {
    toast.error("Failed to generate PDF.");
    console.error("PDF generation error:", err);
  }
};
