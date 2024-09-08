import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer } from 'react-leaflet';
import { LatLng } from 'leaflet';
import { useMapStore } from '../../../shared/store/mapStore';
// import { useLayoutStore } from '../../../shared/store/layoutStore';

import { ClickHandler, MapLoading, MapMarker, PolygonDisplay, Contribution, GeoDistritos } from './Features';
import 'leaflet/dist/leaflet.css';

import { useLocation } from 'wouter';

// Removidos: dynamic imports de Next.js

export const Map: React.FC = () => {
  const [mapReady, setMapReady] = useState<boolean>(false);
  const [clickPosition, setClickPosition] = useState<LatLng | null>(null);
  const [polygonCoords, setPolygonCoords] = useState<LatLng[]>([]);
  const { config, updatePolygon } = useMapStore();
  // const { layoutStates } = useLayoutStore();
  // const { earthquake } = layoutStates;
  const { center, zoom } = config;

  // Reemplazamos useRouter por useLocation de wouter
  const [, navigate] = useLocation();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Backspace' || event.key === 'Delete') {
      setClickPosition(null);
      setPolygonCoords([]);
    } else if (event.ctrlKey && event.key === 'z') {
      setPolygonCoords((prevCoords) => prevCoords.slice(0, -1));
    }
  }, [setClickPosition, setPolygonCoords]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleMapLoad = () => {
    setTimeout(() => {
      setMapReady(true);
    }, 1000);
  };

  const handleMapClick = (latlng: LatLng) => {
    setClickPosition(latlng);
  };

  const handleMapRightClick = (latlng: LatLng) => {
    setPolygonCoords((prevCoords) => [...prevCoords, latlng]);
  };

  const handleExport = () => {
    updatePolygon(polygonCoords);
    navigate('/export');
  };

  return (
    <>
      {!mapReady && <MapLoading />}
      <MapContainer
        key={JSON.stringify(center)}
        center={center}
        zoom={zoom}
        className="w-screen h-screen fixed top-0 left-0"
        maxBounds={[
          [17.838768214469866, -91.00994252677712],
          [11.214449814812207, -85.6233130419287],
        ]}
        maxBoundsViscosity={0.0}
        minZoom={8}
        whenReady={handleMapLoad}
        bounceAtZoomLimits={false}
      >
        <Contribution />
        {mapReady && (
          <>
            {/* {earthquake && <MarnSismos />} */}
            <GeoDistritos />
            <ClickHandler onMapClick={handleMapClick} onMapRightClick={handleMapRightClick} />
            {clickPosition && <MapMarker position={clickPosition} />}
            {polygonCoords.length > 0 && <PolygonDisplay coordinates={polygonCoords} onExport={handleExport} />}
          </>
        )}
      </MapContainer>
    </>
  );
};
