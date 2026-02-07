import React from 'react';
import { BiMap, BiRuler, BiRightArrowAlt, BiX, BiBus } from 'react-icons/bi';
import { useRutasStore } from '../../../../store/rutasStore';
import { RouteCodeBadge } from '../../../rutas/RouteCodeBadge';
import type { RutaFeature } from '../../../../types/rutas';

interface RouteInfoProps {
  route: RutaFeature;
}

export const RouteInfo: React.FC<RouteInfoProps> = React.memo(({ route }) => {
  const clearSelectedRoute = useRutasStore(state => state.clearSelectedRoute);
  const props = route.properties;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 p-4 space-y-3">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <RouteCodeBadge code={props.Nombre_de_} subtipo={props.SUBTIPO} />
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg leading-tight text-white truncate">
              Ruta {props.Nombre_de_}
            </h3>
            <p className="text-xs text-white/50">
              {props.TIPO === 'POR AUTOBUS' ? 'Autobús' : 'Microbús'}
            </p>
          </div>
        </div>
        <button
          onClick={clearSelectedRoute}
          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
          title="Volver al listado"
        >
          <BiX className="text-2xl" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 flex items-center gap-2 text-sm bg-white/5 p-2 rounded-lg border border-white/5">
          <BiBus className="text-secondary text-lg flex-shrink-0" />
          <span className="text-white/80 font-medium">{props.SUBTIPO}</span>
        </div>

        <div className="flex items-center gap-2 text-sm bg-white/5 p-2 rounded-lg border border-white/5">
          <BiRuler className="text-secondary text-lg flex-shrink-0" />
          <span className="text-white/80">{parseFloat(props.Kilómetro).toFixed(1)} km</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm bg-white/5 p-2 rounded-lg border border-white/5">
          <BiMap className="text-secondary text-lg flex-shrink-0" />
          <span className="text-white/80 truncate" title={props.DEPARTAMEN}>{props.DEPARTAMEN}</span>
        </div>

        <div className="col-span-2 flex items-center gap-2 text-sm bg-white/5 p-2 rounded-lg border border-white/5">
          <BiRightArrowAlt className="text-secondary text-lg flex-shrink-0" />
          <span className="text-white/80 text-xs break-words leading-tight" title={props.SENTIDO}>
            {props.SENTIDO}
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-white/30 px-1">
        <span>Código: <span className="font-mono">{props.Código_de}</span></span>
        <span>ID: {props.CANTIDAD_D}</span>
      </div>
    </div>
  );
});

RouteInfo.displayName = 'RouteInfo';
