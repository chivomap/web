import React from 'react';
import { useMapStore } from '../../../../store/mapStore';
import { getQueryData } from '../../../../services/GetQueryData';

export const PlaceInfo: React.FC = React.memo(() => {
  const selectedInfo = useMapStore(state => state.selectedInfo);
  const currentLevel = useMapStore(state => state.currentLevel);
  const parentInfo = useMapStore(state => state.parentInfo);
  const setCurrentLevel = useMapStore(state => state.setCurrentLevel);
  const setParentInfo = useMapStore(state => state.setParentInfo);
  const updateGeojson = useMapStore(state => state.updateGeojson);

  if (!selectedInfo) {
    return <p className="text-white/60 text-center py-8">No hay información seleccionada</p>;
  }

  const handleBack = async () => {
    if (selectedInfo?.name) {
      try {
        const departamentoData = await getQueryData(selectedInfo.name, 'D');
        if (departamentoData) {
          updateGeojson(departamentoData);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
    setCurrentLevel('departamento');
    setParentInfo(null);
  };

  return (
    <div className="p-4 space-y-3">
      <div className="mb-3">
        <h3 className="font-bold text-lg text-white">{selectedInfo.name}</h3>
        <p className="text-sm text-white/70">{selectedInfo.type}</p>
      </div>

      {parentInfo && (
        <button
          onClick={handleBack}
          className="flex items-center gap-3 text-sm font-medium text-white bg-secondary/20 hover:bg-secondary/30 px-4 py-3 rounded-lg transition-all w-full"
        >
          <span>←</span>
          <span>Volver a {parentInfo.departamento}</span>
        </button>
      )}

      {currentLevel === 'departamento' && (
        <div className="border-t border-white/20 pt-3 mt-3">
          <h4 className="text-sm font-medium text-white mb-2">Colores por región</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { region: 'Centro', color: '#06b6d4' },
              { region: 'Norte', color: '#22c55e' },
              { region: 'Sur', color: '#f97316' },
              { region: 'Este', color: '#e11d48' },
              { region: 'Oeste', color: '#a855f7' }
            ].map(({ region, color }) => (
              <div key={region} className="flex items-center gap-2 p-2 bg-white/5 rounded">
                <div className="w-3 h-3 rounded border border-white/30" style={{ backgroundColor: color }} />
                <span className="text-white/90">{region}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

PlaceInfo.displayName = 'PlaceInfo';
