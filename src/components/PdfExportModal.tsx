import React, { useState } from 'react';
import { NewspaperProject } from '../types';
import { exportNewspaperToPdf, PdfExportResult } from '../utils/pdfExport';
import { 
  FileDown, 
  Printer, 
  X, 
  Check, 
  Loader2, 
  Scissors, 
  Palette,
  Layers,
  ExternalLink,
  RotateCcw,
  AlertTriangle
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
  const [exportResult, setExportResult] = useState<PdfExportResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusStep, setStatusStep] = useState<string>('');

  if (!isOpen) return null;

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setErrorMessage(null);
      setExportResult(null);

      setStatusStep('Preparando tipografías y pliego editorial...');
      await new Promise(r => setTimeout(r, 100));

      setStatusStep('Vectorizando maquetación a alta resolución...');
      const result = await exportNewspaperToPdf('newspaper-artboard', project, {
        dpi: dpiQuality,
        includeBleedMarks,
        colorProfile,
        quality: 0.96
      });

      setStatusStep('¡PDF generado con éxito!');
      setExportResult(result);
      setIsExporting(false);
    } catch (err: any) {
      console.error('Error generating PDF:', err);
      setErrorMessage(err?.message || 'Error al compilar el PDF de imprenta.');
      setIsExporting(false);
    }
  };

  const handleReset = () => {
    setExportResult(null);
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none animate-in fade-in duration-150">
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
          {/* SUCCESS SCREEN */}
          {exportResult ? (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">¡PDF Compilado con Éxito!</h3>
                <p className="text-xs text-neutral-300 mb-2">
                  El pliego editorial ha sido procesado y el archivo ya está disponible.
                </p>
                <div className="text-[11px] font-mono text-emerald-400 bg-black/40 px-2.5 py-1 rounded border border-emerald-500/20 max-w-full truncate">
                  {exportResult.filename}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <a
                  href={exportResult.blobUrl}
                  download={exportResult.filename}
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Descargar Archivo PDF</span>
                </a>

                <a
                  href={exportResult.blobUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg bg-[#2a2a32] hover:bg-[#34343e] text-neutral-200 text-xs font-medium border border-[#3c3c4a] transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                  <span>Abrir PDF en Nueva Pestaña (Visor / Imprimir)</span>
                </a>

                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center justify-center gap-1.5 w-full py-1.5 text-[11px] text-neutral-400 hover:text-white transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Volver a las opciones de exportación</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Error Box if any */}
              {errorMessage && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold text-red-200">Error durante la exportación:</p>
                    <p className="text-[11px] text-red-300">{errorMessage}</p>
                    <p className="text-[10px] text-neutral-400 mt-1">
                      Sugerencia: Puedes probar seleccionando Calidad Prensa Estándar (200 DPI).
                    </p>
                  </div>
                </div>
              )}

              {/* Format preview summary */}
              <div className="p-3 bg-[#26262e] rounded-lg border border-[#32323e] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-neutral-300">
                  <Layers className="w-4 h-4 text-sky-400" />
                  <span>Formato del pliego:</span>
                </div>
                <span className="font-mono text-sky-300 font-semibold uppercase">
                  {project.format} ({project.width}x{project.height}px)
                </span>
              </div>

              {/* Resolution selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                  <Printer className="w-3.5 h-3.5 text-neutral-400" />
                  Resolución de Salida
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDpiQuality(2)}
                    disabled={isExporting}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border text-left transition-all ${
                      dpiQuality === 2
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                        : 'bg-[#26262e] border-[#373744] text-neutral-400 hover:text-neutral-200 hover:bg-[#2c2c36]'
                    }`}
                  >
                    <div className="font-semibold text-white">200 DPI (Recomendado)</div>
                    <div className="text-[10px] opacity-75">Óptimo para pruebas y digital</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDpiQuality(3)}
                    disabled={isExporting}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border text-left transition-all ${
                      dpiQuality === 3
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                        : 'bg-[#26262e] border-[#373744] text-neutral-400 hover:text-neutral-200 hover:bg-[#2c2c36]'
                    }`}
                  >
                    <div className="font-semibold text-white">300 DPI (Offset)</div>
                    <div className="text-[10px] opacity-75">Máxima nitidez editorial</div>
                  </button>
                </div>
              </div>

              {/* Color Profile */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-neutral-400" />
                  Perfil de Color
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setColorProfile('rgb')}
                    disabled={isExporting}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border text-left transition-all ${
                      colorProfile === 'rgb'
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                        : 'bg-[#26262e] border-[#373744] text-neutral-400 hover:text-neutral-200 hover:bg-[#2c2c36]'
                    }`}
                  >
                    <div className="font-semibold text-white">Todo Color (RGB)</div>
                    <div className="text-[10px] opacity-75">Colores originales íntegros</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setColorProfile('grayscale')}
                    disabled={isExporting}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border text-left transition-all ${
                      colorProfile === 'grayscale'
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                        : 'bg-[#26262e] border-[#373744] text-neutral-400 hover:text-neutral-200 hover:bg-[#2c2c36]'
                    }`}
                  >
                    <div className="font-semibold text-white">Blanco y Negro</div>
                    <div className="text-[10px] opacity-75">Escala de grises rotativa</div>
                  </button>
                </div>
              </div>

              {/* Bleed & Crop Marks */}
              <div className="p-3 bg-[#26262e] rounded-lg border border-[#32323e]">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeBleedMarks}
                    disabled={isExporting}
                    onChange={(e) => setIncludeBleedMarks(e.target.checked)}
                    className="mt-0.5 rounded border-[#454555] bg-[#18181b] text-blue-600 focus:ring-0 focus:ring-offset-0"
                  />
                  <div>
                    <div className="text-xs font-medium text-white flex items-center gap-1.5">
                      <Scissors className="w-3.5 h-3.5 text-neutral-400" />
                      Marcas de corte y registro para imprenta
                    </div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">
                      Añade guías exteriores de corte, sangrado de 3mm y slug de registro.
                    </div>
                  </div>
                </label>
              </div>

              {/* Progress message while exporting */}
              {isExporting && (
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/25 flex items-center gap-2.5 text-xs text-blue-200 animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400 shrink-0" />
                  <span>{statusStep}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        {!exportResult && (
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
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-semibold shadow transition-all disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Procesando PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>Descargar PDF de Imprenta</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
