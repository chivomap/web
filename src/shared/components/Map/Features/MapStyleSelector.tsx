import React from 'react';
import { BiSun, BiMoon } from 'react-icons/bi';
import { mapStyles, MapStyle } from '../../../data/mapStyles';
import { useThemeStore } from '../../../store/themeStore';

interface MapStyleSelectorProps {
  onStyleChange: (style: MapStyle) => void;
}

export const MapStyleSelector: React.FC<MapStyleSelectorProps> = ({ 
  onStyleChange 
}) => {
  const { currentMapStyle, setMapStyle } = useThemeStore();
  const isDark = currentMapStyle.id === 'carto-dark-matter';
  
  const toggleStyle = () => {
    const newStyle = isDark ? mapStyles[0] : mapStyles[1]; // Toggle between light and dark
    setMapStyle(newStyle);
    onStyleChange(newStyle);
  };

  return (
    <div className="absolute top-20 left-[5%] sm:top-4 sm:left-4 z-10">
      <button
        onClick={toggleStyle}
        className="w-10 h-10 bg-primary shadow-lg rounded-lg hover:bg-primary/80 transition-colors touch-manipulation flex items-center justify-center"
        title={`Cambiar a modo ${isDark ? 'claro' : 'oscuro'}`}
      >
        {isDark ? (
          <BiSun className="text-secondary text-xl" />
        ) : (
          <BiMoon className="text-secondary text-xl" />
        )}
      </button>
    </div>
  );
};
