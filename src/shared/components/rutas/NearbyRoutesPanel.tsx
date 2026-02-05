import { useRutasStore } from '../../store/rutasStore';
import { RUTA_COLORS, type SubtipoRuta } from '../../types/rutas';
import { FaBus, FaTimes, FaRoute, FaSpinner } from 'react-icons/fa';

export const NearbyRoutesPanel = () => {
    const {
        nearbyRoutes,
        isLoading,
        isPanelOpen,
        searchLocation,
        searchRadius,
        selectedRoute,
        selectRoute,
        clearNearbyRoutes,
        togglePanel
    } = useRutasStore();

    if (!isPanelOpen && nearbyRoutes.length === 0) return null;

    const formatDistance = (meters: number) => {
        if (meters < 1000) {
            return `${Math.round(meters)} m`;
        }
        return `${(meters / 1000).toFixed(1)} km`;
    };

    const getRouteColor = (subtipo: string): string => {
        return RUTA_COLORS[subtipo as SubtipoRuta] || '#6b7280';
    };

    return (
        <div className={`
      fixed left-4 top-20 z-50 
      bg-white dark:bg-gray-800 
      rounded-xl shadow-2xl 
      transition-all duration-300 ease-in-out
      ${isPanelOpen ? 'w-80 opacity-100' : 'w-12 opacity-90'}
      max-h-[70vh] overflow-hidden
    `}>
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b dark:border-gray-700">
                {isPanelOpen ? (
                    <>
                        <div className="flex items-center gap-2">
                            <FaBus className="text-blue-500" />
                            <span className="font-semibold text-gray-800 dark:text-white">
                                Rutas Cercanas
                            </span>
                            {nearbyRoutes.length > 0 && (
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                                    {nearbyRoutes.length}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={clearNearbyRoutes}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            title="Cerrar"
                        >
                            <FaTimes className="text-gray-500" />
                        </button>
                    </>
                ) : (
                    <button
                        onClick={togglePanel}
                        className="w-full flex justify-center"
                        title="Mostrar rutas"
                    >
                        <FaBus className="text-blue-500" />
                    </button>
                )}
            </div>

            {/* Content */}
            {isPanelOpen && (
                <div className="overflow-y-auto max-h-[calc(70vh-60px)]">
                    {/* Search info */}
                    {searchLocation && (
                        <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700/50 text-xs text-gray-500 dark:text-gray-400">
                            Radio: {searchRadius} km
                        </div>
                    )}

                    {/* Loading */}
                    {isLoading && (
                        <div className="flex items-center justify-center p-8">
                            <FaSpinner className="animate-spin text-blue-500 text-2xl" />
                        </div>
                    )}

                    {/* Empty state */}
                    {!isLoading && nearbyRoutes.length === 0 && (
                        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                            <FaRoute className="mx-auto text-3xl mb-2 opacity-50" />
                            <p>No hay rutas cercanas</p>
                            <p className="text-xs mt-1">Haz clic en el mapa para buscar</p>
                        </div>
                    )}

                    {/* Routes list */}
                    {!isLoading && nearbyRoutes.length > 0 && (
                        <ul className="divide-y dark:divide-gray-700">
                            {nearbyRoutes.map((ruta) => (
                                <li
                                    key={ruta.codigo}
                                    onClick={() => selectRoute(ruta.codigo)}
                                    className={`
                    p-3 cursor-pointer transition-colors
                    hover:bg-gray-50 dark:hover:bg-gray-700/50
                    ${selectedRoute?.properties.Código_de === ruta.codigo
                                            ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
                                            : ''}
                  `}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="font-bold text-lg"
                                                    style={{ color: getRouteColor(ruta.subtipo) }}
                                                >
                                                    {ruta.nombre}
                                                </span>
                                                <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                                    {ruta.tipo === 'POR AUTOBUS' ? 'Bus' : 'Micro'}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {ruta.subtipo} • {ruta.sentido}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                {formatDistance(ruta.distancia_m)}
                                            </span>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default NearbyRoutesPanel;
