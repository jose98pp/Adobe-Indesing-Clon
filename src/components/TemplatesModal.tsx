import React, { useRef, useState } from 'react';
import { TemplatePreset, NewspaperProject, ImageElement } from '../types';
import { TEMPLATES } from '../data/templates';
import { 
  LayoutTemplate, 
  Download, 
  Upload, 
  Copy, 
  X, 
  FileCheck,
  ArrowRight,
  Info,
  FileCode,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentProject: NewspaperProject;
  onLoadTemplate: (template: NewspaperProject) => void;
  onImportCustomTemplate: (imported: NewspaperProject) => void;
}

export const TemplatesModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentProject,
  onLoadTemplate,
  onImportCustomTemplate
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 6000);
  };

  // Export current project as downloadable JSON template or .latitud-template
  const handleExportCurrent = (format: 'json' | 'latitud') => {
    let content = '';
    let filename = '';
    
    if (format === 'latitud') {
      const pkg = {
        schemaVersion: '1.0',
        type: 'latitud-template',
        name: currentProject.title,
        description: 'Plantilla editorial para latitud18.ultimahora-tv.com',
        author: 'Redacción PrensaStudio',
        createdAt: new Date().toISOString(),
        targetDomain: 'latitud18.ultimahora-tv.com',
        project: currentProject
      };
      content = JSON.stringify(pkg, null, 2);
      filename = `${currentProject.title.replace(/\s+/g, '_')}.latitud-template`;
    } else {
      content = JSON.stringify(currentProject, null, 2);
      filename = `Plantilla_${currentProject.title.replace(/\s+/g, '_')}.prensastudio.json`;
    }

    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = url;
    downloadAnchor.download = filename;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);
    showNotification('success', `Archivo descargado: ${filename}`);
  };

  // Export a preset template as downloadable JSON
  const handleExportPreset = (preset: TemplatePreset) => {
    const isLatitud = preset.id.includes('latitud');
    let content = '';
    let filename = '';

    if (isLatitud) {
      const pkg = {
        schemaVersion: '1.0',
        type: 'latitud-template',
        name: preset.name,
        description: preset.description,
        author: 'Latitud 18 / PrensaStudio',
        createdAt: new Date().toISOString(),
        targetDomain: 'latitud18.ultimahora-tv.com',
        project: preset.project
      };
      content = JSON.stringify(pkg, null, 2);
      filename = `${preset.id}.latitud-template`;
    } else {
      content = JSON.stringify(preset.project, null, 2);
      filename = `Plantilla_${preset.id}.prensastudio.json`;
    }

    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = url;
    downloadAnchor.download = filename;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);
    showNotification('success', `Archivo descargado: ${filename}`);
  };

  // Process imported file (JSON, .latitud-template or Image)
  const processFile = (file: File) => {
    const filename = file.name.toLowerCase();

    // 1. Image formats (.png, .jpg, .jpeg, .webp, .svg)
    if (file.type.startsWith('image/') || /\.(png|jpe?g|webp|svg)$/i.test(filename)) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (!dataUrl) return;

        // Create an editable project with the image as a reference backdrop
        const imageElement: ImageElement = {
          id: `img-maqueta-${Date.now()}`,
          type: 'image',
          x: 0,
          y: 0,
          width: currentProject.width,
          height: currentProject.height,
          zIndex: 1,
          url: dataUrl,
          caption: `Maqueta de referencia: ${file.name}`,
          credit: 'Boceto / Maqueta Visual',
          objectFit: 'contain',
          grayscale: false,
          borderWidth: 0,
          borderColor: '#000000',
          aspectRatioLock: true,
          locked: false
        };

        const newProject: NewspaperProject = {
          ...currentProject,
          id: `project-${Date.now()}`,
          title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          elements: [imageElement]
        };

        onImportCustomTemplate(newProject);
        onClose();
      };
      reader.readAsDataURL(file);
      return;
    }

    // 2. Structured formats (.json, .latitud-template)
    if (filename.endsWith('.json') || filename.endsWith('.latitud-template') || file.type.includes('json')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          
          // Handle .latitud-template package
          if (json.type === 'latitud-template' && json.project) {
            onImportCustomTemplate(json.project);
            onClose();
            return;
          }
          
          // Handle standard project format with elements
          if (json && Array.isArray(json.elements)) {
            onImportCustomTemplate(json);
            onClose();
            return;
          }

          // Handle project with pages
          if (json && Array.isArray(json.pages) && json.pages.length > 0 && Array.isArray(json.pages[0].elements)) {
            const reconstructed = {
              ...json,
              elements: json.pages[0].elements
            };
            onImportCustomTemplate(reconstructed);
            onClose();
            return;
          }

          showNotification(
            'error',
            'El archivo JSON no tiene la estructura de maqueta esperada (debe contener la lista de elementos o páginas).'
          );
        } catch {
          showNotification('error', 'El archivo no es un JSON válido. Compruebe su formato de texto.');
        }
      };
      reader.readAsText(file);
      return;
    }

    // 3. Fallback warning for unsupported extensions
    showNotification(
      'error',
      `El archivo "${file.name}" no es compatible. Las maquetas deben ser archivos .json o .latitud-template (maqueta editable) o bien imágenes .png, .jpg o .webp (boceto visual).`
    );
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none animate-in fade-in duration-150">
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`bg-[#1f1f23] border ${
          isDragging ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-[#373744]'
        } rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-neutral-200 transition-all`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2d2d34] bg-[#18181b]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-blue-500/10 text-blue-400">
              <LayoutTemplate className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Catálogo y Gestión de Maquetas</h2>
              <p className="text-[11px] text-neutral-400">
                Abre maquetas prediseñadas, importa tus archivos o descarga la edición abierta en formato reutilizable.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleExportCurrent('latitud')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs hover:bg-amber-500/30 transition-colors font-semibold"
                title="Descarga la maqueta en formato .latitud-template para el CMS"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar .latitud-template</span>
              </button>

              <button
                onClick={() => handleExportCurrent('json')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-xs hover:bg-emerald-600/30 transition-colors font-medium"
                title="Descarga la maqueta abierta como archivo de plantilla JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span>JSON</span>
              </button>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs hover:bg-blue-500 transition-colors font-semibold shadow-xs"
              title="Subir archivo de maqueta (.json, .latitud-template o imagen .png/.jpg)"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Subir Maqueta</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.latitud-template,.png,.jpg,.jpeg,.webp,.svg"
              onChange={handleFileImport}
              className="hidden"
            />

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#2d2d34] transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notification Banner */}
        {notification && (
          <div className={`px-6 py-2.5 text-xs flex items-center gap-2 border-b ${
            notification.type === 'success' 
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              : notification.type === 'error'
              ? 'bg-red-500/15 border-red-500/30 text-red-300'
              : 'bg-blue-500/15 border-blue-500/30 text-blue-300'
          }`}>
            {notification.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
            {notification.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0" />}
            {notification.type === 'info' && <Info className="w-4 h-4 shrink-0" />}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Formats Explanation Banner */}
        <div className="bg-[#18181f] px-6 py-3 border-b border-[#2d2d38] text-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="space-y-1">
              <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-sky-400" />
                ¿En qué formato deben subirse las maquetas?
              </span>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-400">
                <span className="inline-flex items-center gap-1 text-sky-300 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-500/30">
                  <FileCode className="w-3 h-3 text-sky-400" />
                  <strong>.JSON / .latitud-template</strong> (Maqueta 100% editable con capas, textos y fuentes)
                </span>
                <span className="inline-flex items-center gap-1 text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                  <ImageIcon className="w-3 h-3 text-amber-400" />
                  <strong>.PNG / .JPG / .WEBP</strong> (Boceto o escaneo visual para usar de guía o pliego)
                </span>
              </div>
            </div>

            <button
              onClick={() => handleExportPreset(TEMPLATES[0])}
              className="text-[11px] text-sky-400 hover:text-sky-300 underline underline-offset-2 flex items-center gap-1 shrink-0"
            >
              <Download className="w-3 h-3" />
              <span>Descargar maqueta de ejemplo</span>
            </button>
          </div>
        </div>

        {/* Modal Body: Template Cards Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TEMPLATES.map((tpl) => (
              <div
                key={tpl.id}
                className="rounded-xl bg-[#24242b] border border-[#373744] hover:border-blue-500/50 p-4 flex flex-col justify-between transition-all group shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {tpl.tag}
                      </span>
                      <h3 className="text-sm font-bold text-white mt-1.5 leading-snug group-hover:text-blue-400 transition-colors">
                        {tpl.name}
                      </h3>
                    </div>

                    <div
                      className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                      style={{ backgroundColor: tpl.thumbnailColor }}
                    />
                  </div>

                  <p className="text-xs text-neutral-400 leading-relaxed font-serif mb-4">
                    {tpl.description}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] font-mono text-neutral-400 pb-3 border-b border-[#2d2d34]">
                    <span>Dimensiones: {tpl.project.width}×{tpl.project.height}px</span>
                    <span>•</span>
                    <span>{tpl.project.gridColumns} columnas</span>
                    <span>•</span>
                    <span>{tpl.project.elements.length} elementos</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 mt-4 pt-1">
                  <button
                    onClick={() => handleExportPreset(tpl)}
                    className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white py-1.5 px-2 rounded hover:bg-[#2d2d36] transition-colors"
                    title="Exportar archivo de plantilla JSON"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar JSON</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const clone = JSON.parse(JSON.stringify(tpl.project));
                        clone.id = `project-${Date.now()}`;
                        clone.title = `${tpl.project.title} (Copia)`;
                        onLoadTemplate(clone);
                        onClose();
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2e2e38] hover:bg-[#383844] text-xs font-medium text-neutral-200 transition-colors"
                      title="Copiar y abrir para editar sin alterar la plantilla original"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar y Editar</span>
                    </button>

                    <button
                      onClick={() => {
                        onLoadTemplate(tpl.project);
                        onClose();
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-colors shadow-xs"
                      title="Cargar esta maqueta en el lienzo"
                    >
                      <span>Abrir</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
