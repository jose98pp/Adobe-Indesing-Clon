import React from 'react';
import { Plus, Copy, Trash2, BookOpen, Layers, ChevronLeft, ChevronRight } from 'lucide-react';
import { EditorialPage, NewspaperElement } from '../types';

interface Props {
  pages: EditorialPage[];
  activePageIndex: number;
  onSelectPage: (index: number) => void;
  onAddPage: () => void;
  onDuplicatePage: (index: number) => void;
  onDeletePage: (index: number) => void;
  activeElementsCount: number;
}

export const PageNavigator: React.FC<Props> = ({
  pages,
  activePageIndex,
  onSelectPage,
  onAddPage,
  onDuplicatePage,
  onDeletePage,
  activeElementsCount
}) => {
  if (!pages || pages.length <= 1) {
    return null;
  }

  return (
    <div 
      className="bg-white/95 backdrop-blur-md border border-neutral-300 shadow-lg rounded-xl px-3 py-2 flex items-center gap-3 z-30 pointer-events-auto"
      role="region"
      aria-label="Navegador de pliegos y páginas de la edición"
    >
      {/* Label and Page indicator */}
      <div className="flex items-center gap-1.5 pr-2 border-r border-neutral-200 text-xs font-bold text-slate-800">
        <BookOpen className="w-3.5 h-3.5 text-slate-600" />
        <span className="hidden sm:inline">Páginas:</span>
        <span className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[11px] text-slate-700">
          {activePageIndex + 1} / {pages.length}
        </span>
      </div>

      {/* Prev button */}
      <button
        onClick={() => onSelectPage(Math.max(0, activePageIndex - 1))}
        disabled={activePageIndex === 0}
        className="p-1 text-neutral-500 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors"
        title="Página anterior"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Pages Thumbnails / Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto max-w-[360px] sm:max-w-md py-0.5 scrollbar-none">
        {pages.map((page, idx) => {
          const isActive = idx === activePageIndex;
          return (
            <button
              key={page.id || `p-${idx}`}
              onClick={() => onSelectPage(idx)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                isActive
                  ? 'bg-slate-900 text-white font-bold shadow-xs'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
              }`}
            >
              <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-mono ${
                isActive ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-neutral-300 text-neutral-700'
              }`}>
                {idx + 1}
              </span>
              <span className="text-[11px] truncate max-w-[90px]">
                {page.section || page.title || `Página ${idx + 1}`}
              </span>
              {isActive && (
                <span className="text-[9px] opacity-75 font-mono">
                  ({activeElementsCount})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Next button */}
      <button
        onClick={() => onSelectPage(Math.min(pages.length - 1, activePageIndex + 1))}
        disabled={activePageIndex === pages.length - 1}
        className="p-1 text-neutral-500 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors"
        title="Página siguiente"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Action buttons (Add, Duplicate, Delete) */}
      <div className="flex items-center gap-1 pl-2 border-l border-neutral-200">
        <button
          onClick={onAddPage}
          className="p-1.5 text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
          title="Añadir nueva página a la edición"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDuplicatePage(activePageIndex)}
          className="p-1.5 text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
          title="Duplicar página actual"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
        {pages.length > 1 && (
          <button
            onClick={() => onDeletePage(activePageIndex)}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Eliminar página actual"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
