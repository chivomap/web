export interface MapStyle {
  id: string;
  name: string;
  url: string;
  description?: string;
}

export const mapStyles: MapStyle[] = [
  {
    id: 'carto-positron',
    name: 'Claro',
    url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    description: 'Modo claro'
  },
  {
    id: 'carto-dark-matter',
    name: 'Oscuro',
    url: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    description: 'Modo oscuro'
  }
];

export const defaultMapStyle = mapStyles[0];
