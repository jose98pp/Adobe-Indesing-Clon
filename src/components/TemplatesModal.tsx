import React, { useRef } from 'react';
import { TemplatePreset, NewspaperProject } from '../types';
import { TEMPLATES } from '../data/templates';
import { 
  LayoutTemplate, 
  Download, 
  Upload, 
  Copy, 
  X, 
  Sparkles, 
  FileCheck,
  ArrowRight
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

  if (!isOpen) return null;

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
        author: 'Redacción',
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
        author: 'Latitud 18 / Última Hora TV',
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
  };

  // Import JSON or .latitud-template file
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        // Handle .latitud-template package
        if (json.type === 'latitud-template' && json.project && Array.isArray(json.project.elements)) {
          onImportCustomTemplate(json.project);
          onClose();
          return;
        }
        // Handle standard project format
        if (json && json.elements && Array.isArray(json.elements)) {
          onImportCustomTemplate(json);
          onClose();
          return;
        }
        alert('El archivo no contiene un formato de maqueta PrensaStudio o .latitud-template válido.');
      } catch (err) {
        alert('Error al leer el archivo de maqueta. Verifique que sea un JSON válido.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none animate-in fade-in duration-150">
      <div className="bg-[#1f1f23] border border-[#373744] rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden text-neutral-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2d2d34] bg-[#18181b]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-blue-500/10 text-blue-400">
              <LayoutTemplate className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Catálogo de Maquetas y Plantillas</h2>
              <p className="text-[11px] text-neutral-400">
                Selecciona una maqueta prediseñada, cópiala para editarla o exporta tus propios diseños en formato reutilizable.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleExportCurrent('latitud')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs hover:bg-amber-500/30 transition-colors font-semibold"
                title="Descarga la maqueta en formato .latitud-template para latitud18.ultimahora-tv.com"
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2a2a32] text-neutral-200 border border-[#373744] text-xs hover:bg-[#34343e] transition-colors font-medium"
              title="Cargar una plantilla .latitud-template o JSON desde tu ordenador"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Importar Plantilla</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.latitud-template"
              onChange={handleFileImport}
              className="hidden"
            />

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#2d2d34] transition-colors ml-2"
            >
              <X className="w-4 h-4" />
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
                        // Duplicate with new ID
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
