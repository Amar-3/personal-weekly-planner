import jsPDF from "jspdf";

export function downloadPDF() {
    const doc = new jsPDF("p", "pt", "a4");
    doc.html(document.querySelector(".card"), {
      callback: function (pdf) {
        pdf.save(`tracker.pdf`); // to be modified with ceek nomenclature
      },
      margin: [20, 20, 20, 20],
      autoPaging: "text",
      x: 10,
      y: 10,
      width: 550, // fit to A4
      windowWidth: document.body.scrollWidth,
    });
  }
