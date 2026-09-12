import React from 'react';
import { NewspaperElement, NewspaperProject } from '../types';
import { EDITORIAL_FONTS, TYPOGRAPHY_PRESETS } from '../data/fonts';
import { 
  Type, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify, 
  Lock, 
  Unlock, 
  Copy, 
  Trash2, 
  BringToFront, 
  SendToBack,
  Sliders,
  Image as ImageIcon,
  Columns
} from 'lucide-react';

interface Props {
  selectedElement: NewspaperElement | null;
  onUpdateElement: (updated: NewspaperElement) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (element: NewspaperElement) => void;
  onBringToFront: (id: string) => void;
  onSendToBack: (id: string) => void;
  project: NewspaperProject;
}

export const PropertiesSidebar: React.FC<Props> = ({
  selectedElement,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onBringToFront,
  onSendToBack,
  project
}) => {
  if (!selectedElement) {
    return (
      <aside className="w-80 bg-[#1f1f23] border-l border-[#2d2d34] flex flex-col h-full text-neutral-300 p-4 shrink-0 overflow-y-auto select-none">
        <div className="flex items-center gap-2 pb-3 border-b border-[#2d2d34]">
          <Sliders className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
            Inspector Editorial
          </h3>
        </div>

        <div className="py-6 text-center text-neutral-400 text-xs space-y-2">
          <p className="font-serif italic text-sm text-neutral-300">
            Ningún elemento seleccionado
          </p>
          <p className="text-[11px] leading-relaxed text-neutral-500">
            Haz clic en un titular, artículo, imagen o cabecera en el lienzo para ajustar su tipografía, columnas y maquetación.
          </p>
        </div>

        {/* Quick typography catalogue preview */}
        <div className="mt-4 pt-4 border-t border-[#2d2d34] space-y-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
            Tipografías de Prensa Disponibles
          </span>
          <div className="space-y-2">
            {EDITORIAL_FONTS.slice(0, 6).map((font) => (
              <div key={font.name} className="p-2.5 rounded bg-[#282830] border border-[#373744]">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-xs font-bold text-white">{font.name}</span>
                  <span className="text-[9px] uppercase px-1 rounded bg-[#373744] text-neutral-400">
                    {font.category}
                  </span>
                </div>
                <p
                  className="text-sm text-neutral-200 truncate"
                  style={{ fontFamily: font.family }}
                >
                  La edición matutina informa con rigor y veracidad
                </p>
              </div>
            ))}
          </div>
        </div>
      </aside>
    );
  }

  // Handle updates easily
  const updateField = (field: string, value: any) => {
    onUpdateElement({
      ...selectedElement,
      [field]: value
    });
  };

  // Image upload handler
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        updateField('url', event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <aside className="w-80 bg-[#1f1f23] border-l border-[#2d2d34] flex flex-col h-full text-neutral-200 shrink-0 select-none overflow-hidden">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between p-3 border-b border-[#2d2d34] bg-[#1a1a1e]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold uppercase text-blue-400">
            {selectedElement.type}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => updateField('locked', !selectedElement.locked)}
            className={`p-1.5 rounded transition-colors ${
              selectedElement.locked
                ? 'bg-amber-500/20 text-amber-400'
                : 'text-neutral-400 hover:text-white hover:bg-[#2c2c36]'
            }`}
            title={selectedElement.locked ? 'Desbloquear elemento' : 'Bloquear elemento'}
          >
            {selectedElement.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => onDuplicateElement(selectedElement)}
            className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-[#2c2c36]"
            title="Duplicar elemento"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onBringToFront(selectedElement.id)}
            className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-[#2c2c36]"
            title="Traer al frente"
          >
            <BringToFront className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onSendToBack(selectedElement.id)}
            className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-[#2c2c36]"
            title="Enviar al fondo"
          >
            <SendToBack className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onDeleteElement(selectedElement.id)}
            className="p-1.5 rounded text-neutral-400 hover:text-red-400 hover:bg-[#2c2c36]"
            title="Eliminar elemento"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Geometry & Position */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
            Posición y Dimensiones
          </span>
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div className="bg-[#282830] p-1.5 rounded border border-[#373744]">
              <span className="text-[9px] text-neutral-400 block font-mono">X</span>
              <input
                type="number"
                value={selectedElement.x}
                onChange={(e) => updateField('x', parseInt(e.target.value) || 0)}
                className="w-full bg-transparent text-white font-mono text-xs focus:outline-hidden"
              />
            </div>
            <div className="bg-[#282830] p-1.5 rounded border border-[#373744]">
              <span className="text-[9px] text-neutral-400 block font-mono">Y</span>
              <input
                type="number"
                value={selectedElement.y}
                onChange={(e) => updateField('y', parseInt(e.target.value) || 0)}
                className="w-full bg-transparent text-white font-mono text-xs focus:outline-hidden"
              />
            </div>
            <div className="bg-[#282830] p-1.5 rounded border border-[#373744]">
              <span className="text-[9px] text-neutral-400 block font-mono">ANCHO</span>
              <input
                type="number"
                value={selectedElement.width}
                onChange={(e) => updateField('width', parseInt(e.target.value) || 10)}
                className="w-full bg-transparent text-white font-mono text-xs focus:outline-hidden"
              />
            </div>
            <div className="bg-[#282830] p-1.5 rounded border border-[#373744]">
              <span className="text-[9px] text-neutral-400 block font-mono">ALTO</span>
              <input
                type="number"
                value={selectedElement.height}
                onChange={(e) => updateField('height', parseInt(e.target.value) || 10)}
                className="w-full bg-transparent text-white font-mono text-xs focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* TYPOGRAPHY CONTROLS (If element has text) */}
        {'fontFamily' in selectedElement && (
          <div className="space-y-3 pt-2 border-t border-[#2d2d34]">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                Gestión Tipográfica
              </span>
              <Type className="w-3.5 h-3.5 text-neutral-400" />
            </div>

            {/* Presets */}
            <div className="space-y-1">
              <label className="text-xs text-neutral-400">Estilos Tipográficos Rápidos</label>
              <select
                onChange={(e) => {
                  const preset = TYPOGRAPHY_PRESETS.find(p => p.id === e.target.value);
                  if (preset) {
                    onUpdateElement({
                      ...selectedElement,
                      fontFamily: preset.fontFamily,
                      fontSize: preset.fontSize,
                      lineHeight: preset.lineHeight,
                      letterSpacing: preset.letterSpacing,
                      ...(preset.textAlign && { textAlign: preset.textAlign as any })
                    });
                  }
                }}
                defaultValue=""
                className="w-full bg-[#282830] border border-[#373744] text-white text-xs rounded p-2 focus:outline-hidden focus:border-blue-500"
              >
                <option value="" disabled>Seleccionar preset editorial...</option>
                {TYPOGRAPHY_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Font Family selector */}
            <div className="space-y-1">
              <label className="text-xs text-neutral-400">Familia Tipográfica</label>
              <select
                value={(selectedElement as any).fontFamily}
                onChange={(e) => updateField('fontFamily', e.target.value)}
                className="w-full bg-[#282830] border border-[#373744] text-white text-xs rounded p-2 focus:outline-hidden focus:border-blue-500"
              >
                {EDITORIAL_FONTS.map((f) => (
                  <option key={f.name} value={f.family}>
                    {f.name} ({f.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Font Size & Line Height sliders */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-neutral-400">
                  <span>Tamaño (Cuerpo)</span>
                  <span className="font-mono text-white">{(selectedElement as any).fontSize}px</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={72}
                  value={(selectedElement as any).fontSize}
                  onChange={(e) => updateField('fontSize', parseInt(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              {'lineHeight' in selectedElement && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-neutral-400">
                    <span>Interlineado</span>
                    <span className="font-mono text-white">{(selectedElement as any).lineHeight}</span>
                  </div>
                  <input
                    type="range"
                    min={0.9}
                    max={2.0}
                    step={0.05}
                    value={(selectedElement as any).lineHeight}
                    onChange={(e) => updateField('lineHeight', parseFloat(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </div>
              )}
            </div>

            {/* Alignment buttons */}
            {'textAlign' in selectedElement && (
              <div className="space-y-1">
                <label className="text-[11px] text-neutral-400">Alineación Periodística</label>
                <div className="grid grid-cols-4 gap-1 p-1 bg-[#282830] rounded border border-[#373744]">
                  <button
                    onClick={() => updateField('textAlign', 'left')}
                    className={`p-1.5 rounded flex justify-center ${
                      (selectedElement as any).textAlign === 'left'
                        ? 'bg-blue-600 text-white'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                    title="Alinear a la izquierda"
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => updateField('textAlign', 'center')}
                    className={`p-1.5 rounded flex justify-center ${
                      (selectedElement as any).textAlign === 'center'
                        ? 'bg-blue-600 text-white'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                    title="Centrar"
                  >
                    <AlignCenter className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => updateField('textAlign', 'right')}
                    className={`p-1.5 rounded flex justify-center ${
                      (selectedElement as any).textAlign === 'right'
                        ? 'bg-blue-600 text-white'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                    title="Alinear a la derecha"
                  >
                    <AlignRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => updateField('textAlign', 'justify')}
                    className={`p-1.5 rounded flex justify-center ${
                      (selectedElement as any).textAlign === 'justify'
                        ? 'bg-blue-600 text-white'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                    title="Justificación de Columna"
                  >
                    <AlignJustify className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SPECIFIC: ARTICLE CONTROLS */}
        {selectedElement.type === 'article' && (
          <div className="space-y-3 pt-2 border-t border-[#2d2d34]">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                Columnas y Estilo de Noticia
              </span>
              <Columns className="w-3.5 h-3.5 text-blue-400" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-neutral-300">
                <span>Número de Columnas</span>
                <span className="font-mono text-blue-400">{selectedElement.columns} columnas</span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => updateField('columns', num)}
                    className={`py-1.5 text-xs rounded font-mono ${
                      selectedElement.columns === num
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-[#282830] text-neutral-400 hover:text-white'
                    }`}
                  >
                    {num} col
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-neutral-300">
                <span>Separación entre columnas</span>
                <span className="font-mono text-blue-400">{selectedElement.columnGap}px</span>
              </div>
              <input
                type="range"
                min={8}
                max={32}
                value={selectedElement.columnGap}
                onChange={(e) => updateField('columnGap', parseInt(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <label className="flex items-center gap-2 p-2 rounded bg-[#282830] border border-[#373744] text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedElement.dropCap}
                  onChange={(e) => updateField('dropCap', e.target.checked)}
                  className="accent-blue-600"
                />
                <span>Letra Capital</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded bg-[#282830] border border-[#373744] text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedElement.showColumnDividers}
                  onChange={(e) => updateField('showColumnDividers', e.target.checked)}
                  className="accent-blue-600"
                />
                <span>Filetes divisorios</span>
              </label>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-neutral-400">Titular de la Noticia</label>
              <input
                type="text"
                value={selectedElement.headline || ''}
                onChange={(e) => updateField('headline', e.target.value)}
                placeholder="Título del artículo..."
                className="w-full bg-[#282830] border border-[#373744] text-white text-xs rounded p-2 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-neutral-400">Cuerpo del Artículo (Párrafos con doble salto)</label>
              <textarea
                rows={6}
                value={selectedElement.body}
                onChange={(e) => updateField('body', e.target.value)}
                className="w-full bg-[#282830] border border-[#373744] text-white text-xs rounded p-2 focus:outline-hidden font-serif"
              />
            </div>
          </div>
        )}

        {/* SPECIFIC: HEADLINE CONTROLS */}
        {selectedElement.type === 'headline' && (
          <div className="space-y-3 pt-2 border-t border-[#2d2d34]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
              Contenido del Titular
            </span>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs text-neutral-400">Antetítulo / Kicker</label>
                <input
                  type="checkbox"
                  checked={selectedElement.showKicker}
                  onChange={(e) => updateField('showKicker', e.target.checked)}
                  className="accent-blue-600"
                />
              </div>
              <input
                type="text"
                value={selectedElement.kicker}
                onChange={(e) => updateField('kicker', e.target.value)}
                className="w-full bg-[#282830] border border-[#373744] text-white text-xs rounded p-2 focus:outline-hidden uppercase font-sans"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-neutral-400">Titular Principal</label>
              <textarea
                rows={3}
                value={selectedElement.headline}
                onChange={(e) => updateField('headline', e.target.value)}
                className="w-full bg-[#282830] border border-[#373744] text-white text-xs rounded p-2 focus:outline-hidden font-serif font-bold"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs text-neutral-400">Subtítulo / Bajada</label>
                <input
                  type="checkbox"
                  checked={selectedElement.showSubtitle}
                  onChange={(e) => updateField('showSubtitle', e.target.checked)}
                  className="accent-blue-600"
                />
              </div>
              <textarea
                rows={2}
                value={selectedElement.subtitle}
                onChange={(e) => updateField('subtitle', e.target.value)}
                className="w-full bg-[#282830] border border-[#373744] text-white text-xs rounded p-2 focus:outline-hidden font-serif italic"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] text-neutral-400">Firma / Autor</label>
                <input
                  type="text"
                  value={selectedElement.byline}
                  onChange={(e) => updateField('byline', e.target.value)}
                  className="w-full bg-[#282830] border border-[#373744] text-white text-xs rounded p-1.5 focus:outline-hidden"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-neutral-400">Lugar / Fecha</label>
                <input
                  type="text"
                  value={selectedElement.date}
                  onChange={(e) => updateField('date', e.target.value)}
                  className="w-full bg-[#282830] border border-[#373744] text-white text-xs rounded p-1.5 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        )}

        {/* SPECIFIC: MASTHEAD CONTROLS */}
        {selectedElement.type === 'masthead' && (
          <div className="space-y-3 pt-2 border-t border-[#2d2d34]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
              Datos de la Cabecera
            </span>

            <div className="space-y-1">
              <label className="text-xs text-neutral-400">Nombre del Periódico</label>
              <input
                type="text"
                value={selectedElement.newspaperName}
                onChange={(e) => updateField('newspaperName', e.target.value)}
                className="w-full bg-[#282830] border border-[#373744] text-white text-xs rounded p-2 focus:outline-hidden font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-neutral-400">Lema / Subtítulo</label>
              <input
                type="text"
                value={selectedElement.motto}
                onChange={(e) => updateField('motto', e.target.value)}
                className="w-full bg-[#282830] border border-[#373744] text-white text-xs rounded p-2 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] text-neutral-400">Fecha de Edición</label>
                <input
                  type="text"
                  value={selectedElement.editionDate}
                  onChange={(e) => updateField('editionDate', e.target.value)}
                  className="w-full bg-[#282830] border border-[#373744] text-white text-xs rounded p-1.5 focus:outline-hidden"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-neutral-400">Número / Año</label>
                <input
                  type="text"
                  value={selectedElement.editionNumber}
                  onChange={(e) => updateField('editionNumber', e.target.value)}
                  className="w-full bg-[#282830] border border-[#373744] text-white text-xs rounded p-1.5 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] text-neutral-400">Precio</label>
                <input
                  type="text"
                  value={selectedElement.price}
                  onChange={(e) => updateField('price', e.target.value)}
                  className="w-full bg-[#282830] border border-[#373744] text-white text-xs rounded p-1.5 focus:outline-hidden"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-neutral-400">Sección</label>
                <input
                  type="text"
                  value={selectedElement.section}
                  onChange={(e) => updateField('section', e.target.value)}
                  className="w-full bg-[#282830] border border-[#373744] text-white text-xs rounded p-1.5 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        )}

        {/* SPECIFIC: IMAGE CONTROLS */}
        {selectedElement.type === 'image' && (
          <div className="space-y-3 pt-2 border-t border-[#2d2d34]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
              Fotoperiodismo & Ajustes
            </span>

            <div className="space-y-1">
              <label className="text-xs text-neutral-400">URL de Imagen</label>
              <input
                type="text"
                value={selectedElement.url}
                onChange={(e) => updateField('url', e.target.value)}
                className="w-full bg-[#282830] border border-[#373744] text-white text-xs rounded p-2 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-neutral-400">Subir imagen desde equipo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="w-full text-xs text-neutral-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-blue-600 file:text-white hover:file:bg-blue-700"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-neutral-400">Pie de Foto Informativo</label>
              <textarea
                rows={2}
                value={selectedElement.caption}
                onChange={(e) => updateField('caption', e.target.value)}
                className="w-full bg-[#282830] border border-[#373744] text-white text-xs rounded p-2 focus:outline-hidden font-serif"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-neutral-400">Crédito Fotográfico</label>
              <input
                type="text"
                value={selectedElement.credit}
                onChange={(e) => updateField('credit', e.target.value)}
                placeholder="Foto: Agencia / Autor"
                className="w-full bg-[#282830] border border-[#373744] text-white text-xs rounded p-2 focus:outline-hidden font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <label className="flex items-center gap-2 p-2 rounded bg-[#282830] border border-[#373744] text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedElement.grayscale}
                  onChange={(e) => updateField('grayscale', e.target.checked)}
                  className="accent-blue-600"
                />
                <span>Blanco y Negro</span>
              </label>

              <select
                value={selectedElement.objectFit}
                onChange={(e) => updateField('objectFit', e.target.value as any)}
                className="bg-[#282830] border border-[#373744] text-white text-xs rounded p-2 focus:outline-hidden"
              >
                <option value="cover">Ajuste Cover</option>
                <option value="contain">Ajuste Contain</option>
              </select>
            </div>
          </div>
        )}

        {/* SPECIFIC: QUOTE CONTROLS */}
        {selectedElement.type === 'quote' && (
          <div className="space-y-3 pt-2 border-t border-[#2d2d34]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
              Cita Editorial
            </span>

            <div className="space-y-1">
              <label className="text-xs text-neutral-400">Frase / Cita</label>
              <textarea
                rows={3}
                value={selectedElement.quote}
                onChange={(e) => updateField('quote', e.target.value)}
                className="w-full bg-[#282830] border border-[#373744] text-white text-xs rounded p-2 focus:outline-hidden font-serif italic"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] text-neutral-400">Autor</label>
                <input
                  type="text"
                  value={selectedElement.author}
                  onChange={(e) => updateField('author', e.target.value)}
                  className="w-full bg-[#282830] border border-[#373744] text-white text-xs rounded p-1.5 focus:outline-hidden font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-neutral-400">Cargo / Rol</label>
                <input
                  type="text"
                  value={selectedElement.role}
                  onChange={(e) => updateField('role', e.target.value)}
                  className="w-full bg-[#282830] border border-[#373744] text-white text-xs rounded p-1.5 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-neutral-400">Estilo de Enmarcado</label>
              <select
                value={selectedElement.borderStyle}
                onChange={(e) => updateField('borderStyle', e.target.value as any)}
                className="w-full bg-[#282830] border border-[#373744] text-white text-xs rounded p-2 focus:outline-hidden"
              >
                <option value="ornate-quotes">Comillas Floridas</option>
                <option value="left-bar">Barra Lateral</option>
                <option value="top-bottom">Filetes Superior e Inferior</option>
                <option value="minimal">Minimalista</option>
              </select>
            </div>
          </div>
        )}

        {/* SPECIFIC: BOX CONTROLS */}
        {selectedElement.type === 'box' && (
          <div className="space-y-3 pt-2 border-t border-[#2d2d34]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
              Cuadro Informativo / Destacados
            </span>

            <div className="space-y-1">
              <label className="text-xs text-neutral-400">Etiqueta Superior (Badge)</label>
              <input
                type="text"
                value={selectedElement.badgeText || ''}
                onChange={(e) => updateField('badgeText', e.target.value)}
                className="w-full bg-[#282830] border border-[#373744] text-white text-xs rounded p-2 focus:outline-hidden uppercase font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-neutral-400">Título del Cuadro</label>
              <input
                type="text"
                value={selectedElement.title}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full bg-[#282830] border border-[#373744] text-white text-xs rounded p-2 focus:outline-hidden font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-neutral-400">Contenido o Puntos Clave</label>
              <textarea
                rows={4}
                value={selectedElement.content}
                onChange={(e) => updateField('content', e.target.value)}
                className="w-full bg-[#282830] border border-[#373744] text-white text-xs rounded p-2 focus:outline-hidden font-serif"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-neutral-400">Fondo del Cuadro</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { name: 'Gris Claro', color: '#f8fafc' },
                  { name: 'Rojo Alerta', color: '#fef2f2' },
                  { name: 'Salmón', color: '#fef3c7' },
                  { name: 'Blanco', color: '#ffffff' }
                ].map((c) => (
                  <button
                    key={c.color}
                    onClick={() => updateField('bgColor', c.color)}
                    className={`h-7 rounded border ${
                      selectedElement.bgColor === c.color ? 'ring-2 ring-blue-500 border-white' : 'border-neutral-700'
                    }`}
                    style={{ backgroundColor: c.color }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SPECIFIC: DIVIDER CONTROLS */}
        {selectedElement.type === 'divider' && (
          <div className="space-y-3 pt-2 border-t border-[#2d2d34]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
              Filete / Separador
            </span>

            <div className="space-y-1">
              <label className="text-xs text-neutral-400">Estilo de Trazo</label>
              <select
                value={selectedElement.style}
                onChange={(e) => updateField('style', e.target.value as any)}
                className="w-full bg-[#282830] border border-[#373744] text-white text-xs rounded p-2 focus:outline-hidden"
              >
                <option value="solid">Línea Sólida Simple</option>
                <option value="double">Doble Línea de Portada</option>
                <option value="dashed">Discontinua (Dashed)</option>
                <option value="dotted">Punteada (Dotted)</option>
                <option value="ornate">Floritura Editorial (♦ ♦ ♦)</option>
              </select>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-neutral-300">
                <span>Grosor del Trazo</span>
                <span className="font-mono text-blue-400">{selectedElement.thickness}px</span>
              </div>
              <input
                type="range"
                min={1}
                max={8}
                value={selectedElement.thickness}
                onChange={(e) => updateField('thickness', parseInt(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
