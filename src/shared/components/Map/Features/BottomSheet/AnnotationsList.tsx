import React from 'react';
import { BiPin, BiShapePolygon, BiDownload, BiTrash } from 'react-icons/bi';
import { MdOutlinePolyline } from 'react-icons/md';
import { useAnnotationStore } from '../../../../store/annotationStore';
import type { Annotation } from '../../../../store/annotationStore';

export const AnnotationsList: React.FC = React.memo(() => {
  const annotations = useAnnotationStore(state => state.annotations);
  const removeAnnotation = useAnnotationStore(state => state.removeAnnotation);

  if (annotations.length === 0) {
    return (
      <div className="p-8 text-center text-white/60 text-sm">
        No hay anotaciones aún
      </div>
    );
  }

  return (
    <div>
      {annotations.map((annotation) => (
        <AnnotationItem
          key={annotation.id}
          annotation={annotation}
          onRemove={removeAnnotation}
        />
      ))}
    </div>
  );
});

AnnotationsList.displayName = 'AnnotationsList';

const AnnotationItem: React.FC<{
  annotation: Annotation;
  onRemove: (id: string) => void;
}> = React.memo(({ annotation, onRemove }) => {
  const handleExport = () => {
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
            coordinates: [coords.filter(c => c != null).map(c => [c!.lng, c!.lat])]
          }
        }]
      };
    } else {
      geojson = annotation.data.geojson || annotation.data;
    }
    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${annotation.name.replace(/\s+/g, '_')}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getIcon = () => {
    switch (annotation.type) {
      case 'pin': return <BiPin className="text-secondary text-lg" />;
      case 'drawn-polygon': return <MdOutlinePolyline className="text-secondary text-lg" />;
      case 'search-result': return <BiShapePolygon className="text-secondary text-lg" />;
    }
  };

  return (
    <div className="p-3 border-b border-white/10 hover:bg-white/5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1">
          <div className="mt-1">{getIcon()}</div>
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
              onClick={handleExport}
              className="p-1.5 hover:bg-white/10 rounded text-secondary"
              title="Exportar GeoJSON"
            >
              <BiDownload />
            </button>
          )}
          <button
            onClick={() => onRemove(annotation.id)}
            className="p-1.5 hover:bg-white/10 rounded text-secondary/70 hover:text-secondary"
            title="Eliminar"
          >
            <BiTrash />
          </button>
        </div>
      </div>
    </div>
  );
});

AnnotationItem.displayName = 'AnnotationItem';
