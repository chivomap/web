import  { useState } from 'react';
import { LinksContainer } from './Links';
import { IoSettingsOutline as Settings } from "react-icons/io5";
import { useLocation } from 'wouter';
import { PanelConfig } from './PanelConfig';

export const Nav = () => {
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [location] = useLocation(); // Uso de Wouter para obtener la ubicación actual

  const togglePanel = () => {
    setIsPanelVisible(!isPanelVisible);
  };

  const isHome = location === '/'; // Comprobar si la ruta es la home

  return (
    <>
      <nav className="flex px-5 bg-primary shadow-lg max-w-md rounded-xl">
        <LinksContainer />
      </nav>

      {isHome && (
        <nav className='bg-primary shadow-lg flex rounded-xl relative'>
          {isPanelVisible && (
            <>
              <PanelConfig />
            </>
          )}

          <div className='flex flex-1 items-center justify-center text-center mx-auto px-4 pt-2 w-full text-gray-200 group-hover:text-secondary'>
            <span className="px-1 pt-1 pb-1 flex flex-col items-center cursor-pointer" onClick={togglePanel}>
              <Settings className='text-[2rem] pt-1 mb-1' />
              <span className="block text-xs pb-2">Config</span>
            </span>
          </div>
        </nav>
      )}
    </>
  );
};
