import html2pdf from "html2pdf.js";
import { toast } from "react-toastify";

export const downloadPDF = (elementId, filename = "statement.pdf") => {
  const element = document.getElementById(elementId);
  if (!element) {
    toast.error("Invoice element not found!");
    return;
  }

  const images = element.getElementsByTagName("img");
  const loadImages = Array.from(images).map(
    (img) =>
      new Promise((resolve) => {
        if (img.complete) resolve();
        else {
          img.onload = resolve;
          img.onerror = resolve;
        }
      })
  );

  Promise.all(loadImages).then(() => {
    try {
      html2pdf()
        .set({
          margin: [10, 10, 10, 10], // top, left, bottom, right in mm
          filename,
          pagebreak: {
            mode: ["avoid-all", "css", "legacy"],
            before: ".break-before",
            after: ".break-after",
            avoid: ".avoid-break",
          },
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 3,
            useCORS: true,
            logging: false,
            scrollX: 0,
            scrollY: 0,
            windowWidth: element.scrollWidth,
            windowHeight: element.scrollHeight,
            backgroundColor: "#fff",
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
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
  });
};