import React, { useState } from 'react';
import { NewspaperProject } from '../types';
import { exportNewspaperToPdf } from '../utils/pdfExport';
import { 
  FileDown, 
  Printer, 
  X, 
  Check, 
  Loader2, 
  Scissors, 
  Palette,
  Layers
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  project: NewspaperProject;
}

export const PdfExportModal: React.FC<Props> = ({ isOpen, onClose, project }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [includeBleedMarks, setIncludeBleedMarks] = useState(true);
  const [dpiQuality, setDpiQuality] = useState<number>(2); // 2 = ~200dpi, 3 = ~300dpi
  const [colorProfile, setColorProfile] = useState<'rgb' | 'grayscale'>('rgb');

  if (!isOpen) return null;

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportNewspaperToPdf('newspaper-artboard', project, {
        dpi: dpiQuality,
        includeBleedMarks,
        colorProfile,
        quality: 0.96
      });
      setIsExporting(false);
      onClose();
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Error al generar el PDF de imprenta.');
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none animate-in fade-in duration-150">
      <div className="bg-[#1f1f23] border border-[#373744] rounded-xl shadow-2xl w-full max-w-md overflow-hidden text-neutral-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2d2d34] bg-[#18181b]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-red-500/10 text-red-400">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Exportación a PDF Profesional</h2>
              <p className="text-[11px] text-neutral-400">
                Salida editorial de alta resolución para imprenta offset o digital
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isExporting}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#2d2d34] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Format preview summary */}
          <div className="p-3 bg-[#18181b] rounded-lg border border-[#2d2d34] text-xs space-y-1 font-mono">
            <div className="flex justify-between text-neutral-300">
              <span>Publicación:</span>
              <span className="font-bold text-white truncate max-w-[200px]">{project.title}</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Formato de Pliego:</span>
              <span className="uppercase text-amber-400">{project.format}</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Elementos vectorizados:</span>
              <span>{project.elements.length} objetos</span>
            </div>
          </div>

          {/* Resolution Options */}
          <div className="space-y-1.5">
            <label className="text-xs text-neutral-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Resolución de Salida</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDpiQuality(2)}
                className={`p-2.5 rounded-lg border text-left text-xs transition-colors ${
                  dpiQuality === 2
                    ? 'bg-blue-600/20 border-blue-500 text-white font-semibold'
                    : 'bg-[#282830] border-[#373744] text-neutral-400 hover:text-white'
                }`}
              >
                <div className="font-mono">Estándar (200 DPI)</div>
                <div className="text-[10px] text-neutral-400 font-normal mt-0.5">
                  Rápido, ideal para revisión digital y web
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDpiQuality(3)}
                className={`p-2.5 rounded-lg border text-left text-xs transition-colors ${
                  dpiQuality === 3
                    ? 'bg-blue-600/20 border-blue-500 text-white font-semibold'
                    : 'bg-[#282830] border-[#373744] text-neutral-400 hover:text-white'
                }`}
              >
                <div className="font-mono">Imprenta (300 DPI)</div>
                <div className="text-[10px] text-neutral-400 font-normal mt-0.5">
                  Máxima nitidez tipográfica y fotográfica
                </div>
              </button>
            </div>
          </div>

          {/* Color Mode */}
          <div className="space-y-1.5">
            <label className="text-xs text-neutral-300 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-blue-400" />
              <span>Espacio de Color</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setColorProfile('rgb')}
                className={`py-2 px-3 rounded-lg border text-xs font-mono transition-colors ${
                  colorProfile === 'rgb'
                    ? 'bg-blue-600/20 border-blue-500 text-white font-bold'
                    : 'bg-[#282830] border-[#373744] text-neutral-400'
                }`}
              >
                Cuatricromía / Color
              </button>

              <button
                type="button"
                onClick={() => setColorProfile('grayscale')}
                className={`py-2 px-3 rounded-lg border text-xs font-mono transition-colors ${
                  colorProfile === 'grayscale'
                    ? 'bg-blue-600/20 border-blue-500 text-white font-bold'
                    : 'bg-[#282830] border-[#373744] text-neutral-400'
                }`}
              >
                Monocromo Prensa (B/N)
              </button>
            </div>
          </div>

          {/* Bleed & Crop Marks toggle */}
          <div className="pt-1">
            <label className="flex items-center gap-2.5 p-3 rounded-lg bg-[#282830] border border-[#373744] text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={includeBleedMarks}
                onChange={(e) => setIncludeBleedMarks(e.target.checked)}
                className="accent-blue-600 w-4 h-4"
              />
              <div className="flex-1">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Scissors className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Crucetas y Marcas de Corte de Imprenta</span>
                </div>
                <div className="text-[10px] text-neutral-400 mt-0.5">
                  Añade guías exteriores de corte, sangrado de 3mm y slug de registro.
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[#2d2d34] bg-[#18181b]">
          <button
            type="button"
            disabled={isExporting}
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs bg-[#2a2a32] text-neutral-300 hover:bg-[#34343e] transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={isExporting}
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-semibold shadow transition-all"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Generando PDF ({dpiQuality * 100} DPI)...</span>
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                <span>Descargar PDF de Imprenta</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
