import { create, StateCreator } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';
import providers from '../data/layers.json'; // Asegúrate de usar la ruta correcta

export const providerData = providers as TileProvider[];

// Definir la interfaz para un proveedor de tiles
export interface TileProvider {
  id: string;
  url: string;
  attribution: string;
  ext?: string;
}

// Definir la interfaz para el estado de TileLayer
export interface TileLayerStates {
  providerSelected: string;
}

interface TileLayerState {
  tileLayerStates: TileLayerStates;
  updateProviderSelected: (newProviderId: string) => void;
}

// Definir las opciones de persistencia
type TileLayerStatePersist = (
  config: StateCreator<TileLayerState>,
  options: PersistOptions<TileLayerState>
) => StateCreator<TileLayerState>;

export const useTileLayerStore = create<TileLayerState>(
  (persist as TileLayerStatePersist)(
    (set) => ({
      tileLayerStates: {
        providerSelected: 'Default',
      },
      updateProviderSelected: (newProviderId: string) => set((state) => {
        const providerExists = providers.some((provider: TileProvider) => provider.id === newProviderId);
        console.log('providerExists', providerExists)
        return {
          tileLayerStates: {
            ...state.tileLayerStates,
            providerSelected: providerExists ? newProviderId : 'Default',
          },
        };
      }),
    }),
    {
      name: 'tile-layer-provider-storage', // Nombre del almacenamiento local
      getStorage: () => localStorage, // Usa localStorage
    }
  )
);
