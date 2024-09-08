import { TileLayer } from 'react-leaflet';
import { useTileLayerStore, providerData } from '../../../store/tileLayerStore';

// URL y atribución predeterminadas
const defaultUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const defaultAttribution = "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors";

/** Limite en el mapa */
export const Contribution = () => {
  // Define el tipo del estado usando el tipo adecuado de tu tienda
  const { providerSelected } = useTileLayerStore((state: { tileLayerStates: { providerSelected: string } }) => state.tileLayerStates);

  // Define el tipo del proveedor
  const selectedProvider = providerData.find((provider: { id: string }) => provider.id === providerSelected);

  // Definir la URL del proveedor o utilizar el valor predeterminado
  const url = selectedProvider?.url ? selectedProvider.url : defaultUrl;

  // Reemplazar el placeholder de extensión si aplica
  const urlWithExt = selectedProvider?.ext ? url.replace('{ext}', selectedProvider.ext) : url;

  // Definir la atribución del proveedor o utilizar la predeterminada
  const attribution = selectedProvider?.attribution || defaultAttribution;

  return (
    <TileLayer
      url={urlWithExt}
      attribution={attribution}
    />
  );
};
