import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { NewspaperProject } from '../types';

export interface PdfExportOptions {
  dpi?: number;
  includeBleedMarks?: boolean;
  colorProfile?: 'rgb' | 'grayscale';
  quality?: number;
}

export interface PdfExportResult {
  success: boolean;
  blob: Blob;
  blobUrl: string;
  filename: string;
}

export async function exportNewspaperToPdf(
  elementId: string,
  project: NewspaperProject,
  options: PdfExportOptions = {}
): Promise<PdfExportResult> {
  const {
    dpi = 2,
    includeBleedMarks = false,
    colorProfile = 'rgb',
    quality = 0.95
  } = options;

  const targetElement = document.getElementById(elementId);
  if (!targetElement) {
    throw new Error('No se encontró el lienzo editorial ("#newspaper-artboard") para exportar.');
  }

  // Ensure all custom web fonts (Oswald, Bebas Neue, Playfair, etc.) are loaded before rasterizing
  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // Continue if fonts.ready fails
    }
  }

  // Calculate dimensions in millimeters based on standard editorial formats
  let pdfWidthMm = 289;
  let pdfHeightMm = 380;
  const orientation: 'p' | 'l' = 'p';

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

  // Render canvas with proper scale, CORS safety and clean DOM cloning
  const canvas = await html2canvas(targetElement, {
    scale: Math.max(1.5, dpi),
    useCORS: true,
    allowTaint: false, // Prevents security errors when exporting canvas to dataURL/PDF
    logging: false,
    backgroundColor: project.backgroundColor || '#ffffff',
    width: project.width,
    height: project.height,
    windowWidth: project.width,
    windowHeight: project.height,
    imageTimeout: 15000,
    onclone: (_clonedDoc, clonedElement) => {
      // 1. Reset zoom scale so the artboard renders at 100% natural resolution
      clonedElement.style.transform = 'none';
      clonedElement.style.transformOrigin = 'top left';
      clonedElement.style.margin = '0';
      clonedElement.style.boxShadow = 'none';
      clonedElement.style.width = `${project.width}px`;
      clonedElement.style.height = `${project.height}px`;

      // 2. Remove all editor UI helpers that should NOT appear in final PDF print
      // Remove resize handles
      const handles = clonedElement.querySelectorAll(
        '[class*="cursor-nwse"], [class*="cursor-ns"], [class*="cursor-nesw"], [class*="cursor-ew"]'
      );
      handles.forEach((el) => el.remove());

      // Remove selection rings
      const rings = clonedElement.querySelectorAll(
        '[class*="ring-2"], [class*="ring-1"], [class*="ring-blue"], [class*="ring-amber"]'
      );
      rings.forEach((el) => {
        el.classList.remove('ring-2', 'ring-1', 'ring-blue-600', 'ring-amber-500', 'ring-offset-1', 'hover:ring-1');
      });

      // Remove collaborator badges and locked badges
      const allDivs = clonedElement.querySelectorAll('div');
      allDivs.forEach((div) => {
        const text = div.textContent || '';
        if (text.includes('🔒 Bloqueado') || text.includes('está editando')) {
          div.remove();
        }
      });

      // Remove margin and bleed guidelines
      const guides = clonedElement.querySelectorAll(
        '[title*="Sangre"], [title*="Guía"], [class*="border-purple-400"], [class*="cyan-500"]'
      );
      guides.forEach((el) => el.remove());

      // Remove collaborator cursors
      const cursors = clonedElement.querySelectorAll('[data-cursor="collaborator"]');
      cursors.forEach((el) => el.remove());

      // 3. Ensure all image tags have crossOrigin enabled
      const images = clonedElement.querySelectorAll('img');
      images.forEach((img) => {
        img.crossOrigin = 'anonymous';
      });
    }
  });

  // Apply monochrome / grayscale filter if requested
  if (colorProfile === 'grayscale') {
    try {
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
    } catch (grayscaleError) {
      console.warn('No se pudo aplicar filtro escala de grises en canvas (procediendo en color):', grayscaleError);
    }
  }

  let imgData: string;
  try {
    imgData = canvas.toDataURL('image/jpeg', quality);
  } catch (err) {
    console.warn('Fallback a toDataURL image/png:', err);
    imgData = canvas.toDataURL('image/png');
  }

  // Initialize jsPDF with custom page size matching the newspaper proportions
  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: [pdfWidthMm, pdfHeightMm],
    compress: true
  });

  const marginMm = includeBleedMarks ? 6 : 0;
  const printWidth = pdfWidthMm - marginMm * 2;
  const printHeight = pdfHeightMm - marginMm * 2;

  pdf.addImage(imgData, 'JPEG', marginMm, marginMm, printWidth, printHeight, undefined, 'FAST');

  // Draw professional crop / registration marks if enabled
  if (includeBleedMarks) {
    pdf.setDrawColor(80, 80, 80);
    pdf.setLineWidth(0.2);

    // Top-left crop marks
    pdf.line(marginMm, 1, marginMm, 4.5);
    pdf.line(1, marginMm, 4.5, marginMm);

    // Top-right crop marks
    pdf.line(pdfWidthMm - marginMm, 1, pdfWidthMm - marginMm, 4.5);
    pdf.line(pdfWidthMm - 4.5, marginMm, pdfWidthMm - 1, marginMm);

    // Bottom-left crop marks
    pdf.line(marginMm, pdfHeightMm - 4.5, marginMm, pdfHeightMm - 1);
    pdf.line(1, pdfHeightMm - marginMm, 4.5, pdfHeightMm - marginMm);

    // Bottom-right crop marks
    pdf.line(pdfWidthMm - marginMm, pdfHeightMm - 4.5, pdfWidthMm - marginMm, pdfHeightMm - 1);
    pdf.line(pdfWidthMm - 4.5, pdfHeightMm - marginMm, pdfWidthMm - 1, pdfHeightMm - marginMm);

    // Header metadata slug line (printer color bar / date info)
    pdf.setFontSize(6.5);
    pdf.setTextColor(110, 110, 110);
    pdf.text(
      `PrensaStudio Editorial | ${project.title} | ${project.publicationDate || ''} | ${new Date().toLocaleTimeString()} | Impresión Offset`,
      marginMm,
      4
    );
  }

  const sanitizedTitle = (project.title || 'Periodico_Digital')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .substring(0, 40);

  const filename = `${sanitizedTitle}_Edicion_Prensa.pdf`;

  // Generate output as Blob and create an Object URL
  const pdfBlob = pdf.output('blob');
  const blobUrl = URL.createObjectURL(pdfBlob);

  // Trigger automatic download
  try {
    const downloadLink = document.createElement('a');
    downloadLink.href = blobUrl;
    downloadLink.download = filename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
  } catch (downloadErr) {
    console.warn('Descarga automática directa no disponible en este entorno:', downloadErr);
  }

  return {
    success: true,
    blob: pdfBlob,
    blobUrl,
    filename
  };
}
