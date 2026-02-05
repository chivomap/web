import { useRutasStore } from '../../store/rutasStore';
import { RUTA_COLORS, type SubtipoRuta } from '../../types/rutas';
import { FaTimes, FaBus, FaRoad, FaMapMarkerAlt, FaArrowRight } from 'react-icons/fa';

export const RouteInfoCard = () => {
    const { selectedRoute, clearSelectedRoute } = useRutasStore();

    if (!selectedRoute) return null;

    const props = selectedRoute.properties;
    const subtipo = props.SUBTIPO as SubtipoRuta;
    const color = RUTA_COLORS[subtipo] || '#6b7280';

    return (
        <div className="
      fixed bottom-4 left-1/2 -translate-x-1/2 z-50
      bg-white dark:bg-gray-800 
      rounded-xl shadow-2xl 
      w-[90%] max-w-md
      animate-slide-up
    ">
            {/* Header with color accent */}
            <div
                className="h-1.5 rounded-t-xl"
                style={{ backgroundColor: color }}
            />

            <div className="p-4">
                {/* Title row */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl font-bold"
                            style={{ backgroundColor: color }}
                        >
                            {props.Nombre_de_}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-gray-800 dark:text-white">
                                Ruta {props.Nombre_de_}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {props.TIPO === 'POR AUTOBUS' ? 'Autobús' : 'Microbús'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={clearSelectedRoute}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Cerrar"
                    >
                        <FaTimes className="text-gray-500" />
                    </button>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Subtipo */}
                    <div className="flex items-center gap-2 text-sm">
                        <FaBus className="text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-300">{props.SUBTIPO}</span>
                    </div>

                    {/* Kilometros */}
                    <div className="flex items-center gap-2 text-sm">
                        <FaRoad className="text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-300">
                            {parseFloat(props.Kilómetro).toFixed(1)} km
                        </span>
                    </div>

                    {/* Departamento */}
                    <div className="flex items-center gap-2 text-sm">
                        <FaMapMarkerAlt className="text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-300">{props.DEPARTAMEN}</span>
                    </div>

                    {/* Sentido */}
                    <div className="flex items-center gap-2 text-sm">
                        <FaArrowRight className="text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-300 truncate" title={props.SENTIDO}>
                            {props.SENTIDO.length > 20 ? `${props.SENTIDO.substring(0, 20)}...` : props.SENTIDO}
                        </span>
                    </div>
                </div>

                {/* Code */}
                <div className="mt-3 pt-3 border-t dark:border-gray-700">
                    <span className="text-xs text-gray-400">
                        Código: {props.Código_de}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default RouteInfoCard;
