import { useRutasStore } from '../../store/rutasStore';
import { RUTA_COLORS, type SubtipoRuta } from '../../types/rutas';
import { BiX, BiBus, BiMap, BiRightArrowAlt, BiRuler } from 'react-icons/bi';

export const RouteInfoCard = () => {
    const { selectedRoute, clearSelectedRoute } = useRutasStore();

    if (!selectedRoute) return null;

    const props = selectedRoute.properties;
    const subtipo = props.SUBTIPO as SubtipoRuta;
    const color = RUTA_COLORS[subtipo] || '#6b7280';

    return (
        <div className="
      fixed bottom-4 left-1/2 -translate-x-1/2 z-50
      bg-primary/95 backdrop-blur-sm 
      text-white
      rounded-xl border border-white/20 shadow-2xl 
      w-[95%] max-w-md
      animate-slide-up
    ">
            {/* Header with color accent */}
            <div
                className="h-1 rounded-t-xl w-full"
                style={{ backgroundColor: color }}
            />

            <div className="p-4">
                {/* Title row */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg font-bold shadow-lg"
                            style={{ backgroundColor: color }}
                        >
                            {props.Nombre_de_}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg leading-tight text-white">
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
                        title="Cerrar"
                    >
                        <BiX className="text-2xl" />
                    </button>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-3 mb-2">
                    {/* Subtipo */}
                    <div className="flex items-center gap-2 text-sm bg-white/5 p-2 rounded-lg border border-white/5">
                        <BiBus className="text-secondary text-lg" />
                        <span className="text-white/80">{props.SUBTIPO}</span>
                    </div>

                    {/* Kilometros */}
                    <div className="flex items-center gap-2 text-sm bg-white/5 p-2 rounded-lg border border-white/5">
                        <BiRuler className="text-secondary text-lg" />
                        <span className="text-white/80">
                            {parseFloat(props.Kilómetro).toFixed(1)} km
                        </span>
                    </div>

                    {/* Departamento */}
                    <div className="flex items-center gap-2 text-sm bg-white/5 p-2 rounded-lg border border-white/5">
                        <BiMap className="text-secondary text-lg" />
                        <span className="text-white/80">{props.DEPARTAMEN}</span>
                    </div>

                    {/* Sentido */}
                    <div className="flex items-center gap-2 text-sm bg-white/5 p-2 rounded-lg border border-white/5">
                        <BiRightArrowAlt className="text-secondary text-lg" />
                        <span className="text-white/80 truncate font-medium" title={props.SENTIDO}>
                            {props.SENTIDO.length > 15 ? `${props.SENTIDO.substring(0, 15)}...` : props.SENTIDO}
                        </span>
                    </div>
                </div>

                {/* Code */}
                <div className="mt-2 flex items-center justify-between text-xs text-white/30 px-1">
                    <span>Código: <span className="font-mono">{props.Código_de}</span></span>
                    <span>ID: {props.CANTIDAD_D}</span>
                </div>
            </div>
        </div>
    );
};

export default RouteInfoCard;
