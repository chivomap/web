import { useRutasStore } from '../../store/rutasStore';
import { RUTA_COLORS, type SubtipoRuta } from '../../types/rutas';
import { BiBus, BiX, BiMapAlt, BiLoaderAlt } from 'react-icons/bi';

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

    return (
        <div className={`
      fixed left-4 top-20 z-50 
      bg-primary/95 backdrop-blur-sm 
      text-white
      rounded-xl border border-white/20 shadow-2xl 
      transition-all duration-300 ease-in-out
      ${isPanelOpen ? 'w-80 opacity-100' : 'w-12 opacity-90'}
      max-h-[70vh] overflow-hidden
    `}>
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-white/10">
                {isPanelOpen ? (
                    <>
                        <div className="flex items-center gap-2">
                            <BiBus className="text-secondary text-lg" />
                            <span className="font-semibold text-white">
                                Rutas Cercanas
                            </span>
                            {nearbyRoutes.length > 0 && (
                                <span className="bg-secondary/20 text-secondary text-xs px-2 py-0.5 rounded-full border border-secondary/30">
                                    {nearbyRoutes.length}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={clearNearbyRoutes}
                            className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-white"
                            title="Cerrar"
                        >
                            <BiX className="text-xl" />
                        </button>
                    </>
                ) : (
                    <button
                        onClick={togglePanel}
                        className="w-full flex justify-center py-2"
                        title="Mostrar rutas"
                    >
                        <BiBus className="text-secondary text-xl animate-pulse" />
                    </button>
                )}
            </div>

            {/* Content */}
            {isPanelOpen && (
                <div className="overflow-y-auto max-h-[calc(70vh-60px)] custom-scrollbar">
                    {/* Search info */}
                    {searchLocation && (
                        <div className="px-3 py-2 bg-white/5 text-xs text-white/50 border-b border-white/5">
                            Radio de búsqueda: {searchRadius} km
                        </div>
                    )}

                    {/* Loading */}
                    {isLoading && (
                        <div className="flex items-center justify-center p-8">
                            <BiLoaderAlt className="animate-spin text-secondary text-3xl" />
                        </div>
                    )}

                    {/* Empty state */}
                    {!isLoading && nearbyRoutes.length === 0 && (
                        <div className="p-8 text-center text-white/40">
                            <BiMapAlt className="mx-auto text-4xl mb-3 opacity-50" />
                            <p className="text-sm">No hay rutas cercanas</p>
                            <p className="text-xs mt-1 text-white/30">Haz clic derecho en el mapa para buscar</p>
                        </div>
                    )}

                    {/* Routes list */}
                    {!isLoading && nearbyRoutes.length > 0 && (
                        <ul className="divide-y divide-white/5">
                            {nearbyRoutes.map((ruta) => (
                                <li
                                    key={ruta.codigo}
                                    onClick={() => selectRoute(ruta.codigo)}
                                    className={`
                    p-3 cursor-pointer transition-colors
                    hover:bg-white/5
                    ${selectedRoute?.properties.Código_de === ruta.codigo
                                            ? 'bg-secondary/10 border-l-4 border-secondary'
                                            : 'border-l-4 border-transparent'}
                  `}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0 pr-2">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span
                                                    className="font-bold text-lg truncate"
                                                    style={{ color: RUTA_COLORS[ruta.subtipo as SubtipoRuta] || '#fff' }}
                                                >
                                                    {ruta.nombre}
                                                </span>
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/70">
                                                    {ruta.tipo === 'POR AUTOBUS' ? 'Bus' : 'Micro'}
                                                </span>
                                            </div>
                                            <div className="text-xs text-white/50 flex flex-col gap-0.5">
                                                <span className="font-medium text-white/70">{ruta.subtipo}</span>
                                                <span className="truncate" title={ruta.sentido}>{ruta.sentido}</span>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <span className="text-xs font-mono text-secondary bg-secondary/10 px-1.5 py-0.5 rounded">
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
