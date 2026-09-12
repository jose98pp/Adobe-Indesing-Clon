import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { NewspaperProject } from '../types';

export interface PdfExportOptions {
  dpi?: number;
  includeBleedMarks?: boolean;
  colorProfile?: 'rgb' | 'grayscale';
  quality?: number;
}

export async function exportNewspaperToPdf(
  elementId: string,
  project: NewspaperProject,
  options: PdfExportOptions = {}
): Promise<void> {
  const {
    dpi = 2,
    includeBleedMarks = false,
    colorProfile = 'rgb',
    quality = 0.95
  } = options;

  const targetElement = document.getElementById(elementId);
  if (!targetElement) {
    throw new Error('No se encontró el lienzo para exportar.');
  }

  // Calculate dimensions in millimeters
  let pdfWidthMm = 289;
  let pdfHeightMm = 380;
  let orientation: 'p' | 'l' = 'p';

  if (project.format === 'broadsheet') {
    pdfWidthMm = 350;
    pdfHeightMm = 500;
  } else if (project.format === 'tabloid') {
    pdfWidthMm = 280;
    pdfHeightMm = 410;
  } else {
    // Compact A4
    pdfWidthMm = 210;
    pdfHeightMm = 297;
  }

  // Render canvas with high resolution scale
  const canvas = await html2canvas(targetElement, {
    scale: Math.max(2, dpi),
    useCORS: true,
    logging: false,
    allowTaint: true,
    backgroundColor: project.backgroundColor || '#ffffff',
    windowWidth: targetElement.scrollWidth,
    windowHeight: targetElement.scrollHeight
  });

  // Apply grayscale filter to canvas if requested
  if (colorProfile === 'grayscale') {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const avg = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        data[i] = avg;
        data[i + 1] = avg;
        data[i + 2] = avg;
      }
      ctx.putImageData(imgData, 0, 0);
    }
  }

  const imgData = canvas.toDataURL('image/jpeg', quality);

  // Initialize jsPDF with custom page size matching the newspaper proportions
  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: [pdfWidthMm, pdfHeightMm]
  });

  const marginMm = includeBleedMarks ? 5 : 0;
  const printWidth = pdfWidthMm - marginMm * 2;
  const printHeight = pdfHeightMm - marginMm * 2;

  pdf.addImage(imgData, 'JPEG', marginMm, marginMm, printWidth, printHeight);

  // Draw professional crop / registration marks if enabled
  if (includeBleedMarks) {
    pdf.setDrawColor(80, 80, 80);
    pdf.setLineWidth(0.2);

    // Top-left crop marks
    pdf.line(marginMm, 1, marginMm, 4);
    pdf.line(1, marginMm, 4, marginMm);

    // Top-right crop marks
    pdf.line(pdfWidthMm - marginMm, 1, pdfWidthMm - marginMm, 4);
    pdf.line(pdfWidthMm - 4, marginMm, pdfWidthMm - 1, marginMm);

    // Bottom-left crop marks
    pdf.line(marginMm, pdfHeightMm - 4, marginMm, pdfHeightMm - 1);
    pdf.line(1, pdfHeightMm - marginMm, 4, pdfHeightMm - marginMm);

    // Bottom-right crop marks
    pdf.line(pdfWidthMm - marginMm, pdfHeightMm - 4, pdfWidthMm - marginMm, pdfHeightMm - 1);
    pdf.line(pdfWidthMm - 4, pdfHeightMm - marginMm, pdfWidthMm - 1, pdfHeightMm - marginMm);

    // Header metadata slug line
    pdf.setFontSize(7);
    pdf.setTextColor(100, 100, 100);
    pdf.text(
      `PrensaStudio Editorial | ${project.title} | ${project.publicationDate || ''} | ${new Date().toLocaleTimeString()} | Impresión Offset`,
      marginMm,
      3.5
    );
  }

  const sanitizedTitle = (project.title || 'Periodico_Digital')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .substring(0, 40);

  pdf.save(`${sanitizedTitle}_Edicion_Prensa.pdf`);
}
