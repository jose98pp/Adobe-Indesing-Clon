import React from 'react';
import { Collaborator } from '../types';

interface Props {
  collaborators: Collaborator[];
  zoom: number;
}

export const CollaboratorCursors: React.FC<Props> = ({ collaborators }) => {
  return (
    <div data-cursor="collaborator" className="absolute inset-0 pointer-events-none z-50 overflow-visible">
      {collaborators.map((collab) => {
        if (!collab.cursor) return null;
        return (
          <div
            key={collab.id}
            className="absolute transition-all duration-75 ease-out pointer-events-none flex items-start gap-1"
            style={{
              transform: `translate(${collab.cursor.x}px, ${collab.cursor.y}px)`
            }}
          >
            {/* Custom vector editorial cursor */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill={collab.color}
              stroke="#ffffff"
              strokeWidth="1.5"
              className="drop-shadow-md"
            >
              <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.85a.5.5 0 0 0-.85.36z" />
            </svg>

            {/* Name pill */}
            <div
              className="text-[10px] font-semibold text-white px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap -mt-1 font-sans flex items-center gap-1"
              style={{ backgroundColor: collab.color }}
            >
              <span>{collab.name}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
