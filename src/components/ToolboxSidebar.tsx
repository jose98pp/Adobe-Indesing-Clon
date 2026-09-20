import React, { useState } from 'react';
import { 
  NewspaperElement, 
  PageFormat, 
  NewspaperProject, 
  ElementType 
} from '../types';
import { PAGE_FORMATS } from '../data/templates';
import { 
  Type, 
  Heading1, 
  Columns3, 
  Image as ImageIcon, 
  Quote, 
  Layers, 
  Grid, 
  SquareAsterisk, 
  Minus, 
  Trash2, 
  Lock, 
  Unlock, 
  ChevronUp, 
  ChevronDown, 
  Eye,
  EyeOff,
  GripVertical,
  Search,
  Copy
} from 'lucide-react';

interface Props {
  project: NewspaperProject;
  onAddElement: (element: NewspaperElement) => void;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateProject: (updates: Partial<NewspaperProject>) => void;
  onDeleteElement: (id: string) => void;
  onReorderElement: (id: string, direction: 'up' | 'down') => void;
  onReorderElements?: (newElements: NewspaperElement[]) => void;
  onToggleLock?: (id: string) => void;
  onToggleVisibility?: (id: string) => void;
  onDuplicateElement?: (element: NewspaperElement) => void;
  activeTab?: 'elements' | 'layers' | 'grid';
  onTabChange?: (tab: 'elements' | 'layers' | 'grid') => void;
}

export const ToolboxSidebar: React.FC<Props> = ({
  project,
  onAddElement,
  selectedElementId,
  onSelectElement,
  onUpdateProject,
  onDeleteElement,
  onReorderElement,
  onReorderElements,
  onToggleLock,
  onToggleVisibility,
  onDuplicateElement,
  activeTab: externalTab,
  onTabChange: setExternalTab
}) => {
  const [internalTab, setInternalTab] = useState<'elements' | 'layers' | 'grid'>('elements');
  const activeTab = externalTab ?? internalTab;
  const setActiveTab = (tab: 'elements' | 'layers' | 'grid') => {
    if (setExternalTab) setExternalTab(tab);
    setInternalTab(tab);
  };

  // Drag and drop state for Layers tab
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'above' | 'below' | null>(null);
  const [layerSearch, setLayerSearch] = useState<string>('');

  // Drag and drop handlers for Layers tab
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (draggedId === targetId) return;
    e.dataTransfer.dropEffect = 'move';

    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const isAbove = offsetY < rect.height / 2;

    setDropTargetId(targetId);
    setDropPosition(isAbove ? 'above' : 'below');
  };

  const handleDragLeave = (e: React.DragEvent, targetId: string) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (dropTargetId === targetId) {
      setDropTargetId(null);
      setDropPosition(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = draggedId || e.dataTransfer.getData('text/plain');
    setDraggedId(null);
    setDropTargetId(null);
    setDropPosition(null);

    if (!sourceId || sourceId === targetId) return;

    // The display list is sorted top-to-bottom (highest zIndex at index 0):
    const displayList = [...project.elements].reverse();
    const sourceIndex = displayList.findIndex((el) => el.id === sourceId);
    if (sourceIndex === -1) return;

    const [movedElement] = displayList.splice(sourceIndex, 1);
    const targetIndex = displayList.findIndex((el) => el.id === targetId);
    if (targetIndex === -1) return;

    const insertionIndex = dropPosition === 'above' ? targetIndex : targetIndex + 1;
    displayList.splice(insertionIndex, 0, movedElement);

    // Convert back to project.elements (where index 0 is bottom-most, index N-1 is top-most)
    const newProjectElements = [...displayList].reverse().map((el, i) => ({
      ...el,
      zIndex: i + 1
    }));

    if (onReorderElements) {
      onReorderElements(newProjectElements);
    } else {
      onUpdateProject({ elements: newProjectElements });
    }
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDropTargetId(null);
    setDropPosition(null);
  };

  const handleToggleVisibility = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (onToggleVisibility) {
      onToggleVisibility(id);
      return;
    }
    const updated = project.elements.map((el) =>
      el.id === id ? { ...el, hidden: !el.hidden } : el
    );
    onUpdateProject({ elements: updated });
    if (selectedElementId === id) {
      const el = project.elements.find((e) => e.id === id);
      if (!el?.hidden) {
        onSelectElement(null);
      }
    }
  };

  const handleToggleLock = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (onToggleLock) {
      onToggleLock(id);
      return;
    }
    const updated = project.elements.map((el) =>
      el.id === id ? { ...el, locked: !el.locked } : el
    );
    onUpdateProject({ elements: updated });
  };

  const handleShowAll = () => {
    const updated = project.elements.map((el) => ({ ...el, hidden: false }));
    onUpdateProject({ elements: updated });
  };

  const handleToggleLockAll = () => {
    const allLocked = project.elements.length > 0 && project.elements.every((el) => el.locked);
    const updated = project.elements.map((el) => ({ ...el, locked: !allLocked }));
    onUpdateProject({ elements: updated });
  };

  const getLayerDetails = (el: NewspaperElement) => {
    switch (el.type) {
      case 'masthead':
        return {
          name: (el as any).newspaperName || 'Cabecera Oficial',
          sub: `${(el as any).styleVariant || 'Clásico'} • ${(el as any).editionNumber || 'Edición'}`,
          typeLabel: 'Cabecera',
          icon: '📰',
          badgeClass: 'bg-red-500/15 text-red-400 border-red-500/30'
        };
      case 'headline':
        return {
          name: (el as any).headline || 'Gran Titular',
          sub: (el as any).kicker ? `${(el as any).kicker} • ${(el as any).fontFamily}` : (el as any).fontFamily,
          typeLabel: 'Titular',
          icon: 'T',
          badgeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/30'
        };
      case 'article':
        return {
          name: (el as any).headline || ((el as any).body ? (el as any).body.substring(0, 30) + '...' : 'Artículo'),
          sub: `${(el as any).columns} col • ${(el as any).dropCap ? 'Capitular' : 'Texto'}`,
          typeLabel: 'Artículo',
          icon: '📄',
          badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
        };
      case 'image':
        return {
          name: (el as any).caption || ((el as any).credit ? `Foto: ${(el as any).credit}` : 'Fotografía'),
          sub: `${el.width}×${el.height}px • ${(el as any).grayscale ? 'B/N' : 'Color'}`,
          typeLabel: 'Imagen',
          icon: '🖼️',
          badgeClass: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
          thumbnail: (el as any).url
        };
      case 'quote':
        return {
          name: (el as any).quote ? `"${(el as any).quote.substring(0, 26)}..."` : 'Cita Destacada',
          sub: (el as any).author || (el as any).role || 'Declaración',
          typeLabel: 'Cita',
          icon: '“',
          badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30'
        };
      case 'box':
        return {
          name: (el as any).title || 'Cuadro Destacado',
          sub: (el as any).boxStyle || 'Infobox',
          typeLabel: 'Cuadro',
          icon: '📦',
          badgeClass: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
        };
      case 'divider':
        return {
          name: `Filete ${(el as any).style || 'simple'}`,
          sub: `${(el as any).thickness || 1}px grosor`,
          typeLabel: 'Filete',
          icon: '—',
          badgeClass: 'bg-slate-500/15 text-slate-300 border-slate-500/30'
        };
      default:
        return {
          name: 'Elemento',
          sub: '',
          typeLabel: 'Elemento',
          icon: '•',
          badgeClass: 'bg-neutral-800 text-neutral-300 border-neutral-700'
        };
    }
  };

  const handleCreateElement = (type: ElementType) => {
    const id = `el-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const maxZ = project.elements.reduce((max, el) => Math.max(max, el.zIndex), 0);

    const centerX = Math.round((project.width - 500) / 2);
    const defaultY = Math.min(project.height - 200, 180 + (project.elements.length % 5) * 40);

    let newEl: NewspaperElement;

    switch (type) {
      case 'masthead':
        newEl = {
          id,
          type: 'masthead',
          x: project.margin,
          y: project.margin,
          width: project.width - project.margin * 2,
          height: 120,
          zIndex: maxZ + 1,
          newspaperName: 'NUEVO DIARIO',
          motto: 'INFORMACIÓN VERAZ • INDEPENDIENTE • DIARIO DE LA MAÑANA',
          editionDate: 'Edición Diaria',
          editionNumber: 'AÑO I • Nº 01',
          price: '2,00 €',
          section: 'EDICIÓN GENERAL',
          fontFamily: 'UnifrakturMaguntia',
          fontSize: 50,
          styleVariant: 'classic-gothic',
          borderColor: '#111827',
          accentColor: '#991b1b'
        };
        break;

      case 'headline':
        newEl = {
          id,
          type: 'headline',
          x: project.margin,
          y: defaultY,
          width: project.width - project.margin * 2,
          height: 130,
          zIndex: maxZ + 1,
          kicker: 'SECCIÓN PRINCIPAL',
          headline: 'NUEVO GRAN TITULAR DE PORTADA PARA EL DÍA DE HOY',
          subtitle: 'Descripción breve o bajada informativa complementaria que aporta contexto detallado sobre los hechos noticiosos.',
          byline: 'Por Redacción Central',
          date: 'Madrid',
          fontFamily: 'Playfair Display',
          fontSize: 32,
          lineHeight: 1.15,
          letterSpacing: -0.5,
          textAlign: 'left',
          textColor: '#0f172a',
          kickerColor: '#991b1b',
          showKicker: true,
          showSubtitle: true,
          showByline: true
        };
        break;

      case 'article':
        newEl = {
          id,
          type: 'article',
          x: centerX,
          y: defaultY,
          width: 480,
          height: 260,
          zIndex: maxZ + 1,
          headline: 'Título del artículo o crónica',
          body: 'El cuerpo de la noticia debe ser redactado con estilo directo, objetivo y respetando la estructura de pirámide invertida clásica del periodismo.\n\nEn este segundo párrafo se profundiza en los antecedentes y las declaraciones oficiales de las partes implicadas, dotando al lector de una perspectiva analítica rigurosa.',
          columns: 2,
          columnGap: 16,
          fontFamily: 'Newsreader',
          fontSize: 14,
          lineHeight: 1.55,
          letterSpacing: 0,
          textAlign: 'justify',
          dropCap: true,
          paragraphIndent: true,
          textColor: '#1f2937',
          showColumnDividers: true,
          dividerColor: '#e2e8f0'
        };
        break;

      case 'image':
        newEl = {
          id,
          type: 'image',
          x: centerX,
          y: defaultY,
          width: 480,
          height: 280,
          zIndex: maxZ + 1,
          url: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1000&q=80',
          caption: 'Instantánea documental tomada durante el desarrollo de los acontecimientos.',
          credit: 'Foto: Agencia Prensa',
          objectFit: 'cover',
          grayscale: false,
          borderWidth: 1,
          borderColor: '#cbd5e1',
          aspectRatioLock: true
        };
        break;

      case 'quote':
        newEl = {
          id,
          type: 'quote',
          x: centerX,
          y: defaultY,
          width: 320,
          height: 140,
          zIndex: maxZ + 1,
          quote: '«La libertad de prensa no es un privilegio de los periodistas, sino un derecho inalienable de los ciudadanos.»',
          author: 'Walter Lippmann',
          role: 'Teórico del periodismo',
          fontFamily: 'Playfair Display',
          fontSize: 16,
          lineHeight: 1.4,
          textColor: '#0f172a',
          borderStyle: 'ornate-quotes',
          accentColor: '#991b1b'
        };
        break;

      case 'box':
        newEl = {
          id,
          type: 'box',
          x: centerX,
          y: defaultY,
          width: 240,
          height: 220,
          zIndex: maxZ + 1,
          title: 'DATOS CLAVE',
          content: '• Punto relevante del análisis.\n• Cifras confirmadas por las fuentes oficiales.\n• Previsiones para la siguiente jornada.',
          boxStyle: 'breaking',
          bgColor: '#f8fafc',
          borderColor: '#0f172a',
          textColor: '#0f172a',
          borderWidth: 2,
          badgeText: 'NOTICIAS'
        };
        break;

      case 'divider':
        newEl = {
          id,
          type: 'divider',
          x: project.margin,
          y: defaultY,
          width: project.width - project.margin * 2,
          height: 6,
          zIndex: maxZ + 1,
          style: 'solid',
          thickness: 1,
          color: '#111827'
        };
        break;

      default:
        return;
    }

    onAddElement(newEl);
    onSelectElement(newEl.id);
  };

  return (
    <aside className="w-72 md:w-80 bg-[#1f1f23] border-r border-[#2d2d34] flex flex-col h-full text-neutral-200 shrink-0 select-none">
      {/* Navigation tabs */}
      <div className="flex border-b border-[#2d2d34] bg-[#1a1a1e]">
        <button
          onClick={() => setActiveTab('elements')}
          className={`flex-1 py-2.5 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'elements'
              ? 'text-white border-b-2 border-blue-500 bg-[#242429]'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <SquareAsterisk className="w-3.5 h-3.5" />
          <span>Elementos</span>
        </button>

        <button
          onClick={() => setActiveTab('layers')}
          className={`flex-1 py-2.5 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors relative ${
            activeTab === 'layers'
              ? 'text-white border-b-2 border-blue-500 bg-[#242429]'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Capas</span>
          {project.elements.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-800 text-neutral-300 font-mono">
              {project.elements.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('grid')}
          className={`flex-1 py-2.5 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'grid'
              ? 'text-white border-b-2 border-blue-500 bg-[#242429]'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>Retícula</span>
        </button>
      </div>

      {/* Tab 1: Editorial Component Palette */}
      {activeTab === 'elements' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 px-1">
            Componentes Editoriales
          </div>

          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => handleCreateElement('masthead')}
              className="w-full flex items-center gap-3 p-2.5 rounded-md bg-[#282830] hover:bg-[#32323d] border border-[#373744] text-left transition-all group"
            >
              <div className="p-2 rounded bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20">
                <Type className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white">Cabecera de Periódico</div>
                <div className="text-[10px] text-neutral-400">Nombre, lema, fecha y registro</div>
              </div>
            </button>

            <button
              onClick={() => handleCreateElement('headline')}
              className="w-full flex items-center gap-3 p-2.5 rounded-md bg-[#282830] hover:bg-[#32323d] border border-[#373744] text-left transition-all group"
            >
              <div className="p-2 rounded bg-red-500/10 text-red-400 group-hover:bg-red-500/20">
                <Heading1 className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white">Titular Periodístico</div>
                <div className="text-[10px] text-neutral-400">Antetítulo, título y bajada</div>
              </div>
            </button>

            <button
              onClick={() => handleCreateElement('article')}
              className="w-full flex items-center gap-3 p-2.5 rounded-md bg-[#282830] hover:bg-[#32323d] border border-[#373744] text-left transition-all group"
            >
              <div className="p-2 rounded bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20">
                <Columns3 className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white">Cuerpo de Noticia</div>
                <div className="text-[10px] text-neutral-400">1 a 4 columnas con letra capital</div>
              </div>
            </button>

            <button
              onClick={() => handleCreateElement('image')}
              className="w-full flex items-center gap-3 p-2.5 rounded-md bg-[#282830] hover:bg-[#32323d] border border-[#373744] text-left transition-all group"
            >
              <div className="p-2 rounded bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white">Fotografía & Pie</div>
                <div className="text-[10px] text-neutral-400">Imagen periodística con crédito</div>
              </div>
            </button>

            <button
              onClick={() => handleCreateElement('quote')}
              className="w-full flex items-center gap-3 p-2.5 rounded-md bg-[#282830] hover:bg-[#32323d] border border-[#373744] text-left transition-all group"
            >
              <div className="p-2 rounded bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20">
                <Quote className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white">Cita Editorial</div>
                <div className="text-[10px] text-neutral-400">Frase destacada y autor</div>
              </div>
            </button>

            <button
              onClick={() => handleCreateElement('box')}
              className="w-full flex items-center gap-3 p-2.5 rounded-md bg-[#282830] hover:bg-[#32323d] border border-[#373744] text-left transition-all group"
            >
              <div className="p-2 rounded bg-yellow-500/10 text-yellow-400 group-hover:bg-yellow-500/20">
                <SquareAsterisk className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white">Cuadro / Breves</div>
                <div className="text-[10px] text-neutral-400">Destacados, opinión o sumario</div>
              </div>
            </button>

            <button
              onClick={() => handleCreateElement('divider')}
              className="w-full flex items-center gap-3 p-2.5 rounded-md bg-[#282830] hover:bg-[#32323d] border border-[#373744] text-left transition-all group"
            >
              <div className="p-2 rounded bg-neutral-500/10 text-neutral-400 group-hover:bg-neutral-500/20">
                <Minus className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white">Filete de Separación</div>
                <div className="text-[10px] text-neutral-400">Líneas dobles, simples o filetes</div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Layers */}
      {activeTab === 'layers' && (
        <div className="flex-1 flex flex-col overflow-hidden bg-[#1a1a1e]">
          {/* Header toolbar with search and batch controls */}
          <div className="p-3 border-b border-[#2d2d34] bg-[#222227] space-y-2.5 shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-white tracking-wide">Pila de Capas</span>
                <span className="text-[10px] text-neutral-400 block">
                  {project.elements.length} capas • {project.elements.filter((e) => e.locked).length} bloqueadas • {project.elements.filter((e) => e.hidden).length} ocultas
                </span>
              </div>

              {/* Batch Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={handleShowAll}
                  className="p-1.5 rounded hover:bg-[#2e2e38] text-neutral-400 hover:text-white transition-colors"
                  title="Mostrar todas las capas"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleToggleLockAll}
                  className={`p-1.5 rounded transition-colors ${
                    project.elements.length > 0 && project.elements.every((e) => e.locked)
                      ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                      : 'hover:bg-[#2e2e38] text-neutral-400 hover:text-white'
                  }`}
                  title={
                    project.elements.length > 0 && project.elements.every((e) => e.locked)
                      ? 'Desbloquear todas las capas'
                      : 'Bloquear todas las capas'
                  }
                >
                  {project.elements.length > 0 && project.elements.every((e) => e.locked) ? (
                    <Lock className="w-3.5 h-3.5" />
                  ) : (
                    <Unlock className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Layer search / filter */}
            {project.elements.length > 3 && (
              <div className="relative">
                <Search className="w-3 h-3 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar capa (título, tipo...)"
                  value={layerSearch}
                  onChange={(e) => setLayerSearch(e.target.value)}
                  className="w-full bg-[#18181c] border border-[#33333d] rounded text-[11px] pl-7 pr-2 py-1 text-white placeholder-neutral-500 focus:outline-hidden focus:border-blue-500"
                />
              </div>
            )}
          </div>

          {/* List of layers with drag & drop reordering */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {project.elements.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-500 flex flex-col items-center gap-2">
                <Layers className="w-8 h-8 text-neutral-600 stroke-[1.5]" />
                <p>No hay elementos en el pliego.</p>
                <p className="text-[10px] text-neutral-600">Agrega cabeceras, titulares o artículos desde la pestaña Elementos.</p>
              </div>
            ) : (() => {
              const reversed = [...project.elements].reverse();
              const filtered = reversed.filter((el) => {
                if (!layerSearch.trim()) return true;
                const q = layerSearch.toLowerCase();
                const details = getLayerDetails(el);
                return (
                  details.name.toLowerCase().includes(q) ||
                  details.sub.toLowerCase().includes(q) ||
                  details.typeLabel.toLowerCase().includes(q) ||
                  el.type.toLowerCase().includes(q)
                );
              });

              if (filtered.length === 0) {
                return (
                  <div className="p-6 text-center text-xs text-neutral-500">
                    No se encontraron capas que coincidan con "{layerSearch}".
                  </div>
                );
              }

              return filtered.map((el, idx) => {
                const isSelected = el.id === selectedElementId;
                const isDraggingThis = draggedId === el.id;
                const isOverThis = dropTargetId === el.id;
                const details = getLayerDetails(el);

                return (
                  <div
                    key={el.id}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, el.id)}
                    onDragOver={(e) => handleDragOver(e, el.id)}
                    onDragLeave={(e) => handleDragLeave(e, el.id)}
                    onDrop={(e) => handleDrop(e, el.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => onSelectElement(el.id)}
                    className={`group relative rounded-md transition-all select-none cursor-pointer border ${
                      isDraggingThis
                        ? 'opacity-30 bg-neutral-800 border-dashed border-neutral-600 scale-[0.98]'
                        : isSelected
                        ? 'bg-blue-600/15 border-blue-500/80 shadow-xs'
                        : el.hidden
                        ? 'bg-[#1b1b20] border-[#292932] opacity-60'
                        : 'bg-[#222227] hover:bg-[#282830] border-[#2e2e38]'
                    } ${
                      isOverThis && dropPosition === 'above'
                        ? 'border-t-2! border-t-blue-500! bg-blue-500/10'
                        : ''
                    } ${
                      isOverThis && dropPosition === 'below'
                        ? 'border-b-2! border-b-blue-500! bg-blue-500/10'
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-1.5 p-2">
                      {/* Drag handle */}
                      <div
                        className="p-0.5 rounded text-neutral-500 group-hover:text-neutral-300 cursor-grab active:cursor-grabbing hover:bg-[#343440] transition-colors"
                        title="Arrastra para reordenar la posición en la pila de capas"
                      >
                        <GripVertical className="w-3.5 h-3.5" />
                      </div>

                      {/* Visibility toggle (eye icon) */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleVisibility(el.id, e)}
                        className={`p-1 rounded transition-colors ${
                          el.hidden
                            ? 'text-neutral-500 hover:text-white bg-neutral-800/80'
                            : 'text-neutral-400 hover:text-white hover:bg-[#343440]'
                        }`}
                        title={el.hidden ? 'Capa oculta (clic para mostrar)' : 'Ocultar capa'}
                      >
                        {el.hidden ? (
                          <EyeOff className="w-3.5 h-3.5 text-neutral-500" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Lock toggle (lock icon) */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleLock(el.id, e)}
                        className={`p-1 rounded transition-colors ${
                          el.locked
                            ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                            : 'text-neutral-500 hover:text-neutral-200 hover:bg-[#343440]'
                        }`}
                        title={
                          el.locked
                            ? 'Capa bloqueada: protegida contra arrastres accidentales (clic para desbloquear)'
                            : 'Bloquear capa para prevenir movimientos accidentales'
                        }
                      >
                        {el.locked ? (
                          <Lock className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <Unlock className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Thumbnail preview or Type Icon */}
                      {details.thumbnail ? (
                        <img
                          src={details.thumbnail}
                          alt=""
                          className="w-6 h-6 rounded object-cover border border-neutral-700 shrink-0"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded flex items-center justify-center text-[11px] bg-neutral-800 border border-neutral-700 shrink-0">
                          {details.icon}
                        </div>
                      )}

                      {/* Layer labels and details */}
                      <div className="flex-1 min-w-0 pr-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-xs font-medium truncate ${
                              el.hidden
                                ? 'line-through text-neutral-500 italic'
                                : isSelected
                                ? 'text-white'
                                : 'text-neutral-200'
                            }`}
                          >
                            {details.name}
                          </span>
                          {el.locked && (
                            <span className="text-[9px] text-amber-400/90 font-mono shrink-0">🔒</span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className={`text-[9px] px-1 py-0.2 rounded border font-mono ${details.badgeClass}`}
                          >
                            {details.typeLabel}
                          </span>
                          <span className="text-[10px] text-neutral-400 truncate">
                            {details.sub}
                          </span>
                          <span className="text-[9px] text-neutral-500 font-mono ml-auto shrink-0">
                            Z-{el.zIndex}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons (Duplicate, Reorder, Delete) */}
                      <div
                        className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => onReorderElement(el.id, 'up')}
                          disabled={idx === 0}
                          className="p-1 hover:text-white text-neutral-400 disabled:opacity-20 disabled:hover:text-neutral-400 transition-colors"
                          title="Subir en la pila de capas"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onReorderElement(el.id, 'down')}
                          disabled={idx === filtered.length - 1}
                          className="p-1 hover:text-white text-neutral-400 disabled:opacity-20 disabled:hover:text-neutral-400 transition-colors"
                          title="Bajar en la pila de capas"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                        {onDuplicateElement && (
                          <button
                            onClick={() => onDuplicateElement(el)}
                            className="p-1 hover:text-blue-400 text-neutral-400 transition-colors hidden sm:block"
                            title="Duplicar capa"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteElement(el.id)}
                          className="p-1 hover:text-red-400 text-neutral-400 transition-colors"
                          title="Eliminar elemento"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* Tab 3: Grid and Page Setup */}
      {activeTab === 'grid' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
            Ajustes del Pliego Editorial
          </div>

          <div className="space-y-1">
            <label className="text-xs text-neutral-300">Formato de Periódico</label>
            <select
              value={project.format}
              onChange={(e) => {
                const format = e.target.value as PageFormat;
                const cfg = PAGE_FORMATS[format];
                onUpdateProject({
                  format,
                  width: cfg.width,
                  height: cfg.height,
                  gridColumns: cfg.defaultColumns
                });
              }}
              className="w-full bg-[#282830] border border-[#373744] text-white text-xs rounded p-2 focus:outline-hidden focus:border-blue-500"
            >
              <option value="broadsheet">Broadsheet Clásico (820 × 1160 px)</option>
              <option value="tabloid">Tabloide Moderno (720 × 1020 px)</option>
              <option value="compact-a4">Compacto Editorial / A4 (680 × 960 px)</option>
            </select>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-neutral-300">
              <span>Columnas de Retícula</span>
              <span className="font-mono text-blue-400">{project.gridColumns} columnas</span>
            </div>
            <input
              type="range"
              min={2}
              max={6}
              value={project.gridColumns}
              onChange={(e) => onUpdateProject({ gridColumns: parseInt(e.target.value) })}
              className="w-full accent-blue-500"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-neutral-300">
              <span>Medianil / Gutter</span>
              <span className="font-mono text-blue-400">{project.gridGutter} px</span>
            </div>
            <input
              type="range"
              min={8}
              max={32}
              value={project.gridGutter}
              onChange={(e) => onUpdateProject({ gridGutter: parseInt(e.target.value) })}
              className="w-full accent-blue-500"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-neutral-300">
              <span>Márgenes de Página</span>
              <span className="font-mono text-blue-400">{project.margin} px</span>
            </div>
            <input
              type="range"
              min={16}
              max={48}
              value={project.margin}
              onChange={(e) => onUpdateProject({ margin: parseInt(e.target.value) })}
              className="w-full accent-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-neutral-300">Tono del Papel Prensa</label>
            <div className="grid grid-cols-4 gap-2 pt-1">
              {[
                { name: 'Blanco Prensa', color: '#fdfbf7' },
                { name: 'Papel Salmón', color: '#fbf0e2' },
                { name: 'Papel Crudo', color: '#f5f0e6' },
                { name: 'Puro Blanco', color: '#ffffff' }
              ].map((c) => (
                <button
                  key={c.color}
                  onClick={() => onUpdateProject({ backgroundColor: c.color })}
                  className={`h-8 rounded border transition-all ${
                    project.backgroundColor === c.color ? 'ring-2 ring-blue-500 border-white' : 'border-neutral-700'
                  }`}
                  style={{ backgroundColor: c.color }}
                  title={c.name}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
