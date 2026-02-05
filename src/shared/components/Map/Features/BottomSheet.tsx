import React from 'react';
import { useMapStore } from '../../../store/mapStore';
import { useAnnotationStore } from '../../../store/annotationStore';
import { useBottomSheetStore } from '../../../store/bottomSheetStore';
import { useRutasStore } from '../../../store/rutasStore';
import { RUTA_COLORS, type SubtipoRuta } from '../../../types/rutas';
import { BiMap, BiBookmark, BiTrash, BiPin, BiShapePolygon, BiDownload, BiBus, BiRuler, BiRightArrowAlt, BiX, BiLoaderAlt } from 'react-icons/bi';
import { MdOutlinePolyline } from 'react-icons/md';
import { Z_INDEX } from '../../../constants/zIndex';

export const BottomSheet: React.FC = () => {
  const { selectedInfo, currentLevel, parentInfo, setCurrentLevel, setParentInfo, setDepartamentoGeojson } = useMapStore();
  const { annotations, removeAnnotation } = useAnnotationStore();
  const { activeTab, sheetState, setActiveTab, setSheetState } = useBottomSheetStore();
  const { selectedRoute, clearSelectedRoute, nearbyRoutes, clearNearbyRoutes, selectRoute } = useRutasStore();

  const [dragY, setDragY] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const [radiusDebounce, setRadiusDebounce] = React.useState<ReturnType<typeof setTimeout> | null>(null);

  // Está abierto si hay alguna info, ruta seleccionada, o rutas cercanas
  const isOpen = !!(selectedInfo || annotations.length > 0 || selectedRoute || nearbyRoutes.length > 0);

  const [dragStartY, setDragStartY] = React.useState(0);

  const getSheetHeight = () => {
    if (window.innerWidth >= 640) return 'auto'; // Desktop: altura automática
    switch (sheetState) {
      case 'peek': return '140px';
      case 'half': return '50dvh';
      case 'full': return '90dvh';
      default: return '140px';
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setDragStartY(e.touches[0].clientY);
    setDragY(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - dragStartY;
    // Solo permitir drag hacia abajo desde full/half, o hacia arriba desde peek/half
    if ((sheetState === 'full' && diff > 0) ||
      (sheetState === 'half' && diff !== 0) ||
      (sheetState === 'peek' && diff < 0)) {
      setDragY(diff);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);

    if (dragY > 100) {
      if (sheetState === 'full') setSheetState('half');
      else if (sheetState === 'half') setSheetState('peek');
      else handleClose();
    } else if (dragY < -100) {
      if (sheetState === 'peek') setSheetState('half');
      else if (sheetState === 'half') setSheetState('full');
    }

    setDragY(0);
    setDragStartY(0);
  };

  const handleClose = () => {
    useMapStore.getState().setSelectedInfo(null);
    useMapStore.getState().updateGeojson(null);
    setCurrentLevel('departamento');
    setParentInfo(null);
    setDepartamentoGeojson(null);

    // Limpiar ruta y rutas cercanas
    clearSelectedRoute();
    clearNearbyRoutes();
    
    // Limpiar timeout si existe
    if (radiusDebounce) clearTimeout(radiusDebounce);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      {sheetState !== 'peek' && (
        <div
          className="sm:hidden fixed inset-0 bg-black/40"
          style={{ zIndex: Z_INDEX.BOTTOM_SHEET_BACKDROP }}
          onClick={() => setSheetState('peek')}
        />
      )}

      {/* Sheet */}
      <div
        className="fixed inset-x-0 bottom-0 sm:absolute sm:top-20 sm:bottom-auto sm:left-4 w-full sm:w-80 sm:max-h-[calc(100vh-6rem)]"
        style={{
          height: getSheetHeight(),
          zIndex: Z_INDEX.BOTTOM_SHEET,
          transform: `translateY(${Math.max(0, dragY)}px)`,
          transition: isDragging ? 'none' : 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div className="bg-primary/95 backdrop-blur-sm text-white rounded-t-2xl sm:rounded-xl shadow-xl border-t sm:border border-white/20 h-full flex flex-col">

          {/* Handle - área arrastrable */}
          <div
            className="sm:hidden w-full flex justify-center pt-4 pb-4 flex-shrink-0 cursor-grab active:cursor-grabbing"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={() => {
              if (sheetState === 'peek') setSheetState('half');
              else if (sheetState === 'half') setSheetState('full');
            }}
          >
            <div className="w-12 h-1.5 bg-secondary/40 rounded-full" />
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/20 flex-shrink-0">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'info'
                ? 'text-white border-b-2 border-secondary'
                : 'text-white/60 hover:text-white/80'
                }`}
            >
              {selectedRoute ? <BiBus className="inline mr-2" /> : nearbyRoutes.length > 0 ? <BiBus className="inline mr-2" /> : <BiMap className="inline mr-2" />}
              {selectedRoute ? 'Ruta' : nearbyRoutes.length > 0 ? `Rutas (${nearbyRoutes.length})` : 'Información'}
            </button>
            <button
              onClick={() => setActiveTab('annotations')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'annotations'
                ? 'text-white border-b-2 border-secondary'
                : 'text-white/60 hover:text-white/80'
                }`}
            >
              <BiBookmark className="inline mr-2" />
              Anotaciones ({annotations.length})
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'info' ? (
              // Vista de Información (Ruta, Rutas Cercanas o Lugar)
              <div className="p-4 space-y-3">

                {/* 1. RUTAS CERCANAS */}
                {nearbyRoutes.length > 0 && !selectedRoute ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-white text-lg">Rutas cercanas</h3>
                        <p className="text-xs text-white/50">{nearbyRoutes.length} {nearbyRoutes.length === 1 ? 'ruta encontrada' : 'rutas encontradas'}</p>
                      </div>
                      <button
                        onClick={clearNearbyRoutes}
                        className="text-xs text-white/60 hover:text-white px-3 py-1.5 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        Limpiar
                      </button>
                    </div>

                    {/* Control de Radio */}
                    {useRutasStore.getState().searchLocation && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-white/60">Radio:</span>
                        <input
                          type="range"
                          min="0.5"
                          max="5"
                          step="0.5"
                          value={useRutasStore.getState().searchRadius}
                          onChange={(e) => {
                            const newRadius = parseFloat(e.target.value);
                            const location = useRutasStore.getState().searchLocation;
                            
                            // Actualizar el valor inmediatamente en el store
                            useRutasStore.getState().setRadius(newRadius);
                            
                            // Limpiar timeout anterior
                            if (radiusDebounce) clearTimeout(radiusDebounce);
                            
                            // Hacer la petición después de 500ms
                            const timeout = setTimeout(() => {
                              if (location) {
                                useRutasStore.getState().fetchNearbyRoutes(location.lat, location.lng, newRadius);
                              }
                            }, 500);
                            
                            setRadiusDebounce(timeout);
                          }}
                          className="flex-1 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer slider-thumb"
                        />
                        <span className="text-secondary font-semibold min-w-[3rem] text-right flex items-center gap-1">
                          {useRutasStore.getState().isLoading && <BiLoaderAlt className="animate-spin" />}
                          {useRutasStore.getState().searchRadius} km
                        </span>
                      </div>
                    )}

                    <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-secondary/30 scrollbar-track-white/5 hover:scrollbar-thumb-secondary/50">
                      {nearbyRoutes.map((ruta) => {
                        const subtipo = ruta.subtipo as SubtipoRuta;
                        const color = RUTA_COLORS[subtipo] || '#6b7280';
                        return (
                          <button
                            key={ruta.codigo}
                            onClick={() => {
                              selectRoute(ruta.codigo);
                              setSheetState('peek'); // Compactar drawer al seleccionar ruta
                            }}
                            className="w-full text-left p-2.5 bg-white/5 hover:bg-secondary/10 rounded-lg border border-white/10 hover:border-secondary/30 transition-all group"
                          >
                            <div className="flex items-center gap-2.5">
                              <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-lg flex-shrink-0 group-hover:scale-105 transition-transform"
                                style={{ backgroundColor: color }}
                              >
                                {ruta.nombre}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-white text-sm group-hover:text-secondary transition-colors">Ruta {ruta.nombre}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs text-white/50 truncate">{ruta.subtipo}</span>
                                  <span className="text-xs text-secondary font-medium">
                                    {ruta.distancia_m < 1000 ? `${Math.round(ruta.distancia_m)}m` : `${(ruta.distancia_m / 1000).toFixed(1)}km`}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) :
                  /* 2. INFORMACIÓN DE RUTA */
                  selectedRoute ? (
                  (() => {
                    const props = selectedRoute.properties;
                    const subtipo = props.SUBTIPO as SubtipoRuta;
                    const color = RUTA_COLORS[subtipo] || '#6b7280';

                    return (
                      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {/* Header with color accent */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg font-bold shadow-lg"
                              style={{ backgroundColor: color }}
                            >
                              {props.Nombre_de_}
                            </div>
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
                            title="Cerrar Ruta"
                          >
                            <BiX className="text-2xl" />
                          </button>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-3">
                          {/* Subtipo - Full Width */}
                          <div className="col-span-2 flex items-center gap-2 text-sm bg-white/5 p-2 rounded-lg border border-white/5">
                            <BiBus className="text-secondary text-lg flex-shrink-0" />
                            <span className="text-white/80 font-medium">{props.SUBTIPO}</span>
                          </div>

                          <div className="flex items-center gap-2 text-sm bg-white/5 p-2 rounded-lg border border-white/5">
                            <BiRuler className="text-secondary text-lg flex-shrink-0" />
                            <span className="text-white/80">
                              {parseFloat(props.Kilómetro).toFixed(1)} km
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm bg-white/5 p-2 rounded-lg border border-white/5">
                            <BiMap className="text-secondary text-lg flex-shrink-0" />
                            <span className="text-white/80 truncate" title={props.DEPARTAMEN}>{props.DEPARTAMEN}</span>
                          </div>

                          {/* Sentido - Full Width */}
                          <div className="col-span-2 flex items-center gap-2 text-sm bg-white/5 p-2 rounded-lg border border-white/5">
                            <BiRightArrowAlt className="text-secondary text-lg flex-shrink-0" />
                            <span className="text-white/80 text-xs break-words leading-tight" title={props.SENTIDO}>
                              {props.SENTIDO}
                            </span>
                          </div>
                        </div>

                        {/* Code */}
                        <div className="mt-3 flex items-center justify-between text-xs text-white/30 px-1">
                          <span>Código: <span className="font-mono">{props.Código_de}</span></span>
                          <span>ID: {props.CANTIDAD_D}</span>
                        </div>
                      </div>
                    );
                  })()
                ) : selectedInfo ? (
                  /* 2. INFORMACIÓN DE LUGAR (Existente) */
                  <>
                    <div className="mb-3">
                      <h3 className="font-bold text-lg text-white">{selectedInfo.name}</h3>
                      <p className="text-sm text-white/70">{selectedInfo.type}</p>
                    </div>

                    {/* Botones de navegación */}
                    {parentInfo && (
                      <button
                        onClick={async () => {
                          if (selectedInfo?.name) {
                            try {
                              const { getQueryData } = await import('../../../services/GetQueryData');
                              const departamentoData = await getQueryData(selectedInfo.name, 'D');
                              if (departamentoData) {
                                useMapStore.getState().updateGeojson(departamentoData);
                              }
                            } catch (error) {
                              console.error('Error:', error);
                            }
                          }
                          setCurrentLevel('departamento');
                          setParentInfo(null);
                        }}
                        className="flex items-center gap-3 text-sm font-medium text-white bg-secondary/20 hover:bg-secondary/30 px-4 py-3 rounded-lg transition-all w-full"
                      >
                        <span>←</span>
                        <span>Volver a {parentInfo.departamento}</span>
                      </button>
                    )}

                    {/* Leyenda de colores */}
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
                  </>
                ) : (
                  <p className="text-white/60 text-center py-8">No hay información seleccionada</p>
                )}
              </div>
            ) : (
              // Vista de Anotaciones (Sin cambios)
              <div>
                {annotations.length === 0 ? (
                  <div className="p-8 text-center text-white/60 text-sm">
                    No hay anotaciones aún
                  </div>
                ) : (
                  annotations.map((annotation) => (
                    <div key={annotation.id} className="p-3 border-b border-white/10 hover:bg-white/5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 flex-1">
                          <div className="mt-1">
                            {annotation.type === 'pin' && <BiPin className="text-secondary text-lg" />}
                            {annotation.type === 'drawn-polygon' && <MdOutlinePolyline className="text-secondary text-lg" />}
                            {annotation.type === 'search-result' && <BiShapePolygon className="text-secondary text-lg" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{annotation.name}</p>
                            <p className="text-white/60 text-xs">
                              {new Date(annotation.createdAt).toLocaleString('es-SV', {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {(annotation.type === 'drawn-polygon' || annotation.type === 'search-result') && (
                            <button
                              onClick={() => {
                                let geojson;
                                if (annotation.type === 'drawn-polygon') {
                                  const coords = Array.isArray(annotation.data.coordinates)
                                    ? annotation.data.coordinates
                                    : [annotation.data.coordinates];
                                  geojson = {
                                    type: 'FeatureCollection',
                                    features: [{
                                      type: 'Feature',
                                      properties: { name: annotation.name },
                                      geometry: {
                                        type: 'Polygon',
                                        coordinates: [coords.map((c: any) => [c.lng, c.lat])]
                                      }
                                    }]
                                  };
                                } else {
                                  // search-result ya tiene el geojson completo
                                  geojson = annotation.data.geojson || annotation.data;
                                }
                                const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `${annotation.name.replace(/\s+/g, '_')}.geojson`;
                                a.click();
                                URL.revokeObjectURL(url);
                              }}
                              className="p-1.5 hover:bg-white/10 rounded text-secondary"
                              title="Exportar GeoJSON"
                            >
                              <BiDownload />
                            </button>
                          )}
                          <button
                            onClick={() => removeAnnotation(annotation.id)}
                            className="p-1.5 hover:bg-white/10 rounded text-secondary/70 hover:text-secondary"
                            title="Eliminar"
                          >
                            <BiTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
