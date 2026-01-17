import React, { useState, useEffect } from "react";
import { BiSearchAlt as SearchIcon, BiX as ClearIcon } from "react-icons/bi";
import { getGeoData, GeoDataSearch } from "../../shared/services/GetGeoData";
import { useMapStore } from '../../shared/store/mapStore';
import { getQueryData } from '../../shared/services/GetQueryData';
import { TextCarousel } from './TextCarrusel';
import { useLayoutStore } from '../../shared/store/layoutStore';
import { useErrorStore } from '../../shared/store/errorStore';
import { errorHandler } from '../../shared/errors/ErrorHandler';

export const Search: React.FC = () => {
  const [geoData, setGeoData] = useState<GeoDataSearch>({
    departamentos: [],
    municipios: [],
    distritos: []
  });
  const [inputValue, setInputValue] = useState<string>('');
  const { layoutStates } = useLayoutStore();
  const { search, department } = layoutStates;
  const { updateGeojson } = useMapStore();
  const { showError, setLoading } = useErrorStore();

  useEffect(() => {
    const setCookie = () => {
      try {
        document.cookie = 'hasVisited=true; path=/; max-age=31536000; SameSite=Strict';
      } catch (error) {
        console.warn('Could not set cookie:', error);
      }
    };

    setCookie();

    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getGeoData();
        setGeoData(data.data);
      } catch (error) {
        const handledError = errorHandler.handle(error);
        showError(handledError);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setLoading, showError]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleClearInput = () => {
    setInputValue('');
  }

  const handleClick = async (query: string, whatIs: string) => {
    try {
      setInputValue('');
      setLoading(true);
      
      const data = await getQueryData(query, whatIs);
      if (data) {
        updateGeojson(data);
      } else {
        showError(errorHandler.handle(new Error('No se encontraron datos para la búsqueda')));
      }
    } catch (error) {
      const handledError = errorHandler.handle(error);
      showError(handledError);
    } finally {
      setLoading(false);
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setInputValue('');
    }, 200);
  };

  const filteredDepartamentos = geoData.departamentos.filter(depto =>
    depto?.toLowerCase().includes(inputValue.toLowerCase())
  );
  const filteredMunicipios = geoData.municipios.filter(muni =>
    muni?.toLowerCase().includes(inputValue.toLowerCase())
  );
  const filteredDistritos = geoData.distritos.filter(distrito =>
    distrito?.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <form className="absolute w-full h-min justify-center items-center z-30 top-0 left-0 rounded out-top">
      {search && (
        <div className="flex w-[90%] mx-auto">
          <SearchIcon className="text-white text-[40px] absolute inset-y-0 left-[5%] flex items-center pl-3 pointer-events-none z-30" />
          <div className="w-full flex items-center justify-center">
            <input
              onChange={handleInputChange}
              onBlur={handleBlur}
              value={inputValue}
              type="text"
              placeholder="Busca distritos, municipios, departamentos"
              className="relative w-full p-3 pl-[50px] text-sm bg-primary placeholder-gray-400 text-white rounded border-none outline-none"
            />

            {inputValue && (
              <ClearIcon
                className="text-white text-[35px] absolute right-[5%] flex items-center pr-3 cursor-pointer z-30"
                onClick={handleClearInput} // Limpiar el input al hacer clic
              />
            )}
          </div>

          {inputValue && (
            <section className="mt-[50px] h-min absolute w-full z-30 left-0 rounded-bl rounded-br out-top">
              <div className="flex w-[90%] mx-auto">
                <div className="flex flex-col w-full p-0 text-sm bg-primary placeholder-gray-400 text-white rounded border-none outline-none">
                  <p className="px-4 py-2 font-bold text-blue-300">
                    Departamentos {filteredDepartamentos.length}
                  </p>
                  {filteredDepartamentos.map((depto, index) => (
                    <div key={index} onClick={() => handleClick(depto, 'D')}>
                      <p className="w-full px-4 py-2 cursor-pointer hover:bg-slate-200/20">
                        {depto ?? 'Sin nombre'}
                      </p>
                    </div>
                  ))}
                  <hr className="border-gray-400" />
                  <p className="px-4 py-2 font-bold text-blue-300">
                    Municipios {filteredMunicipios.length}
                  </p>
                  {filteredMunicipios.map((muni, index) => (
                    <div key={index} onClick={() => handleClick(muni, 'M')}>
                      <p className="w-full px-4 py-2 cursor-pointer hover:bg-slate-200/20">
                        {muni ?? 'Sin nombre'}
                      </p>
                    </div>
                  ))}
                  <hr className="border-gray-400" />
                  <p className="px-4 py-2 font-bold text-blue-300">
                    Distritos {filteredDistritos.length}
                  </p>
                  {filteredDistritos.map((distrito, index) => (
                    <div key={index} onClick={() => handleClick(distrito, 'NAM')}>
                      <p className="w-full px-4 py-2 cursor-pointer hover:bg-slate-200/20">
                        {distrito}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      )}

      {department && <TextCarousel />}
    </form>
  );
};
