import { useMemo } from 'react';
import { Source, Layer } from 'react-map-gl/maplibre';
import { useRutasStore } from '../../store/rutasStore';
import { RUTA_COLORS, type SubtipoRuta } from '../../types/rutas';
import type { LineLayerSpecification, SymbolLayerSpecification } from 'maplibre-gl';

export const RouteLayer = () => {
    const { selectedRoute } = useRutasStore();

    const geojsonData = useMemo(() => {
        if (!selectedRoute) return null;

        return {
            type: 'FeatureCollection' as const,
            features: [selectedRoute]
        };
    }, [selectedRoute]);

    if (!geojsonData) return null;

    const subtipo = selectedRoute?.properties.SUBTIPO as SubtipoRuta;
    const color = RUTA_COLORS[subtipo] || '#3b82f6';

    const lineStyle: LineLayerSpecification = {
        id: 'selected-route-line',
        type: 'line',
        source: 'selected-route',
        paint: {
            'line-color': color,
            'line-width': 4,
            'line-opacity': 0.8,
        },
        layout: {
            'line-cap': 'round',
            'line-join': 'round',
        },
    };

    const lineOutlineStyle: LineLayerSpecification = {
        id: 'selected-route-outline',
        type: 'line',
        source: 'selected-route',
        paint: {
            'line-color': '#ffffff',
            'line-width': 6,
            'line-opacity': 0.5,
        },
        layout: {
            'line-cap': 'round',
            'line-join': 'round',
        },
    };

    const arrowStyle: SymbolLayerSpecification = {
        id: 'selected-route-arrows',
        type: 'symbol',
        source: 'selected-route',
        layout: {
            'symbol-placement': 'line',
            'symbol-spacing': 100,
            'icon-image': 'arrow',
            'icon-size': 0.5,
            'icon-rotate': 90,
            'icon-rotation-alignment': 'map',
            'icon-allow-overlap': true,
            'icon-ignore-placement': true,
        },
        paint: {
            'icon-opacity': 0.8,
        },
    };

    return (
        <Source id="selected-route" type="geojson" data={geojsonData}>
            <Layer {...lineOutlineStyle} />
            <Layer {...lineStyle} />
            <Layer {...arrowStyle} />
        </Source>
    );
};

export default RouteLayer;
