import React from 'react';
import { BiX } from 'react-icons/bi';
import { useParadasStore } from '../../../../store/paradasStore';
import { useRutasStore } from '../../../../store/rutasStore';
import type { Parada } from '../../../../types/paradas';

interface ParadaInfoProps {
  parada: Parada;
}

export const ParadaInfo: React.FC<ParadaInfoProps> = ({ parada }) => {
  const setSelectedParada = useParadasStore(state => state.setSelectedParada);
  const nearbyParadas = useParadasStore(state => state.nearbyParadas);
  const selectRoute = useRutasStore(state => state.selectRoute);

  // Encontrar todas las rutas que pasan por esta parada (mismo nombre)
  const rutasEnParada = nearbyParadas
    .filter(p => p.nombre === parada.nombre)
    .map(p => ({ ruta: p.ruta, codigo: p.codigo }))
    .reduce((acc, curr) => {
      if (!acc.find(r => r.ruta === curr.ruta && r.codigo === curr.codigo)) {
        acc.push(curr);
      }
      return acc;
    }, [] as { ruta: string; codigo: string }[]);

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0 mt-1">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-blue-400">
              <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2" />
              <rect x="8" y="7" width="8" height="10" rx="1" fill="currentColor" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-white leading-tight">
              Parada de Bus
            </h3>
            <p className="text-sm text-white/70 mt-1 line-clamp-3">
              {parada.nombre}
            </p>
          </div>
        </div>
        <button
          onClick={() => setSelectedParada(null)}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
        >
          <BiX className="text-white text-xl" />
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between py-2 border-b border-white/10">
          <span className="text-white/60">Departamento</span>
          <span className="text-white font-medium">{parada.departamento}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-white/10">
          <span className="text-white/60">Coordenadas</span>
          <span className="text-white font-mono text-xs">
            {parada.latitud.toFixed(6)}, {parada.longitud.toFixed(6)}
          </span>
        </div>
      </div>

      {rutasEnParada.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold text-white text-sm">
            Rutas que pasan aquí ({rutasEnParada.length})
          </h4>
          <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-2">
            {rutasEnParada.map((r, idx) => (
              <button
                key={`${r.ruta}-${r.codigo}-${idx}`}
                onClick={() => selectRoute(r.ruta)}
                className="w-full text-left p-2.5 bg-white/5 hover:bg-secondary/10 rounded-lg border border-white/10 hover:border-secondary/30 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white text-sm group-hover:text-secondary transition-colors">
                    Ruta {r.ruta}
                  </span>
                  <span className="text-xs text-white/50">
                    {r.codigo === 'I' ? 'Ida' : 'Regreso'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
