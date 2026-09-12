import React from 'react';

interface Props {
  width: number;
  height: number;
  zoom: number;
  cursorPos?: { x: number; y: number } | null;
}

export const TopRuler: React.FC<Props> = ({ width, zoom, cursorPos }) => {
  const step = 50; // pixels per major tick
  const ticksCount = Math.ceil(width / step);

  return (
    <div
      className="h-5 bg-[#18181b] border-b border-[#27272a] relative overflow-hidden text-[9px] text-[#71717a] font-mono select-none"
      style={{ width: `${width * zoom}px` }}
    >
      {Array.from({ length: ticksCount + 1 }).map((_, i) => {
        const xPos = i * step * zoom;
        return (
          <div
            key={i}
            className="absolute top-0 bottom-0 border-l border-[#3f3f46]"
            style={{ left: `${xPos}px` }}
          >
            <span className="pl-1 pt-0.5 inline-block leading-none">{i * step}</span>
          </div>
        );
      })}

      {cursorPos && (
        <div
          className="absolute top-0 bottom-0 w-[1px] bg-red-500 z-10 pointer-events-none"
          style={{ left: `${cursorPos.x * zoom}px` }}
        />
      )}
    </div>
  );
};

export const LeftRuler: React.FC<Props> = ({ height, zoom, cursorPos }) => {
  const step = 50;
  const ticksCount = Math.ceil(height / step);

  return (
    <div
      className="w-5 bg-[#18181b] border-r border-[#27272a] relative overflow-hidden text-[9px] text-[#71717a] font-mono select-none"
      style={{ height: `${height * zoom}px` }}
    >
      {Array.from({ length: ticksCount + 1 }).map((_, i) => {
        const yPos = i * step * zoom;
        return (
          <div
            key={i}
            className="absolute left-0 right-0 border-t border-[#3f3f46]"
            style={{ top: `${yPos}px` }}
          >
            <span className="block pt-0.5 transform -rotate-90 origin-top-left translate-x-3 text-[8px] leading-none">
              {i * step}
            </span>
          </div>
        );
      })}

      {cursorPos && (
        <div
          className="absolute left-0 right-0 h-[1px] bg-red-500 z-10 pointer-events-none"
          style={{ top: `${cursorPos.y * zoom}px` }}
        />
      )}
    </div>
  );
};
