import React from 'react';
import { useMapStore } from '../../../store/mapStore';

export const NavigationBreadcrumb: React.FC = () => {
  const { selectedInfo, currentLevel, parentInfo, setSelectedInfo, setCurrentLevel, setParentInfo, updateGeojson } = useMapStore();

  if (!selectedInfo && !parentInfo) return null;

  const handleClose = () => {
    setSelectedInfo(null);
    setCurrentLevel('departamento');
    setParentInfo(null);
    updateGeojson(null);
  };

  const handleDepartamentoClick = () => {
    setCurrentLevel('departamento');
    setParentInfo(null);
    // Recargar vista de departamento si es necesario
  };

  return (
    <div className="absolute top-4 left-4 right-4 z-20 animate-in slide-in-from-top-4 duration-300">
      <div className="bg-primary/95 backdrop-blur-sm text-white rounded-xl shadow-lg 
                      border border-white/20 px-4 py-3 flex items-center justify-between">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          {/* Departamento */}
          <button
            onClick={handleDepartamentoClick}
            className="hover:bg-white/20 px-2 py-1 rounded transition-colors font-medium"
          >
            {selectedInfo?.name || parentInfo?.departamento}
          </button>
          
          {/* Municipio */}
          {parentInfo?.municipio && (
            <>
              <span className="text-white/60">›</span>
              <span className="px-2 py-1 bg-white/20 rounded font-medium">
                {parentInfo.municipio}
              </span>
            </>
          )}
          
          {/* Nivel actual */}
          <span className="text-white/60">›</span>
          <span className="text-xs text-white/80 bg-white/10 px-2 py-1 rounded-full">
            {currentLevel === 'departamento' ? 'Municipios' : 'Distritos'}
          </span>
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white/80 hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
