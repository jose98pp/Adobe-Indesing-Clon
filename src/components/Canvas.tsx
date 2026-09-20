import React, { useRef, useState, useEffect, useCallback } from 'react';
import { NewspaperProject, NewspaperElement, Collaborator } from '../types';
import { NewspaperElementRenderer } from './NewspaperElementRenderer';
import { CollaboratorCursors } from './CollaboratorCursors';
import { TopRuler, LeftRuler } from './Rulers';

interface Props {
  project: NewspaperProject;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (updated: NewspaperElement) => void;
  onDeleteElement: (id: string) => void;
  zoom: number;
  showGrid: boolean;
  showRulers: boolean;
  showBleed: boolean;
  snapToGrid: boolean;
  collaborators: Collaborator[];
  onCursorMove: (x: number, y: number) => void;
}

type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

export const Canvas: React.FC<Props> = ({
  project,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  zoom,
  showGrid,
  showRulers,
  showBleed,
  snapToGrid,
  collaborators,
  onCursorMove
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const artboardRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeHandle, setActiveHandle] = useState<ResizeHandle | null>(null);
  const [resizeInitial, setResizeInitial] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
    mouseX: number;
    mouseY: number;
  } | null>(null);

  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);

  const selectedElement = project.elements.find(el => el.id === selectedElementId);

  // Column snap calculation
  const getSnapX = useCallback((rawX: number): number => {
    if (!snapToGrid) return Math.round(rawX);

    const margin = project.margin;
    const availableWidth = project.width - margin * 2;
    const colCount = project.gridColumns;
    const gutter = project.gridGutter;
    const columnWidth = (availableWidth - gutter * (colCount - 1)) / colCount;

    const snapPoints: number[] = [margin, project.width - margin];

    for (let i = 0; i < colCount; i++) {
      const colStart = margin + i * (columnWidth + gutter);
      const colEnd = colStart + columnWidth;
      snapPoints.push(colStart, colEnd);
    }

    const threshold = 10;
    for (const pt of snapPoints) {
      if (Math.abs(rawX - pt) <= threshold) {
        return Math.round(pt);
      }
    }

    // Grid module 8px snap
    return Math.round(rawX / 8) * 8;
  }, [snapToGrid, project]);

  const getSnapY = useCallback((rawY: number): number => {
    if (!snapToGrid) return Math.round(rawY);
    // Vertical baseline snap (8px grid)
    return Math.round(rawY / 8) * 8;
  }, [snapToGrid]);

  // Handle pointer down on an element (Drag start)
  const handleElementMouseDown = (e: React.MouseEvent, element: NewspaperElement) => {
    e.stopPropagation();
    onSelectElement(element.id);

    if (element.locked) {
      return;
    }

    if (!artboardRef.current) return;
    const artboardRect = artboardRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - artboardRect.left) / zoom;
    const mouseY = (e.clientY - artboardRect.top) / zoom;

    setIsDragging(true);
    setDragOffset({
      x: mouseX - element.x,
      y: mouseY - element.y
    });
  };

  // Handle pointer down on a resize handle
  const handleResizeMouseDown = (e: React.MouseEvent, handle: ResizeHandle) => {
    e.stopPropagation();
    if (!selectedElement || selectedElement.locked || !artboardRef.current) return;

    const artboardRect = artboardRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - artboardRect.left) / zoom;
    const mouseY = (e.clientY - artboardRect.top) / zoom;

    setActiveHandle(handle);
    setResizeInitial({
      x: selectedElement.x,
      y: selectedElement.y,
      width: selectedElement.width,
      height: selectedElement.height,
      mouseX,
      mouseY
    });
  };

  // Global mouse move & mouse up listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!artboardRef.current) return;
      const rect = artboardRef.current.getBoundingClientRect();
      const currentMouseX = (e.clientX - rect.left) / zoom;
      const currentMouseY = (e.clientY - rect.top) / zoom;

      // Update cursor coordinate display & notify collaboration
      setCursorPos({ x: Math.max(0, currentMouseX), y: Math.max(0, currentMouseY) });
      onCursorMove(currentMouseX, currentMouseY);

      // Handle element dragging
      if (isDragging && selectedElement && !selectedElement.locked) {
        const targetX = currentMouseX - dragOffset.x;
        const targetY = currentMouseY - dragOffset.y;

        const snappedX = Math.max(0, Math.min(project.width - selectedElement.width, getSnapX(targetX)));
        const snappedY = Math.max(0, Math.min(project.height - selectedElement.height, getSnapY(targetY)));

        onUpdateElement({
          ...selectedElement,
          x: snappedX,
          y: snappedY
        });
      }

      // Handle element resizing
      if (activeHandle && resizeInitial && selectedElement && !selectedElement.locked) {
        const deltaX = currentMouseX - resizeInitial.mouseX;
        const deltaY = currentMouseY - resizeInitial.mouseY;

        let newX = resizeInitial.x;
        let newY = resizeInitial.y;
        let newWidth = resizeInitial.width;
        let newHeight = resizeInitial.height;

        const minW = 60;
        const minH = 20;

        if (activeHandle.includes('e')) {
          newWidth = Math.max(minW, resizeInitial.width + deltaX);
        }
        if (activeHandle.includes('s')) {
          newHeight = Math.max(minH, resizeInitial.height + deltaY);
        }
        if (activeHandle.includes('w')) {
          const maxDeltaW = resizeInitial.width - minW;
          const appliedDelta = Math.min(deltaX, maxDeltaW);
          newWidth = resizeInitial.width - appliedDelta;
          newX = resizeInitial.x + appliedDelta;
        }
        if (activeHandle.includes('n')) {
          const maxDeltaH = resizeInitial.height - minH;
          const appliedDelta = Math.min(deltaY, maxDeltaH);
          newHeight = resizeInitial.height - appliedDelta;
          newY = resizeInitial.y + appliedDelta;
        }

        onUpdateElement({
          ...selectedElement,
          x: getSnapX(newX),
          y: getSnapY(newY),
          width: Math.round(newWidth),
          height: Math.round(newHeight)
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setActiveHandle(null);
      setResizeInitial(null);
    };

    if (isDragging || activeHandle) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    isDragging,
    activeHandle,
    dragOffset,
    resizeInitial,
    selectedElement,
    zoom,
    project,
    getSnapX,
    getSnapY,
    onUpdateElement,
    onCursorMove
  ]);

  // Keyboard navigation & deletion
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedElement) return;

      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (!selectedElement.locked) {
          e.preventDefault();
          onDeleteElement(selectedElement.id);
        }
      } else if (e.key === 'Escape') {
        onSelectElement(null);
      } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        if (selectedElement.locked) return;
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        let deltaX = 0;
        let deltaY = 0;
        if (e.key === 'ArrowUp') deltaY = -step;
        if (e.key === 'ArrowDown') deltaY = step;
        if (e.key === 'ArrowLeft') deltaX = -step;
        if (e.key === 'ArrowRight') deltaX = step;

        onUpdateElement({
          ...selectedElement,
          x: Math.max(0, Math.min(project.width - selectedElement.width, selectedElement.x + deltaX)),
          y: Math.max(0, Math.min(project.height - selectedElement.height, selectedElement.y + deltaY))
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, onDeleteElement, onSelectElement, onUpdateElement, project]);

  // Compute column guide lines
  const columnGuides = [];
  if (showGrid) {
    const margin = project.margin;
    const availableW = project.width - margin * 2;
    const colW = (availableW - project.gridGutter * (project.gridColumns - 1)) / project.gridColumns;

    for (let i = 0; i < project.gridColumns; i++) {
      const colX = margin + i * (colW + project.gridGutter);
      columnGuides.push({
        id: `col-${i}`,
        x: colX,
        width: colW
      });
    }
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 h-full bg-[#18181b] overflow-auto relative flex flex-col select-none"
      onClick={() => onSelectElement(null)}
    >
      {/* Top Ruler Bar */}
      {showRulers && (
        <div className="sticky top-0 z-30 flex bg-[#18181b] shadow-xs">
          <div className="w-5 h-5 bg-[#18181b] border-r border-b border-[#27272a] shrink-0" />
          <TopRuler width={project.width} zoom={zoom} cursorPos={cursorPos} />
        </div>
      )}

      <div className="flex flex-1 relative min-h-full">
        {/* Left Ruler Bar */}
        {showRulers && (
          <div className="sticky left-0 z-20 shrink-0">
            <LeftRuler height={project.height} zoom={zoom} cursorPos={cursorPos} />
          </div>
        )}

        {/* Artboard Workspace Area */}
        <div className="flex-1 p-12 flex justify-center items-start min-w-max">
          <div
            ref={artboardRef}
            id="newspaper-artboard"
            className="relative shadow-2xl transition-all duration-75 origin-top"
            style={{
              width: `${project.width}px`,
              height: `${project.height}px`,
              backgroundColor: project.backgroundColor || '#fdfbf7',
              transform: `scale(${zoom})`,
              transformOrigin: 'top center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Bleed Guide (3mm red perimeter) */}
            {showBleed && (
              <div
                className="absolute -inset-3 border border-dashed border-red-500/60 pointer-events-none z-40"
                title="Línea de Sangre de Imprenta (3mm)"
              >
                <span className="absolute -top-3 left-1 text-[8px] font-mono text-red-500 bg-[#18181b] px-1">
                  SANGRE 3mm
                </span>
              </div>
            )}

            {/* Margin Guides (Purple editorial margins) */}
            {showGrid && (
              <div
                className="absolute border border-purple-400/40 pointer-events-none z-30"
                style={{
                  top: `${project.margin}px`,
                  left: `${project.margin}px`,
                  right: `${project.margin}px`,
                  bottom: `${project.margin}px`
                }}
              />
            )}

            {/* Column Guides (Cyan InDesign-style vertical guides) */}
            {showGrid && (
              <div className="absolute inset-0 pointer-events-none z-20">
                {columnGuides.map((col) => (
                  <div
                    key={col.id}
                    className="absolute top-0 bottom-0 bg-cyan-500/5 border-l border-r border-cyan-400/20"
                    style={{
                      left: `${col.x}px`,
                      width: `${col.width}px`
                    }}
                  />
                ))}
              </div>
            )}

            {/* Remote Collaborators Live Cursors */}
            <CollaboratorCursors collaborators={collaborators} zoom={zoom} />

            {/* Render Elements */}
            {project.elements.map((element) => {
              if (element.hidden) return null;
              const isSelected = element.id === selectedElementId;
              
              // Check if any collaborator is focusing on this element
              const remoteEditor = collaborators.find(c => c.activeElementId === element.id);

              return (
                <div
                  key={element.id}
                  className={`absolute group ${
                    element.locked ? 'cursor-default' : 'cursor-move'
                  } ${
                    isSelected
                      ? element.locked
                        ? 'ring-2 ring-amber-500 ring-offset-1 z-40'
                        : 'ring-2 ring-blue-600 ring-offset-1 z-40'
                      : remoteEditor
                      ? 'ring-2 ring-offset-1 z-30'
                      : 'hover:ring-1 hover:ring-blue-400/50'
                  }`}
                  style={{
                    left: `${element.x}px`,
                    top: `${element.y}px`,
                    width: `${element.width}px`,
                    height: `${element.height}px`,
                    zIndex: element.zIndex,
                    ringColor: remoteEditor ? remoteEditor.color : undefined
                  }}
                  onMouseDown={(e) => handleElementMouseDown(e, element)}
                >
                  {/* Remote editor badge */}
                  {remoteEditor && !isSelected && (
                    <div
                      className="absolute -top-4 left-0 text-[9px] font-semibold text-white px-1.5 rounded-t font-sans whitespace-nowrap"
                      style={{ backgroundColor: remoteEditor.color }}
                    >
                      {remoteEditor.name} está editando
                    </div>
                  )}

                  {/* Element Content */}
                  <NewspaperElementRenderer element={element} isSelected={isSelected} />

                  {/* Locked indicator badge */}
                  {element.locked && (
                    <div className="absolute top-1 right-1 bg-neutral-900/90 text-amber-300 text-[9px] px-1.5 py-0.5 rounded font-mono flex items-center gap-1 shadow-sm border border-amber-500/30 z-50 pointer-events-none select-none">
                      🔒 Bloqueado
                    </div>
                  )}

                  {/* Resize Handles (when selected and not locked) */}
                  {isSelected && !element.locked && (
                    <>
                      {/* Top-Left */}
                      <div
                        className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-600 cursor-nwse-resize z-50 shadow-sm"
                        onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}
                      />
                      {/* Top-Center */}
                      <div
                        className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-blue-600 cursor-ns-resize z-50 shadow-sm"
                        onMouseDown={(e) => handleResizeMouseDown(e, 'n')}
                      />
                      {/* Top-Right */}
                      <div
                        className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-600 cursor-nesw-resize z-50 shadow-sm"
                        onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}
                      />
                      {/* Middle-Right */}
                      <div
                        className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3 h-3 bg-white border-2 border-blue-600 cursor-ew-resize z-50 shadow-sm"
                        onMouseDown={(e) => handleResizeMouseDown(e, 'e')}
                      />
                      {/* Bottom-Right */}
                      <div
                        className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-600 cursor-nwse-resize z-50 shadow-sm"
                        onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
                      />
                      {/* Bottom-Center */}
                      <div
                        className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-blue-600 cursor-ns-resize z-50 shadow-sm"
                        onMouseDown={(e) => handleResizeMouseDown(e, 's')}
                      />
                      {/* Bottom-Left */}
                      <div
                        className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-600 cursor-nesw-resize z-50 shadow-sm"
                        onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
                      />
                      {/* Middle-Left */}
                      <div
                        className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3 h-3 bg-white border-2 border-blue-600 cursor-ew-resize z-50 shadow-sm"
                        onMouseDown={(e) => handleResizeMouseDown(e, 'w')}
                      />

                      {/* Dimension floating pill */}
                      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-neutral-900/90 text-white text-[9px] font-mono px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-50">
                        {element.width} × {element.height} px
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
