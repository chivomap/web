import L from 'leaflet';
import { GeoJSON } from 'react-leaflet';
import { Feature, Geometry, GeoJsonProperties, FeatureCollection } from 'geojson';
import { useMapStore } from '../../../../shared/store/mapStore';

export function GeoDistritos() {
  const { geojson } = useMapStore();

  console.log('geojson', geojson);

  const onEachPolygon = (feature: Feature<Geometry, GeoJsonProperties>, layer: L.Layer) => {
    if (feature.properties) {
      const nombre = feature.properties.NAM;
      const M = feature.properties.M;
      console.log('direccionCardinal', M);

      layer.on({
        mouseover: () => {
          if (layer instanceof L.Path) {
            layer.openPopup();
            layer.setStyle({
              fillOpacity: 0.5,
              weight: 3,
            });
          }
        },
        mouseout: () => {
          if (layer instanceof L.Path) {
            layer.closePopup();
            layer.setStyle({
              fillOpacity: 0.35,
              weight: 1,
            });
          }
        },
        click: () => {
          if (layer instanceof L.Path) {
            layer.setStyle({
              color: '#000',
            });
          }
        },
      });

      layer.bindPopup(`
        <b style="font-size: 1.3rem;">${nombre}</b>
        <br>
        <span style="font-size: .9rem;">${M}</span>
      `);
    }
  };

  const getPolygonStyle = (feature: Feature<Geometry, GeoJsonProperties> | undefined) => {
    if (!feature || !feature.properties) {
      return {
        fillColor: '#000',
        fillOpacity: 0.35,
        color: '#444',
        weight: 1,
        dashArray: [1, 1],
      };
    }

    const M = feature.properties.M || '';

    let colorDistrito = '#000';

    if (M.includes('Norte')) {
      colorDistrito = '#FF97C9';
    } else if (M.includes('Sur')) {
      colorDistrito = '#97FFC1';
    } else if (M.includes('Este')) {
      colorDistrito = '#9F97FF';
    } else if (M.includes('Oeste')) {
      colorDistrito = '#FF9D97';
    } else if (M.includes('Centro')) {
      colorDistrito = '#97D8FF';
    }

    return {
      fillColor: colorDistrito,
      fillOpacity: 0.35,
      color: '#444',
      weight: 1,
      dashArray: [1, 1],
    };
  };

  return (
    <>
      {geojson && (
        <GeoJSON
          data={geojson as FeatureCollection<Geometry, GeoJsonProperties>}
          style={getPolygonStyle}
          onEachFeature={onEachPolygon}
          key={JSON.stringify(geojson)}
        />
      )}
    </>
  );
}
