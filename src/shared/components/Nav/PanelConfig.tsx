import { IoMapSharp, IoSearchSharp as SearchIcon } from "react-icons/io5";
import { WiEarthquake as EarthquakeIcon } from 'react-icons/wi';
import { useLayoutStore, LayoutStates } from '../../../shared/store/layoutStore';
import { useTileLayerStore, providerData } from '../../../shared/store/tileLayerStore';
import { useState } from "react";

export const PanelConfig = () => {
  const { layoutStates, updateLayoutStates } = useLayoutStore();
  const { updateProviderSelected } = useTileLayerStore();
  const [isProviderListVisible, setIsProviderListVisible] = useState(false);

  const options: { name: string; icon: JSX.Element; stateKey: keyof LayoutStates, desactiveKey: keyof LayoutStates | null }[] = [
    { name: 'Search', icon: <SearchIcon />, stateKey: 'search', desactiveKey: 'department' },
    { name: 'Select Depto', icon: <IoMapSharp />, stateKey: 'department', desactiveKey: 'search' },
    { name: 'Sismos', icon: <EarthquakeIcon />, stateKey: 'earthquake', desactiveKey: null },
  ];

  const handleToggle = (key: keyof LayoutStates, desactiveKey: keyof LayoutStates | null) => {
    let newState = { ...layoutStates, [key]: !layoutStates[key] };
    if (newState[key] && desactiveKey) {
      newState = { ...newState, [desactiveKey]: false };
    } else if (!newState[key] && desactiveKey) {
      newState = { ...newState, [desactiveKey]: true };
    }
    updateLayoutStates(newState);
  };

  const handleProviderChange = (providerId: string) => {
    updateProviderSelected(providerId);
    setIsProviderListVisible(false);
  };

  return (
    <>
      <div className='
        absolute right-0 min-w-[240px] top-[-220px] h-[200px] h-max-[200px] bg-primary py-4 pt-2 config-panel
        text-gray-200 overflow-y-scroll c-scrollbar overflow-x-hidden rounded-xl
        flex flex-col items-center justify-center'>
        
        {isProviderListVisible ? (
          <div className="flex flex-col items-center w-full">
            <button
              onClick={() => setIsProviderListVisible(false)}
              className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-4"
            >
              Back
            </button>
            <ul className="w-full">
              {providerData.map((provider) => (
                <li key={provider.id} className="w-full">
                  <button
                    onClick={() => handleProviderChange(provider.id)}
                    className="block w-full text-left px-4 py-2 text-gray-200 hover:bg-secondary/70"
                  >
                    {provider.id}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className='px-4'>
            {options.map((option, index) => (
              <div key={index} className='flex gap-2 items-center justify-between text-lg w-full'>
                <div className="flex gap-2 items-center justify-center">
                  {option.icon}
                  <p>{option.name}</p>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={layoutStates[option.stateKey]}
                    onChange={() => handleToggle(option.stateKey, option.desactiveKey)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            ))}
            <button
              onClick={() => setIsProviderListVisible(true)}
              className="text-primary bg-secondary hover:bg-secondary/70 focus:ring-4 font-medium rounded-lg text-sm px-5 py-2.5 mt-4"
            >
              Select Map Provider
            </button>
          </div>
        )}
      </div>

      <span className='
        config-panel
        absolute top-[-20px] right-[10px]
        w-0 h-0
        border-l-[15px] border-t-[15px]
        border-l-transparent border-r-transparent border-t-primary
      '></span>
    </>
  );
};
