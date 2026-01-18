import React from 'react';
import { useThemeStore } from '../../../store/themeStore';

const legendItems = [
  { region: 'Centro', color: '#06b6d4' },
  { region: 'Norte', color: '#22c55e' },
  { region: 'Sur', color: '#f97316' },
  { region: 'Este', color: '#e11d48' },
  { region: 'Oeste', color: '#a855f7' }
];

export const MapLegend: React.FC = () => {
  const { currentMapStyle } = useThemeStore();
  const isDark = currentMapStyle.name === 'Oscuro';

  return (
    <div className={`absolute bottom-4 left-4 rounded-lg shadow-lg p-3 text-sm z-10 
                    sm:bottom-24 sm:left-4 ${
                      isDark 
                        ? 'bg-gray-800/90 backdrop-blur-sm' 
                        : 'bg-white/90 backdrop-blur-sm'
                    }`}>
      <h3 className={`font-semibold mb-2 ${
        isDark ? 'text-gray-200' : 'text-gray-800'
      }`}>
        Regiones
      </h3>
      <div className="space-y-1">
        {legendItems.map(({ region, color }) => (
          <div key={region} className="flex items-center gap-2">
            <div 
              className={`w-4 h-4 rounded border ${
                isDark ? 'border-gray-600' : 'border-gray-300'
              }`}
              style={{ backgroundColor: color }}
            />
            <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
              {region}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
