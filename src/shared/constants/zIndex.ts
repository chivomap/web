/**
 * Sistema centralizado de z-index para evitar conflictos
 * Usar estos valores en lugar de números arbitrarios
 */

export const Z_INDEX = {
  // Base layers
  MAP_BASE: 0,
  MAP_CONTROLS: 10,
  
  // UI Elements
  SEARCH_BACKDROP: 20,
  SEARCH_INPUT: 30,
  SEARCH_RESULTS: 30,
  
  // Overlays
  TOOLTIP: 50,
  BOTTOM_SHEET_BACKDROP: 59,
  BOTTOM_SHEET: 60,
  
  // Modals
  CONTEXT_MENU_BACKDROP: 70,
  CONTEXT_MENU: 71,
  
  // Top level
  MODAL: 100,
  NOTIFICATION: 200,
} as const;

export type ZIndex = typeof Z_INDEX[keyof typeof Z_INDEX];
