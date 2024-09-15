import React from 'react';
import { Helmet } from "react-helmet";
import { Nav, LayerModal } from '../index';

import { Map } from '../Map';

export const MapLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {/* Mapa */}
      <Map />
      <Helmet>
        {/* Título y descripción */}
        <title>Chivo Map | El Salvador</title>
        <meta name="description" content="Nueva distribución geopolítica del país, incluyendo todos sus distritos, municipios y departamentos. Ideal para educadores, estudiantes y cualquiera interesado en la geografía salvadoreña." />
        <meta name="keywords" content="El Salvador, Mapa Interactivo, Nuevos Municipios, Geografía, Distritos, Municipios, Departamentos" />
        <meta name="author" content="Eliseo Arévalo" />
        <link rel="icon" href="/favicon.ico" />

        {/* Robots */}
        <meta name="robots" content="index, follow" />

        {/* Open Graph para compartir en Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://chivomap.vercel.app" />
        <meta property="og:title" content="Chivo Map | Mapa Interactivo de El Salvador" />
        <meta property="og:description" content="Explora la distribución geopolítica de El Salvador con nuestro mapa interactivo. Ideal para educación y referencia." />
        <meta property="og:image" content="https://chivomap.vercel.app/chivomap.png" />
        <meta property="og:image:alt" content="Chivo Map | Mapa Interactivo de El Salvador" />

        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="Eliseo Arévalo" />
        <meta name="twitter:site" content="@earevalo" />
        <meta name="twitter:title" content="Chivo Map | Mapa Interactivo de El Salvador" />
        <meta name="twitter:description" content="Explora la distribución geopolítica de El Salvador con nuestro mapa interactivo. Ideal para educación y referencia." />
        <meta name="twitter:image" content="https://chivomap.vercel.app/chivomap.png" />
        <meta name="twitter:image:alt" content="Chivo Map | Mapa Interactivo de El Salvador" />
      </Helmet>


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
