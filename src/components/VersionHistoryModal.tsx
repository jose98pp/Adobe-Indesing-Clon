import React, { useState } from 'react';
import { VersionSnapshot, NewspaperProject } from '../types';
import { 
  History, 
  RotateCcw, 
  Download, 
  Plus, 
  X, 
  Clock, 
  User, 
  FileText,
  AlertCircle
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  versions: VersionSnapshot[];
  currentProject: NewspaperProject;
  onSaveVersion: (name: string, description: string) => void;
  onRestoreVersion: (versionId: string) => void;
}

export const VersionHistoryModal: React.FC<Props> = ({
  isOpen,
  onClose,
  versions,
  currentProject,
  onSaveVersion,
  onRestoreVersion
}) => {
  const [versionName, setVersionName] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(
    versions.length > 0 ? versions[0].id : null
  );

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!versionName.trim()) return;
    onSaveVersion(versionName.trim(), description.trim());
    setVersionName('');
    setDescription('');
    setIsCreating(false);
  };

  const selectedVersion = versions.find(v => v.id === selectedVersionId);

  const downloadVersionJson = (version: VersionSnapshot) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(version.projectData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${version.name.replace(/\s+/g, '_')}_backup.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none animate-in fade-in duration-150">
      <div className="bg-[#1f1f23] border border-[#373744] rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden text-neutral-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2d2d34] bg-[#18181b]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-amber-500/10 text-amber-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Historial de Versiones Editoriales</h2>
              <p className="text-[11px] text-neutral-400">
                Puntos de control guardados para revertir o comparar maquetaciones en tiempo real
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#2d2d34] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Left Column: Version List */}
          <div className="w-full md:w-80 border-r border-[#2d2d34] flex flex-col bg-[#1a1a1e]">
            <div className="p-3 border-b border-[#2d2d34] flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                Versiones ({versions.length})
              </span>
              <button
                onClick={() => setIsCreating(true)}
                className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded transition-colors font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Guardar actual</span>
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {versions.length === 0 ? (
                <div className="p-6 text-center text-xs text-neutral-500">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>Aún no has guardado versiones manuales.</p>
                  <p className="text-[10px] mt-1 text-neutral-600">
                    Crea una para poder revertir cambios en cualquier instante.
                  </p>
                </div>
              ) : (
                versions.map((ver) => {
                  const isSelected = ver.id === selectedVersionId;
                  const dateStr = new Date(ver.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  });

                  return (
                    <div
                      key={ver.id}
                      onClick={() => setSelectedVersionId(ver.id)}
                      className={`p-2.5 rounded-lg cursor-pointer transition-all border ${
                        isSelected
                          ? 'bg-[#272732] border-amber-500/50 text-white shadow-sm'
                          : 'bg-[#1f1f23] border-[#2c2c36] hover:bg-[#25252b] text-neutral-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-semibold text-xs leading-snug">{ver.name}</span>
                        <span className="text-[10px] font-mono text-neutral-400 shrink-0">
                          {dateStr}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-neutral-400 font-mono">
                        <span className="flex items-center gap-1">
                          <User className="w-2.5 h-2.5" /> {ver.author}
                        </span>
                        <span>•</span>
                        <span>{ver.elementCount} elementos</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Version Details / Create Form */}
          <div className="flex-1 p-5 overflow-y-auto bg-[#1f1f23]">
            {isCreating ? (
              <form onSubmit={handleSave} className="space-y-4 max-w-md">
                <div className="flex items-center justify-between pb-2 border-b border-[#2d2d34]">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
                    Crear Nueva Versión de Seguridad
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="text-xs text-neutral-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-neutral-300">Nombre de la Versión</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Portada Aprobada por Redacción"
                    value={versionName}
                    onChange={(e) => setVersionName(e.target.value)}
                    className="w-full bg-[#18181b] border border-[#373744] text-white text-xs rounded p-2 focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-neutral-300">Notas / Resumen de Cambios</label>
                  <textarea
                    rows={3}
                    placeholder="Detalles sobre las modificaciones de titulares, fotos o columnas..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-[#18181b] border border-[#373744] text-white text-xs rounded p-2 focus:outline-hidden focus:border-amber-500 font-serif"
                  />
                </div>

                <div className="p-3 bg-[#18181b] rounded border border-[#2d2d34] text-xs text-neutral-400 space-y-1 font-mono">
                  <div>Elementos actuales en pliego: {currentProject.elements.length}</div>
                  <div>Formato: {currentProject.format}</div>
                  <div>Fecha editorial: {currentProject.publicationDate}</div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-3 py-1.5 rounded text-xs bg-[#2a2a32] text-neutral-300 hover:bg-[#34343e]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded text-xs bg-amber-600 hover:bg-amber-500 text-white font-semibold transition-colors"
                  >
                    Guardar Instantánea
                  </button>
                </div>
              </form>
            ) : selectedVersion ? (
              <div className="space-y-5">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{selectedVersion.name}</h3>
                    <span className="text-[10px] font-mono bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">
                      Punto Guardado
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(selectedVersion.timestamp).toLocaleString()}
                    <span>• Creado por <strong>{selectedVersion.author}</strong></span>
                  </p>
                </div>

                {selectedVersion.description && (
                  <div className="p-3 rounded bg-[#18181b] border border-[#2d2d34] text-xs font-serif italic text-neutral-300">
                    «{selectedVersion.description}»
                  </div>
                )}

                {/* Metadata cards */}
                <div className="grid grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-3 rounded bg-[#282830] border border-[#373744]">
                    <span className="text-[10px] text-neutral-400 block">ELEMENTOS</span>
                    <span className="text-lg font-bold text-white">
                      {selectedVersion.elementCount}
                    </span>
                  </div>

                  <div className="p-3 rounded bg-[#282830] border border-[#373744]">
                    <span className="text-[10px] text-neutral-400 block">FORMATO</span>
                    <span className="text-sm font-bold text-white uppercase">
                      {selectedVersion.projectData?.format || 'Broadsheet'}
                    </span>
                  </div>

                  <div className="p-3 rounded bg-[#282830] border border-[#373744]">
                    <span className="text-[10px] text-neutral-400 block">COLUMNAS</span>
                    <span className="text-lg font-bold text-white">
                      {selectedVersion.projectData?.gridColumns || 5}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Al restaurar esta versión, el pliego actual volverá exactamente al estado de esta instantánea y se sincronizará automáticamente con todos los redactores conectados.
                  </span>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-3 pt-3 border-t border-[#2d2d34]">
                  <button
                    onClick={() => {
                      if (window.confirm(`¿Deseas restaurar la versión "${selectedVersion.name}"? Se sobrescribirá el lienzo actual.`)) {
                        onRestoreVersion(selectedVersion.id);
                        onClose();
                      }
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restaurar Esta Versión</span>
                  </button>

                  <button
                    onClick={() => downloadVersionJson(selectedVersion)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#2a2a32] hover:bg-[#34343e] text-neutral-200 text-xs font-medium border border-[#373744] transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar Copia JSON</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center text-xs text-neutral-500">
                Selecciona una versión del menú izquierdo para ver detalles o restaurarla.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
