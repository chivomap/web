import React from 'react';
import { useParadasStore } from '../../../../store/paradasStore';
import type { Parada } from '../../../../types/paradas';

export const NearbyParadasList: React.FC = () => {
  const { nearbyParadas, searchLocation, isLoading, clearNearbyParadas, setSelectedParada } = useParadasStore();

  if (!searchLocation && nearbyParadas.length === 0) return null;

  return (
    <div className="p-4 space-y-3 border-t border-white/10">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-white text-base">Paradas cercanas</h3>
          <p className="text-xs text-white/50">
            {nearbyParadas.length > 0
              ? `${nearbyParadas.length} ${nearbyParadas.length === 1 ? 'parada encontrada' : 'paradas encontradas'}`
              : 'No se encontraron paradas en esta área'}
          </p>
        </div>
        <button
          onClick={clearNearbyParadas}
          className="text-xs text-white/60 hover:text-white px-3 py-1.5 hover:bg-white/10 rounded-lg transition-colors"
        >
          Limpiar
        </button>
      </div>

      {isLoading && (
        <div className="text-center py-4 text-white/60">
          Buscando paradas...
        </div>
      )}

      {nearbyParadas.length > 0 && (
        <div className="space-y-2 pr-2 max-h-[200px] overflow-y-auto">
          {nearbyParadas.slice(0, 10).map((parada) => (
            <ParadaCard key={parada.fid} parada={parada} onSelect={setSelectedParada} />
          ))}
          {nearbyParadas.length > 10 && (
            <p className="text-xs text-white/50 text-center py-2">
              Mostrando 10 de {nearbyParadas.length} paradas
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const ParadaCard: React.FC<{ parada: Parada; onSelect: (parada: Parada) => void }> = ({ parada, onSelect }) => (
  <button
    onClick={() => onSelect(parada)}
    className="w-full text-left p-2.5 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg border border-blue-500/20 hover:border-blue-500/40 transition-all group"
  >
    <div className="flex items-start gap-2.5">
      <div className="flex-shrink-0 mt-0.5">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-blue-400">
          <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2" />
          <rect x="8" y="7" width="8" height="10" rx="1" fill="currentColor" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white text-sm group-hover:text-blue-400 transition-colors line-clamp-2">
          {parada.nombre}
        </p>
        <div className="flex items-center gap-2 mt-1 text-xs text-white/50">
          <span>Ruta {parada.ruta}</span>
          <span>•</span>
          <span>{parada.codigo === 'I' ? 'Ida' : 'Regreso'}</span>
        </div>
      </div>
    </div>
  </button>
);
