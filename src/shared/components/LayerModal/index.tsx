import React from 'react';
import { useLocation, useRoute } from 'wouter';

export const LayerModal: React.FC = () => {
  const [location, setLocation] = useLocation();

  console.log('location', location);

  // Check if the current path is the home path
  const isHome = useRoute('/')[0];

  return (
    <button
      onClick={() => {
        setLocation('/');
      }}
      className={`bg-black w-screen h-screen opacity-50 z-30 top-0 left-0 cursor-pointer ${isHome ? 'hidden' : 'fixed'}`}
    >
    </button>
  );
};
