import React from 'react';
import { Nav, LayerModal } from '../index';

import { Map } from '../Map';

export const MapLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {/* Mapa */}
      <Map />

      {/* Contenido principal */}
      <section className="w-full max-w-2xl mx-auto text-gray-200 z-50 fixed left-1/2 transform -translate-x-1/2 top-[20px]">
        <article className="bg-primary w-11/12 rounded mx-auto">
          {children}
        </article>
      </section>

      {/* Espacio vacío reservado para otro contenido */}
      <div className="z-50 w-[100px] h-[100px] fixed bottom-[100px] right-2 opacity-80 md:right-4 md:bottom-4 md:w-[120px] md:h-[120px]">
        {/* Contenido adicional opcional */}
      </div>

      {/* Navegación */}
      <div className="fixed max-h-[80px] gap-2 bottom-2 w-full flex justify-center z-50 out-bottom">
        <Nav />
      </div>

      {/* Modal */}
      <LayerModal />
    </>
  );
};
