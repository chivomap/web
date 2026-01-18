import React, { useState, useEffect, useMemo } from "react";
import { BiSearchAlt as SearchIcon, BiX as ClearIcon } from "react-icons/bi";
import Fuse from 'fuse.js';
import { getGeoData, GeoDataSearch } from "../../shared/services/GetGeoData";
import { useMapStore } from '../../shared/store/mapStore';
import { useAnnotationStore } from '../../shared/store/annotationStore';
import { getQueryData } from '../../shared/services/GetQueryData';
import { TextCarousel } from './TextCarrusel';
import { useLayoutStore } from '../../shared/store/layoutStore';
import { useErrorStore } from '../../shared/store/errorStore';
import { errorHandler } from '../../shared/errors/ErrorHandler';
import { Z_INDEX } from '../../shared/constants/zIndex';

export const Search: React.FC = () => {
  const [geoData, setGeoData] = useState<GeoDataSearch>({
    departamentos: [],
    municipios: [],
    distritos: []
  });
  const [inputValue, setInputValue] = useState<string>('');
  const [showResults, setShowResults] = useState<boolean>(false);
  const { layoutStates } = useLayoutStore();
  const { search, department } = layoutStates;
  const { updateGeojson, setSelectedInfo, setCurrentLevel, setParentInfo, selectedInfo } = useMapStore();
  const { addAnnotation } = useAnnotationStore();
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
    const newValue = event.target.value;
    setInputValue(newValue);
    setShowResults(true);
    
    // Si hay algo seleccionado y el usuario escribe algo diferente, limpiar
    if (selectedInfo && newValue !== selectedInfo.name) {
      updateGeojson(null);
      setSelectedInfo(null);
      setCurrentLevel('departamento');
      setParentInfo(null);
    }
  };

  const handleClearInput = () => {
    setInputValue('');
    setShowResults(false);
    updateGeojson(null);
    setSelectedInfo(null);
    setCurrentLevel('departamento');
    setParentInfo(null);
  }

  const handleClick = async (query: string, whatIs: string) => {
    try {
      // Ocultar lista inmediatamente y mostrar loading
      setInputValue(query);
      setShowResults(false);
      setLoading(true);
      
      const data = await getQueryData(query, whatIs);
      if (data) {
        updateGeojson(data);
        setSelectedInfo({
          type: whatIs === 'D' ? 'Departamento' : whatIs === 'M' ? 'Municipio' : 'Distrito',
          name: query
        });
        
        // Guardar búsqueda en anotaciones
        addAnnotation({
          type: 'search-result',
          name: query,
          data: {
            geojson: data,
            metadata: {
              searchType: whatIs as 'D' | 'M' | 'distrito',
              searchQuery: query,
            },
          },
        });
        
        if (whatIs === 'D') {
          setCurrentLevel('departamento');
          setParentInfo(null);
        } else if (whatIs === 'M') {
          setCurrentLevel('distrito');
          setParentInfo({ municipio: query });
        } else {
          setCurrentLevel('distrito');
        }
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

  // Sincronizar input con selectedInfo
  useEffect(() => {
    if (selectedInfo) {
      setInputValue(selectedInfo.name);
    } else {
      setInputValue('');
    }
  }, [selectedInfo]);

  // Configurar Fuse.js para búsqueda inteligente
  const fuseOptions = {
    threshold: 0.3, // 0 = exacto, 1 = cualquier cosa
    keys: ['name']
  };

  const fuseDepartamentos = useMemo(() => 
    new Fuse(geoData.departamentos.map(d => ({ name: d })), fuseOptions),
    [geoData.departamentos]
  );

  const fuseMunicipios = useMemo(() => 
    new Fuse(geoData.municipios.map(m => ({ name: m })), fuseOptions),
    [geoData.municipios]
  );

  const fuseDistritos = useMemo(() => 
    new Fuse(geoData.distritos.map(d => ({ name: d })), fuseOptions),
    [geoData.distritos]
  );

  // Búsqueda inteligente con límite de resultados
  const LIMIT = 5;
  
  const filteredDepartamentos = inputValue 
    ? fuseDepartamentos.search(inputValue).slice(0, LIMIT).map(r => r.item.name)
    : [];
  
  const filteredMunicipios = inputValue 
    ? fuseMunicipios.search(inputValue).slice(0, LIMIT).map(r => r.item.name)
    : [];
  
  const filteredDistritos = inputValue 
    ? fuseDistritos.search(inputValue).slice(0, LIMIT).map(r => r.item.name)
    : [];

  const totalDepartamentos = inputValue ? fuseDepartamentos.search(inputValue).length : 0;
  const totalMunicipios = inputValue ? fuseMunicipios.search(inputValue).length : 0;
  const totalDistritos = inputValue ? fuseDistritos.search(inputValue).length : 0;

  const hasResults = filteredDepartamentos.length > 0 || filteredMunicipios.length > 0 || filteredDistritos.length > 0;

  return (
    <>
      {/* Backdrop - solo cuando hay resultados visibles */}
      {inputValue && !selectedInfo && hasResults && showResults && (
        <div 
          className="fixed inset-0 bg-black/40"
          style={{ zIndex: Z_INDEX.SEARCH_BACKDROP }}
          onClick={handleClearInput}
        />
      )}

      <form 
        className="absolute w-full h-min justify-center items-center top-0 left-0 rounded out-top"
        style={{ zIndex: Z_INDEX.SEARCH_INPUT }}
      >
        {search && (
          <div className="flex w-[90%] mx-auto relative">
            <SearchIcon className="text-secondary text-2xl absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="w-full flex items-center justify-center">
              <input
                onChange={handleInputChange}
                onFocus={() => setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 200)}
                value={inputValue}
                type="text"
                placeholder="Busca distritos, municipios, departamentos"
              className="relative w-full h-12 px-4 pl-12 text-sm bg-primary placeholder-gray-400 text-secondary rounded-lg border-none outline-none"
            />

            {inputValue && (
              <ClearIcon
                className="text-secondary text-2xl absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer hover:text-secondary/70 transition-colors"
                onClick={handleClearInput}
              />
            )}
          </div>

          {inputValue && !selectedInfo && showResults && (
            <section 
              className="mt-[52px] h-min absolute w-full left-0 rounded-bl rounded-br out-top"
              style={{ zIndex: Z_INDEX.SEARCH_RESULTS }}
            >
              <div className="flex flex-col w-full p-0 text-sm bg-primary placeholder-gray-400 text-white rounded-lg border-none outline-none shadow-lg max-h-[60vh] overflow-y-auto">
                
                {/* Departamentos */}
                {filteredDepartamentos.length > 0 && (
                  <>
                    <p className="px-4 py-2 font-bold text-secondary sticky top-0 bg-primary">
                      Departamentos <span className="text-white/60">
                        {filteredDepartamentos.length}{totalDepartamentos > LIMIT && ` de ${totalDepartamentos}`}
                      </span>
                    </p>
                    {filteredDepartamentos.map((depto, index) => (
                      <div key={index} onClick={() => handleClick(depto, 'D')}>
                        <p className="w-full px-4 py-2 cursor-pointer hover:bg-secondary/10 transition-colors">
                          {depto ?? 'Sin nombre'}
                        </p>
                      </div>
                    ))}
                    <div className="h-px bg-gradient-to-r from-transparent via-secondary/20 to-transparent my-2" />
                  </>
                )}

                {/* Municipios */}
                {filteredMunicipios.length > 0 && (
                  <>
                    <p className="px-4 py-2 font-bold text-secondary sticky top-0 bg-primary">
                      Municipios <span className="text-white/60">
                        {filteredMunicipios.length}{totalMunicipios > LIMIT && ` de ${totalMunicipios}`}
                      </span>
                    </p>
                    {filteredMunicipios.map((muni, index) => (
                      <div key={index} onClick={() => handleClick(muni, 'M')}>
                        <p className="w-full px-4 py-2 cursor-pointer hover:bg-secondary/10 transition-colors">
                          {muni ?? 'Sin nombre'}
                        </p>
                      </div>
                    ))}
                    <div className="h-px bg-gradient-to-r from-transparent via-secondary/20 to-transparent my-2" />
                  </>
                )}

                {/* Distritos */}
                {filteredDistritos.length > 0 && (
                  <>
                    <p className="px-4 py-2 font-bold text-secondary sticky top-0 bg-primary">
                      Distritos <span className="text-white/60">
                        {filteredDistritos.length}{totalDistritos > LIMIT && ` de ${totalDistritos}`}
                      </span>
                    </p>
                    {filteredDistritos.map((distrito, index) => (
                      <div key={index} onClick={() => handleClick(distrito, 'NAM')}>
                        <p className="w-full px-4 py-2 cursor-pointer hover:bg-secondary/10 transition-colors">
                          {distrito}
                        </p>
                      </div>
                    ))}
                  </>
                )}

                {/* Empty state */}
                {filteredDepartamentos.length === 0 && filteredMunicipios.length === 0 && filteredDistritos.length === 0 && (
                  <div className="px-4 py-8 text-center text-white/60">
                    <p className="text-lg mb-2">🔍 No encontramos resultados</p>
                    <p className="text-sm">Intenta con otro término de búsqueda</p>
                  </div>
                )}
                </div>
            </section>
          )}
        </div>
      )}

      {department && <TextCarousel />}
      </form>
    </>
  );
};
