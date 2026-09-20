import React, { useState } from 'react';
import { NewspaperProject, Collaborator, VersionSnapshot } from '../types';
import { 
  Newspaper, 
  FileDown, 
  History, 
  LayoutTemplate, 
  Users, 
  Wifi, 
  WifiOff, 
  Undo2, 
  Redo2, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Grid, 
  Ruler, 
  Magnet, 
  Sparkles,
  ChevronDown,
  Globe
} from 'lucide-react';

interface Props {
  project: NewspaperProject;
  onUpdateProjectTitle: (title: string) => void;
  collaborators: Collaborator[];
  currentUser: Collaborator;
  onUpdateCurrentUser: (updates: Partial<Collaborator>) => void;
  connected: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  showRulers: boolean;
  onToggleRulers: () => void;
  showBleed: boolean;
  onToggleBleed: () => void;
  snapToGrid: boolean;
  onToggleSnap: () => void;
  versionsCount: number;
  onOpenVersions: () => void;
  onOpenTemplates: () => void;
  onOpenPdfExport: () => void;
  onOpenWorkflow: () => void;
}

export const Header: React.FC<Props> = ({
  project,
  onUpdateProjectTitle,
  collaborators,
  currentUser,
  onUpdateCurrentUser,
  connected,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  zoom,
  onZoomChange,
  showGrid,
  onToggleGrid,
  showRulers,
  onToggleRulers,
  showBleed,
  onToggleBleed,
  snapToGrid,
  onToggleSnap,
  versionsCount,
  onOpenVersions,
  onOpenTemplates,
  onOpenPdfExport,
  onOpenWorkflow
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(project.title);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleInput.trim()) {
      onUpdateProjectTitle(titleInput.trim());
    } else {
      setTitleInput(project.title);
    }
  };

  const status = project.status || 'draft';
  const statusLabels: Record<string, { label: string; color: string }> = {
    draft: { label: 'Borrador', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
    review: { label: 'En Revisión', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
    approved: { label: 'Aprobado', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
    scheduled: { label: 'Programado', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
    published: { label: 'Publicado', color: 'bg-sky-500/20 text-sky-300 border-sky-500/40' }
  };
  const currentStatusInfo = statusLabels[status] || statusLabels.draft;

  return (
    <header className="h-14 bg-[#141417] border-b border-[#27272a] px-4 flex items-center justify-between text-neutral-200 select-none shrink-0 z-40">
      {/* Brand & Project Name */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 pr-3 border-r border-[#27272a]">
          <div className="w-8 h-8 rounded bg-[#0B1F3A] border border-[#D71920] flex items-center justify-center text-white shadow-sm font-black text-xs font-mono">
            <span className="text-white">L</span>
            <span className="text-[#D71920]">18</span>
          </div>
          <div>
            <div className="font-['Montserrat',sans-serif] font-black tracking-tight text-white leading-none text-sm flex items-center gap-1">
              <span>Latitud</span>
              <span className="text-[#D71920]">18</span>
            </div>
            <div className="text-[9px] uppercase tracking-widest text-neutral-400 font-mono">
              Maquetador InDesign
            </div>
          </div>
        </div>

        {/* Project Name Editable */}
        <div className="flex items-center gap-2">
          {isEditingTitle ? (
            <input
              type="text"
              autoFocus
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleSubmit();
                if (e.key === 'Escape') {
                  setTitleInput(project.title);
                  setIsEditingTitle(false);
                }
              }}
              className="bg-[#242429] text-white text-xs px-2 py-1 rounded border border-blue-500 focus:outline-hidden font-medium"
            />
          ) : (
            <button
              onClick={() => {
                setTitleInput(project.title);
                setIsEditingTitle(true);
              }}
              className="text-xs font-semibold text-white hover:bg-[#242429] px-2 py-1 rounded transition-colors text-left flex items-center gap-1.5"
              title="Clic para renombrar edición"
            >
              <span>{project.title}</span>
              <span className="text-[10px] text-neutral-500 font-mono">✎</span>
            </button>
          )}

          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#242429] text-neutral-400 font-mono uppercase">
            {project.format}
          </span>

          {/* Interactive Editorial Status Badge */}
          <button
            onClick={onOpenWorkflow}
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1.5 transition-all hover:brightness-125 shadow-xs ${currentStatusInfo.color}`}
            title="Abrir Flujo Editorial y Publicación en latitud18.ultimahora-tv.com"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            <span>{currentStatusInfo.label}</span>
          </button>
        </div>
      </div>

      {/* Center Tool Group: Undo/Redo, Grid/Rulers, Zoom */}
      <div className="flex items-center gap-2">
        {/* Undo / Redo */}
        <div className="flex items-center bg-[#1f1f23] rounded p-0.5 border border-[#2d2d34]">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 rounded transition-colors ${
              canUndo ? 'text-neutral-300 hover:text-white hover:bg-[#2a2a32]' : 'text-neutral-600 cursor-not-allowed'
            }`}
            title="Deshacer (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1.5 rounded transition-colors ${
              canRedo ? 'text-neutral-300 hover:text-white hover:bg-[#2a2a32]' : 'text-neutral-600 cursor-not-allowed'
            }`}
            title="Rehacer (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* View toggles: Grid, Rulers, Bleed, Snap */}
        <div className="flex items-center bg-[#1f1f23] rounded p-0.5 border border-[#2d2d34]">
          <button
            onClick={onToggleGrid}
            className={`p-1.5 rounded transition-colors ${
              showGrid ? 'bg-blue-600/30 text-blue-400' : 'text-neutral-400 hover:text-white'
            }`}
            title="Mostrar Guías de Retícula y Columnas"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onToggleRulers}
            className={`p-1.5 rounded transition-colors ${
              showRulers ? 'bg-blue-600/30 text-blue-400' : 'text-neutral-400 hover:text-white'
            }`}
            title="Mostrar Reglas de Imprenta"
          >
            <Ruler className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onToggleSnap}
            className={`p-1.5 rounded transition-colors ${
              snapToGrid ? 'bg-blue-600/30 text-blue-400' : 'text-neutral-400 hover:text-white'
            }`}
            title="Ajuste Magnético a Columnas (Snap to Grid)"
          >
            <Magnet className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onToggleBleed}
            className={`px-1.5 py-1 text-[10px] font-mono rounded transition-colors ${
              showBleed ? 'bg-red-500/20 text-red-400' : 'text-neutral-400 hover:text-white'
            }`}
            title="Guía de Sangre de Impresión (3mm)"
          >
            3mm
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center bg-[#1f1f23] rounded p-0.5 border border-[#2d2d34]">
          <button
            onClick={() => onZoomChange(Math.max(0.4, Number((zoom - 0.1).toFixed(1))))}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-[#2a2a32] rounded"
            title="Alejar"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <span className="text-[11px] font-mono px-1.5 min-w-11 text-center text-neutral-300">
            {Math.round(zoom * 100)}%
          </span>

          <button
            onClick={() => onZoomChange(Math.min(1.8, Number((zoom + 0.1).toFixed(1))))}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-[#2a2a32] rounded"
            title="Acercar"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onZoomChange(0.8)}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-[#2a2a32] rounded text-[10px] font-mono"
            title="Ajustar pliego a la ventana"
          >
            <Maximize className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Right Tool Group: Collaboration, History, Templates & PDF Export */}
      <div className="flex items-center gap-3">
        {/* Real-time Collaboration Pills */}
        <div className="flex items-center gap-1.5 bg-[#1f1f23] px-2 py-1 rounded-full border border-[#2d2d34]">
          <div className="flex items-center gap-1" title={connected ? 'Conectado al servidor de colaboración' : 'Reconectando...'}>
            {connected ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            )}
            <span className="text-[10px] font-mono text-neutral-400 hidden sm:inline">
              {connected ? 'En vivo' : 'Offline'}
            </span>
          </div>

          {/* Active Collaborators Avatars */}
          <div className="flex items-center -space-x-1.5 pl-1.5 border-l border-neutral-700">
            {/* Current user */}
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white ring-1 ring-[#1f1f23] cursor-pointer"
              style={{ backgroundColor: currentUser.color }}
              title={`Tú: ${currentUser.name}`}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              {currentUser.name.charAt(0).toUpperCase()}
            </div>

            {/* Remote users */}
            {collaborators.map((c) => (
              <div
                key={c.id}
                className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white ring-1 ring-[#1f1f23]"
                style={{ backgroundColor: c.color }}
                title={`${c.name} (en línea)`}
              >
                {c.name.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>

          <span className="text-[10px] text-neutral-400 font-mono">
            {collaborators.length + 1}
          </span>
        </div>

        {/* Profile customization menu modal dropdown */}
        {showProfileMenu && (
          <div className="absolute right-72 top-14 bg-[#242429] border border-[#373744] rounded-lg p-3 shadow-xl z-50 w-64 space-y-3">
            <div className="text-xs font-semibold text-white pb-2 border-b border-[#373744]">
              Tu Perfil de Redacción
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-neutral-400">Nombre / Rol</label>
              <input
                type="text"
                value={currentUser.name}
                onChange={(e) => onUpdateCurrentUser({ name: e.target.value })}
                className="w-full bg-[#18181b] border border-[#373744] text-white text-xs rounded p-1.5 focus:outline-hidden"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-neutral-400">Color de Cursor</label>
              <div className="grid grid-cols-5 gap-1.5 pt-1">
                {['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'].map((color) => (
                  <button
                    key={color}
                    onClick={() => onUpdateCurrentUser({ color })}
                    className={`h-6 rounded-full border ${
                      currentUser.color === color ? 'ring-2 ring-white border-transparent' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <button
              onClick={() => setShowProfileMenu(false)}
              className="w-full py-1 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded font-medium"
            >
              Guardar Perfil
            </button>
          </div>
        )}

        {/* Version History Button */}
        <button
          onClick={onOpenVersions}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#1f1f23] hover:bg-[#282830] border border-[#2d2d34] text-xs font-medium transition-colors"
          title="Ver y restaurar historial de versiones"
        >
          <History className="w-3.5 h-3.5 text-amber-400" />
          <span>Historial</span>
          {versionsCount > 0 && (
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1 rounded font-mono">
              {versionsCount}
            </span>
          )}
        </button>

        {/* Editorial Workflow & Latitud18 Publishing Button */}
        <button
          onClick={onOpenWorkflow}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#1f1f23] hover:bg-[#282830] border border-[#2d2d34] text-xs font-medium text-amber-400 transition-colors"
          title="Abrir panel de flujo editorial y publicación en latitud18.ultimahora-tv.com"
        >
          <Globe className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-white hidden sm:inline">Flujo Editorial</span>
        </button>

        {/* Templates Button */}
        <button
          onClick={onOpenTemplates}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#1f1f23] hover:bg-[#282830] border border-[#2d2d34] text-xs font-medium transition-colors"
          title="Ver ejemplos de maquetas, copiar y exportar plantillas"
        >
          <LayoutTemplate className="w-3.5 h-3.5 text-blue-400" />
          <span>Maquetas</span>
        </button>

        {/* PDF Export Button */}
        <button
          onClick={onOpenPdfExport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-semibold shadow transition-all transform active:scale-95"
          title="Exportar documento en PDF profesional para imprenta"
        >
          <FileDown className="w-3.5 h-3.5" />
          <span>Exportar PDF</span>
        </button>
      </div>
    </header>
  );
};
