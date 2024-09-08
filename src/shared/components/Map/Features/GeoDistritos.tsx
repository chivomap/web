import L from 'leaflet'; // Importar Leaflet
import { GeoJSON } from 'react-leaflet';
import { Feature, Geometry, GeoJsonProperties } from 'geojson';
import { useMapStore } from '../../../../shared/store/mapStore';


export function GeoDistritos() {
  const { geojson } = useMapStore();

  // Define the correct types for onEachPolygon
  const onEachPolygon = (feature: Feature<Geometry, GeoJsonProperties>, layer: L.Layer) => {
    if (feature.properties) {
      const nombre = feature.properties.NAM;
      const M = feature.properties.M;
      console.log("direccionCardinal", M);

      // mouse events
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
      });

      // click event
      layer.on({
        click: () => {
          console.log('CLICK', nombre);
          if (layer instanceof L.Path) {
            layer.setStyle({
              color: '#000',
            });
          }
        },
      });

      layer.bindPopup(`
        <b style="font-size: 1.3rem;">
          ${nombre}
        </b> 
        <br> 
        <span style="font-size: .9rem;">
         ${M}
        </span>`
      );
    }
  };

  // Define the correct types for getPolygonStyle
  const getPolygonStyle = (feature: Feature<Geometry, GeoJsonProperties> | undefined) => {
    if (!feature || !feature.properties) {
      // Devuelve un estilo por defecto si el feature es undefined
      return {
        fillColor: '#000',
        fillOpacity: 0.35,
        color: '#444',
        weight: 1,
        dashArray: [1, 1],
      };
    }

    const M = feature.properties.M as string;
   
    let colorDistrito = "#000";

    if (M.includes('Norte')) {
      colorDistrito = '#F9D82D';
    } else if (M.includes('Sur')) {
      colorDistrito = '#B925FF';
    } else if (M.includes('Este')) {
      colorDistrito = '#31E963';
    } else if (M.includes('Oeste')) {
      colorDistrito = '#FF4E4E';
    } else if (M.includes('Centro')) {
      colorDistrito = '#000';
    }

    return {
      fillColor: colorDistrito,
      fillOpacity: 0.35,
      color: "#444",
      weight: 1,
      dashArray: [1, 1],
    };
  };

  return (
    <>
      {geojson && (
        <GeoJSON
          data={geojson as GeoJSON.FeatureCollection<Geometry, GeoJsonProperties>}
          style={getPolygonStyle}
          onEachFeature={onEachPolygon}
          key={JSON.stringify(geojson)}
        />
      )}
    </>
  );
}