import React from 'react';
import { NewspaperElement } from '../types';

interface Props {
  element: NewspaperElement;
  isSelected: boolean;
  onTextChange?: (field: string, value: string) => void;
}

export const NewspaperElementRenderer: React.FC<Props> = ({ element }) => {
  switch (element.type) {
    case 'masthead': {
      if (element.styleVariant === 'latitud-official') {
        return (
          <div className="w-full h-full flex flex-col justify-between select-none pointer-events-none bg-white p-2 font-['Montserrat',sans-serif]">
            {/* Top Bar: EDICIÓN Nº1 • SEMANA DEL 25 AL 31 DE MAYO DE 2026 */}
            <div className="flex items-center justify-between text-[11px] font-bold text-neutral-800 border-b border-neutral-300 pb-1 uppercase tracking-wider">
              <span>{element.editionNumber || 'EDICIÓN Nº1'} • {element.editionDate || 'SEMANA DEL 25 AL 31 DE MAYO DE 2026'}</span>
            </div>

            {/* Middle Main Brand: LATITUD [18] */}
            <div className="flex items-center justify-between my-auto py-1">
              <div className="flex items-center gap-2">
                <h1
                  className="font-black tracking-tight leading-none text-[#0B1F3A]"
                  style={{
                    fontFamily: element.fontFamily || "'Montserrat', sans-serif",
                    fontSize: `${element.fontSize || 56}px`
                  }}
                >
                  {element.newspaperName || 'LATITUD'}
                </h1>
                <div
                  className="bg-[#D71920] text-white font-black flex items-center justify-center rounded-xs shadow-xs px-2.5 py-1"
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: `${Math.round((element.fontSize || 56) * 0.82)}px`,
                    lineHeight: 1
                  }}
                >
                  {element.badgeNumber || '18'}
                </div>
              </div>

              {/* Slogan underneath or alongside */}
              <div className="text-right">
                <div className="text-[13px] font-extrabold tracking-[0.25em] text-[#0B1F3A] uppercase">
                  {element.motto || 'INFORMACIÓN SIN RUIDO'}
                </div>
              </div>
            </div>

            {/* Bottom Dateline / Metadata Strip */}
            <div className="flex items-center justify-between text-[10px] font-semibold text-neutral-700 border-t border-b border-neutral-300 py-1 uppercase tracking-wider">
              <div className="flex items-center gap-3">
                <span>{element.locationInfo || 'SANTA CRUZ DE LA SIERRA • BOLIVIA'}</span>
                <span>•</span>
                <span>{element.price || 'PRECIO BS 5'}</span>
                <span>•</span>
                <span>{element.section || '12 PÁGINAS'}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#0B1F3A] font-bold lowercase tracking-normal font-mono">
                  {element.websiteUrl || 'www.latitud18.com.bo'}
                </span>
                <span className="text-neutral-500 font-mono text-[9px]">
                  {element.socialHandles || 'f  𝕏  📷  ▶'}
                </span>
              </div>
            </div>
          </div>
        );
      }

      if (element.styleVariant === 'regional-banner' || element.subBadgeText || element.leftEar || element.rightEar) {
        return (
          <div className="w-full h-full flex flex-col justify-between select-none pointer-events-none">
            {/* Top row with ears and main brand */}
            <div className="flex items-stretch justify-between gap-2 flex-1 pb-1">
              {/* Left ear (e.g. Sponsor / CRE) */}
              {element.leftEar ? (
                <div
                  className="w-44 p-1.5 rounded-sm flex flex-col justify-center text-[10px] leading-tight border"
                  style={{
                    backgroundColor: element.leftEar.bgColor || '#fef9c3',
                    color: element.leftEar.textColor || '#854d0e',
                    borderColor: '#facc15'
                  }}
                >
                  <div className="font-bold text-[11px] uppercase tracking-wide">
                    {element.leftEar.title}
                  </div>
                  <div className="text-[9px] font-sans font-medium mt-0.5">
                    {element.leftEar.subtitle}
                  </div>
                </div>
              ) : <div className="w-4" />}

              {/* Center Newspaper Brand */}
              <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
                <div className="flex items-baseline justify-center gap-1.5 relative">
                  <h1
                    className="font-black tracking-tight leading-none text-sky-600 drop-shadow-xs"
                    style={{
                      fontFamily: element.fontFamily || 'Oswald',
                      fontSize: `${element.fontSize}px`,
                      color: element.accentColor || '#0284c7'
                    }}
                  >
                    {element.newspaperName}
                  </h1>

                  {/* Sub-badge pill like "del Oriente" */}
                  {element.subBadgeText && (
                    <span className="bg-red-600 text-white font-bold text-xs uppercase px-2 py-0.5 rounded-sm tracking-wide shadow-xs font-sans">
                      {element.subBadgeText}
                    </span>
                  )}
                </div>

                {element.motto && (
                  <p className="text-[9px] font-mono tracking-widest text-neutral-500 uppercase mt-0.5">
                    {element.motto}
                  </p>
                )}
              </div>

              {/* Right ear (e.g. Dollar Exchange) */}
              {element.rightEar ? (
                <div
                  className="w-44 p-1.5 rounded-sm flex flex-col justify-between text-white text-[10px] leading-tight shadow-xs"
                  style={{
                    backgroundColor: element.rightEar.bgColor || '#0284c7'
                  }}
                >
                  <div className="text-[9px] font-mono uppercase tracking-wider opacity-90">
                    {element.rightEar.title}
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black font-mono tracking-tight">
                      {element.rightEar.highlight}
                    </span>
                  </div>
                </div>
              ) : <div className="w-4" />}
            </div>

            {/* Blue dateline bar */}
            <div
              className="py-1 px-3 flex items-center justify-between text-[10.5px] font-sans font-medium text-white shadow-xs"
              style={{ backgroundColor: element.accentColor || '#0284c7' }}
            >
              <span>{element.editionDate}</span>
              <span className="font-mono text-[10px] opacity-90">{element.editionNumber}</span>
              <span>{element.section || '32 páginas'}</span>
              <span className="font-bold">{element.price}</span>
            </div>
          </div>
        );
      }

      return (
        <div className="w-full h-full flex flex-col justify-between select-none pointer-events-none p-1">
          {/* Top border bar */}
          <div className="border-b border-t py-1 flex items-center justify-between text-[11px] font-sans uppercase tracking-widest text-neutral-600"
               style={{ borderColor: element.borderColor }}>
            <span>{element.section || 'EDICIÓN GENERAL'}</span>
            <span>{element.editionDate}</span>
            <span>{element.price}</span>
          </div>

          {/* Newspaper Name */}
          <div className="text-center my-auto">
            <h1
              className="tracking-tight leading-none"
              style={{
                fontFamily: element.fontFamily,
                fontSize: `${element.fontSize}px`,
                color: element.styleVariant === 'modern-condensed' ? element.accentColor : '#0f172a'
              }}
            >
              {element.newspaperName}
            </h1>
            {element.motto && (
              <p className="text-[10px] tracking-[0.2em] uppercase text-neutral-600 font-sans mt-1">
                {element.motto}
              </p>
            )}
          </div>

          {/* Bottom metadata strip */}
          <div className="border-t-2 border-b flex items-center justify-between text-[10px] font-sans font-medium text-neutral-700 py-0.5"
               style={{ borderColor: element.borderColor }}>
            <span>{element.editionNumber}</span>
            <span className="font-serif italic font-normal text-[11px]">«Información rigurosa al servicio público»</span>
            <span>REGISTRO DE PRENSA DIGITAL</span>
          </div>
        </div>
      );
    }

    case 'headline': {
      return (
        <div
          className="w-full h-full flex flex-col justify-between select-none pointer-events-none p-1"
          style={{ textAlign: element.textAlign }}
        >
          {element.showKicker && element.kicker && (
            <div
              className="text-[12px] font-sans font-bold uppercase tracking-[0.15em] mb-1"
              style={{ color: element.kickerColor || '#991b1b' }}
            >
              {element.kicker}
            </div>
          )}

          <h2
            className="font-bold flex-1"
            style={{
              fontFamily: element.fontFamily,
              fontSize: `${element.fontSize}px`,
              lineHeight: element.lineHeight,
              letterSpacing: `${element.letterSpacing}px`,
              color: element.textColor || '#0f172a'
            }}
          >
            {element.headline}
          </h2>

          {element.showSubtitle && element.subtitle && (
            <p
              className="text-[14px] text-neutral-600 font-serif leading-relaxed my-1"
              style={{
                lineHeight: 1.35
              }}
            >
              {element.subtitle}
            </p>
          )}

          {element.showByline && (element.byline || element.date) && (
            <div className="text-[11px] font-sans uppercase tracking-wider text-neutral-500 pt-1 border-t border-neutral-200 mt-1 flex items-center gap-2">
              <span className="font-semibold text-neutral-700">{element.byline}</span>
              {element.date && <span>• {element.date}</span>}
            </div>
          )}
        </div>
      );
    }

    case 'article': {
      return (
        <div className="w-full h-full select-none pointer-events-none p-1 overflow-hidden">
          {element.headline && (
            <h3
              className="font-serif font-bold text-neutral-900 mb-2 border-b border-neutral-300 pb-1"
              style={{
                fontSize: `${Math.max(14, element.fontSize + 2)}px`,
                fontFamily: element.fontFamily
              }}
            >
              {element.headline}
            </h3>
          )}

          <div
            className="w-full h-full leading-normal"
            style={{
              fontFamily: element.fontFamily,
              fontSize: `${element.fontSize}px`,
              lineHeight: element.lineHeight,
              letterSpacing: `${element.letterSpacing}px`,
              textAlign: element.textAlign,
              color: element.textColor || '#1f2937',
              columnCount: element.columns,
              columnGap: `${element.columnGap}px`,
              columnRule: element.showColumnDividers ? `1px solid ${element.dividerColor || '#e2e8f0'}` : 'none'
            }}
          >
            {element.body.split('\n\n').map((paragraph, index) => {
              const isFirst = index === 0;
              if (isFirst && element.dropCap && paragraph.length > 0) {
                const firstLetter = paragraph.charAt(0);
                const rest = paragraph.slice(1);
                return (
                  <p key={index} className="mb-3">
                    <span
                      className="float-left text-neutral-900 font-serif font-bold leading-none pr-1.5 pt-0.5"
                      style={{
                        fontSize: `${element.fontSize * 3.2}px`,
                        fontFamily: element.fontFamily
                      }}
                    >
                      {firstLetter}
                    </span>
                    {rest}
                  </p>
                );
              }

              return (
                <p
                  key={index}
                  className={`mb-3 ${element.paragraphIndent && !isFirst ? 'indent-4' : ''}`}
                >
                  {paragraph}
                </p>
              );
            })}
          </div>
        </div>
      );
    }

    case 'image': {
      return (
        <div
          className="w-full h-full flex flex-col select-none pointer-events-none bg-neutral-100 overflow-hidden relative"
          style={{
            borderWidth: `${element.borderWidth}px`,
            borderColor: element.borderColor
          }}
        >
          {/* Optional Headline Overlay Banner */}
          {element.headlineOverlay && (
            <div className="bg-black/90 text-white font-sans font-bold text-sm px-3 py-2 z-10 shadow-md">
              {element.headlineOverlay}
            </div>
          )}

          <div className="flex-1 overflow-hidden relative">
            <img
              src={element.url}
              alt={element.caption || 'Fotografía periodística'}
              className="w-full h-full"
              style={{
                objectFit: element.objectFit,
                filter: element.grayscale ? 'grayscale(100%)' : 'none'
              }}
              referrerPolicy="no-referrer"
            />
          </div>

          {(element.caption || element.credit) && (
            <div className="bg-white/95 px-2 py-1 border-t border-neutral-200 text-[10px] text-neutral-700 leading-tight">
              {element.caption && <span className="font-serif">{element.caption} </span>}
              {element.credit && (
                <span className="font-sans font-medium text-neutral-500 uppercase tracking-wider">
                  [{element.credit}]
                </span>
              )}
            </div>
          )}
        </div>
      );
    }

    case 'quote': {
      const isLeftBar = element.borderStyle === 'left-bar';
      const isTopBottom = element.borderStyle === 'top-bottom';
      const isOrnate = element.borderStyle === 'ornate-quotes';

      return (
        <div
          className={`w-full h-full flex flex-col justify-center select-none pointer-events-none p-3 ${
            isLeftBar ? 'border-l-4' : ''
          } ${isTopBottom ? 'border-t-2 border-b-2 py-3' : ''}`}
          style={{
            borderColor: element.accentColor || '#991b1b'
          }}
        >
          {isOrnate && (
            <div
              className="font-serif leading-none -mb-2 select-none"
              style={{
                fontSize: `${element.fontSize * 1.8}px`,
                color: element.accentColor || '#991b1b'
              }}
            >
              “
            </div>
          )}

          <blockquote
            className="font-serif italic font-medium"
            style={{
              fontFamily: element.fontFamily,
              fontSize: `${element.fontSize}px`,
              lineHeight: element.lineHeight,
              color: element.textColor || '#0f172a'
            }}
          >
            {element.quote}
          </blockquote>

          {(element.author || element.role) && (
            <div className="mt-2 text-[11px] font-sans not-italic">
              {element.author && (
                <span className="font-bold text-neutral-900 uppercase tracking-wider block">
                  — {element.author}
                </span>
              )}
              {element.role && <span className="text-neutral-500 text-[10px]">{element.role}</span>}
            </div>
          )}
        </div>
      );
    }

    case 'box': {
      return (
        <div
          className="w-full h-full flex flex-col select-none pointer-events-none p-2.5 overflow-hidden shadow-xs"
          style={{
            backgroundColor: element.bgColor || '#f8fafc',
            borderWidth: `${element.borderWidth}px`,
            borderColor: element.borderColor || '#cbd5e1',
            color: element.textColor || '#0f172a'
          }}
        >
          {element.badgeText && (
            <div className="mb-1.5 flex items-center justify-between">
              <span
                className="text-[9px] font-sans font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-xs"
                style={{
                  backgroundColor: element.badgeBgColor || (element.boxStyle === 'breaking' ? '#ef4444' : '#1e293b'),
                  color: '#ffffff'
                }}
              >
                {element.badgeText}
              </span>
            </div>
          )}

          {/* Optional thumbnail image */}
          {element.imageUrl && (
            <div className="w-full h-20 mb-2 overflow-hidden rounded-xs bg-neutral-200">
              <img
                src={element.imageUrl}
                alt=""
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          {element.title && (
            <h4 className="font-bold text-[12px] font-sans uppercase tracking-tight leading-snug pb-1 border-b border-current/20 mb-1.5">
              {element.title}
            </h4>
          )}

          <div className="text-[10.5px] font-serif leading-relaxed whitespace-pre-line flex-1 overflow-hidden">
            {element.content}
          </div>
        </div>
      );
    }

    case 'divider': {
      let borderStyle = 'solid';
      let borderHeight = `${element.thickness}px`;

      if (element.style === 'double') {
        borderStyle = 'double';
        borderHeight = `${Math.max(3, element.thickness * 2)}px`;
      } else if (element.style === 'dashed') {
        borderStyle = 'dashed';
      } else if (element.style === 'dotted') {
        borderStyle = 'dotted';
      }

      return (
        <div className="w-full h-full flex items-center justify-center select-none pointer-events-none">
          {element.style === 'ornate' ? (
            <div className="w-full flex items-center gap-2">
              <div className="flex-1 h-[1px] bg-neutral-400" />
              <div className="text-neutral-500 text-[12px] font-serif">♦ ♦ ♦</div>
              <div className="flex-1 h-[1px] bg-neutral-400" />
            </div>
          ) : (
            <div
              className="w-full"
              style={{
                borderTop: `${borderHeight} ${borderStyle} ${element.color || '#000000'}`
              }}
            />
          )}
        </div>
      );
    }

    default:
      return null;
  }
};
