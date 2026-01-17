import React, { useState } from 'react';
import { BiSun, BiMoon } from 'react-icons/bi';
import { mapStyles, defaultMapStyle, MapStyle } from '../../../data/mapStyles';

interface MapStyleSelectorProps {
  currentStyle: string;
  onStyleChange: (style: MapStyle) => void;
}

export const MapStyleSelector: React.FC<MapStyleSelectorProps> = ({ 
  currentStyle, 
  onStyleChange 
}) => {
  const currentStyleData = mapStyles.find(style => style.url === currentStyle) || defaultMapStyle;
  const isDark = currentStyleData.id === 'carto-dark-matter';
  
  const toggleStyle = () => {
    const newStyle = isDark ? mapStyles[0] : mapStyles[1]; // Toggle between light and dark
    onStyleChange(newStyle);
  };

  return (
    <div className="absolute top-20 left-[5%] sm:top-4 sm:left-4 z-10">
      <button
        onClick={toggleStyle}
        className="bg-primary shadow-lg rounded-lg p-2 sm:p-3 hover:bg-primary/80 transition-colors touch-manipulation"
        title={`Cambiar a modo ${isDark ? 'claro' : 'oscuro'}`}
      >
        {isDark ? (
          <BiSun className="text-secondary text-lg sm:text-xl" />
        ) : (
          <BiMoon className="text-secondary text-lg sm:text-xl" />
        )}
      </button>
    </div>
  );
};
