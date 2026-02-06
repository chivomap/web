import React, { useState } from 'react';
import { useAnnotationStore } from '../../../store/annotationStore';
import { BiTrash, BiMap, BiPin, BiShapePolygon, BiCopy, BiDownload, BiDotsVerticalRounded, BiImage } from 'react-icons/bi';

export const AnnotationsPanel: React.FC = () => {
  const { annotations, removeAnnotation, clearAnnotations, exportAllAsGeoJSON } = useAnnotationStore();
  const [isOpen, setIsOpen] = useState(true); // Abierto por defecto
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [activeItemMenu, setActiveItemMenu] = useState<string | null>(null);
  const [startY, setStartY] = useState(0);

  // Escuchar evento del botón en MapControls
  React.useEffect(() => {
    const handleToggle = () => setIsOpen(prev => !prev);
    window.addEventListener('toggle-annotations', handleToggle);
    return () => window.removeEventListener('toggle-annotations', handleToggle);
  }, []);

  // Swipe para cerrar
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endY = e.changedTouches[0].clientY;
    const diff = endY - startY;
    // Si swipe hacia abajo más de 50px, cerrar
    if (diff > 50) {
      setIsOpen(false);
    }
  };

  const handleCopy = async () => {
    const geojson = exportAllAsGeoJSON();
    await navigator.clipboard.writeText(JSON.stringify(geojson, null, 2));
    setShowExportMenu(false);
    // TODO: Mostrar notificación de éxito
  };

  const handleDownload = () => {
    const geojson = exportAllAsGeoJSON();
    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chivomap-annotations-${new Date().toISOString().split('T')[0]}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const handleItemCopy = async (annotation: any) => {
    const geojson = createSingleGeoJSON(annotation);
    await navigator.clipboard.writeText(JSON.stringify(geojson, null, 2));
    setActiveItemMenu(null);
  };

  const handleItemDownload = (annotation: any) => {
    const geojson = createSingleGeoJSON(annotation);
    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${annotation.name.replace(/\s+/g, '-')}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
    setActiveItemMenu(null);
  };

  const createSingleGeoJSON = (annotation: any) => {
    if (annotation.type === 'pin' && annotation.data.coordinates) {
      const coord = annotation.data.coordinates;
      return {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [coord.lng, coord.lat] },
          properties: { name: annotation.name }
        }]
      };
    } else if (annotation.type === 'drawn-polygon' && annotation.data.coordinates) {
      const coords = annotation.data.coordinates;
      return {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[...coords.map((c: any) => [c.lng, c.lat]), [coords[0].lng, coords[0].lat]]]
          },
          properties: { name: annotation.name }
        }]
      };
    } else if (annotation.type === 'search-result' && annotation.data.geojson) {
      return annotation.data.geojson;
    }
    return { type: 'FeatureCollection', features: [] };
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'pin': return <BiPin className="text-secondary" />;
      case 'drawn-polygon': return <BiShapePolygon className="text-secondary" />;
      case 'search-result': return <BiMap className="text-secondary" />;
      default: return null;
    }
  };

  return (
    <>
      {/* Panel */}
      {isOpen && (
        <>
          {/* Backdrop para cerrar al tocar fuera */}
          <div 
            className="fixed inset-0 bg-black/20 z-[59]"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel optimizado para mobile */}
          <div 
            className="fixed bottom-0 sm:top-48 sm:bottom-auto right-0 sm:right-4 z-[60] w-full sm:w-80 max-h-[80vh] sm:max-h-96 bg-primary/95 backdrop-blur-sm sm:rounded-xl rounded-t-2xl shadow-xl border-t sm:border border-white/20 flex flex-col"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Handle para swipe (solo mobile) */}
            <div className="sm:hidden w-12 h-1 bg-white/30 rounded-full mx-auto mt-2 mb-1" />
          {/* Header */}
          <div className="p-4 border-b border-white/20 flex justify-between items-center">
            <h3 className="text-white font-semibold">Anotaciones ({annotations.length})</h3>
            <div className="flex gap-2">
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
                  title="Exportar"
                >
                  <BiDownload className="text-lg" />
                </button>
                {showExportMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-primary border border-white/20 rounded-lg shadow-xl overflow-hidden min-w-[140px]">
                    <button
                      onClick={handleCopy}
                      className="w-full px-3 py-2 text-left text-white text-sm hover:bg-white/10 flex items-center gap-2"
                    >
                      <BiCopy /> Copiar GeoJSON
                    </button>
                    <button
                      onClick={handleDownload}
                      className="w-full px-3 py-2 text-left text-white text-sm hover:bg-white/10 flex items-center gap-2"
                    >
                      <BiDownload /> Descargar
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={clearAnnotations}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-red-400"
                title="Limpiar todo"
              >
                <BiTrash className="text-lg" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
              >
                ✕
              </button>
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto overflow-x-visible max-h-80">
            {annotations.length === 0 ? (
              <div className="p-8 text-center text-white/60 text-sm">
                No hay anotaciones aún
              </div>
            ) : (
              annotations.map((annotation) => (
              <div
                key={annotation.id}
                className="p-3 border-b border-white/10 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1">
                    <div className="mt-1">{getIcon(annotation.type)}</div>
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
                  <div className="relative flex gap-1">
                    <button
                      onClick={() => setActiveItemMenu(activeItemMenu === annotation.id ? null : annotation.id)}
                      className="p-1 hover:bg-white/10 rounded transition-colors text-white"
                      title="Opciones"
                    >
                      <BiDotsVerticalRounded />
                    </button>
                    {activeItemMenu === annotation.id && (
                      <div className="absolute right-full top-0 mr-2 bg-primary border border-white/20 rounded-lg shadow-xl overflow-hidden min-w-[160px] z-10">
                        <button
                          onClick={() => handleItemCopy(annotation)}
                          className="w-full px-3 py-2 text-left text-white text-xs hover:bg-white/10 flex items-center gap-2"
                        >
                          <BiCopy /> Copiar GeoJSON
                        </button>
                        <button
                          onClick={() => handleItemDownload(annotation)}
                          className="w-full px-3 py-2 text-left text-white text-xs hover:bg-white/10 flex items-center gap-2"
                        >
                          <BiDownload /> Exportar GeoJSON
                        </button>
                        {(annotation.type === 'drawn-polygon' || annotation.type === 'search-result') && (
                          <button
                            onClick={() => {
                              // TODO: Implementar exportar imagen
                              setActiveItemMenu(null);
                            }}
                            className="w-full px-3 py-2 text-left text-white text-xs hover:bg-white/10 flex items-center gap-2"
                          >
                            <BiImage /> Exportar imagen
                          </button>
                        )}
                        <button
                          onClick={() => {
                            removeAnnotation(annotation.id);
                            setActiveItemMenu(null);
                          }}
                          className="w-full px-3 py-2 text-left text-red-400 text-xs hover:bg-white/10 flex items-center gap-2"
                        >
                          <BiTrash /> Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
            )}
          </div>
        </div>
        </>
      )}
    </>
  );
};
