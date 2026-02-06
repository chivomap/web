import React from 'react';
import { RUTA_COLORS, type SubtipoRuta } from '../../types/rutas';

interface RouteCodeBadgeProps {
  code: string;
  subtipo?: string;
  size?: 'sm' | 'md';
}

export const RouteCodeBadge: React.FC<RouteCodeBadgeProps> = ({ code, subtipo, size = 'md' }) => {
  // Validate and sanitize code
  const sanitizedCode = code?.toString().trim() || '?';
  const displayCode = sanitizedCode.length > 15 ? sanitizedCode.substring(0, 15) + '...' : sanitizedCode;
  
  const color = subtipo ? RUTA_COLORS[subtipo as SubtipoRuta] || '#6b7280' : '#6b7280';
  
  const sizeClasses = size === 'sm' 
    ? 'min-w-[2.5rem] h-8 px-1.5' 
    : 'min-w-[2.5rem] h-10 px-2';
  
  const textSizeClass = displayCode.length > 3 ? 'text-[0.65rem]' : (size === 'sm' ? 'text-xs' : 'text-sm');
  
  return (
    <div
      className={`${sizeClasses} rounded-lg flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0 ${textSizeClass} whitespace-nowrap`}
      style={{ backgroundColor: color }}
      title={sanitizedCode !== displayCode ? sanitizedCode : undefined}
    >
      {displayCode}
    </div>
  );
};
