# Reporte Técnico de Auditoría de Código: ChivoMap Web

## 1. Resumen Ejecutivo
El proyecto presenta una base moderna utilizando React, TypeScript, Vite y MapLibre GL. La estructura general es coherente, pero existen áreas significativas donde la deuda técnica está acumulándose, principalmente en componentes "Dios" (God Components) que manejan demasiadas responsabilidades. Este reporte detalla los puntos críticos y sugiere optimizaciones para mejorar la mantenibilidad, escalabilidad y rendimiento.

---

## 2. Análisis de Archivos Extensos y Complejidad
Se han identificado archivos que exceden los límites recomendados de responsabilidad y tamaño, dificultando su lectura y mantenimiento.

### 🔴 `src/shared/components/Map/MapLibreMap.tsx` (~289 líneas)
Este es el componente más crítico. Actualmente viola el Principio de Responsabilidad Única (SRP) al manejar:
*   Inicialización y renderizado del mapa.
*   Lógica de dibujo de polígonos (Drawing Logic).
*   Manejo de eventos de teclado (Shortcuts).
*   Interfaz de usuario del Menú Contextual (UI).
*   Lógica de capas (Layers) y tooltips.

**Recomendación:** Refactorizar extrayendo lógica a Custom Hooks y Sub-componentes.
*   `useMapDrawing`: Hook para toda la lógica de dibujo.
*   `useMapHotkeys`: Hook para los atajos de teclado.
*   `<MapContextMenu />`: Componente separado para el menú click derecho.

### 🔴 `src/pages/home/Search.tsx` (~294 líneas)
Maneja la UI de búsqueda, la lógica de filtrado (Fuse.js), llamadas a API y efectos secundarios (Cookies).
*   El renderizado de resultados (Departamentos, Municipios, Distritos) tiene mucho código duplicado.
*   La lógica de Fuse.js está acoplada al componente visual.

---

## 3. Refactorización, SOLID y Clean Code

### Violaciones de SOLID
1.  **SRP (Single Responsibility Principle)**:
    *   `useMapStore.ts`: No solo maneja el estado, sino que contiene lógica de negocio compleja (cálculo de Zoom basado en BBox, validación de GeoJSON). Esta lógica debería estar en un servicio de utilidad (e.g., `MapCalculatorService.ts`).
    *   `MapLibreMap.tsx`: Como se mencionó, hace demasiadas cosas.

2.  **OCP (Open/Closed Principle)**:
    *   El manejo de tipos de búsqueda en `Search.tsx` (`'D'`, `'M'`, `'NAM'`) se hace con condicionales `if/else`. Si se agrega un nuevo tipo, hay que modificar múltiples partes del código.

### Clean Code y Buenas Prácticas
*   **Números Mágicos**: En `mapStore.ts` existen valores como `40075` (circunferencia de la tierra), `1024`, `768` hardcodeados. Deberían moverse a constantes (`EARTH_CIRCUMFERENCE_KM`).
*   **Strings Mágicos**: Cadenas como `'distritos-source'` se repiten. Deberían estar en un archivo de constantes.
*   **Manejo de Excepciones Silencioso**: En `MapLibreMap.tsx`, el evento `onMouseMove` tiene un `try { ... } catch (e) {}` vacío. Esto oculta errores potenciales durante el desarrollo.

---

## 4. Rendimiento y Rerenders

### Problemas Detectados
1.  **Filtrado en cada Render (`Search.tsx`)**:
    Las variables `filteredDepartamentos`, `filteredMunicipios`, etc., se calculan en el cuerpo del componente. Aunque `Fuse` está memoizado, la ejecución de `.search()` ocurre en cada render del componente `Search`, lo cual puede ser costoso si la lista de datos crece.
    *   *Solución*: Envolver los resultados filtrados en `useMemo`.

2.  **Estado Global vs Local**:
    El `mapStore` se suscribe a múltiples partes del estado. Si `updateGeojson` cambia, componentes que solo necesitan `zoom` podrían re-renderizarse si no se usa selectores atómicos de Zustand (e.g., `const zoom = useMapStore(s => s.config.zoom)` en lugar de desestructurar todo).

3.  **Dependencias de Efectos**:
    En `MapLibreMap.tsx`, `useEffect` depende de `currentMapStyle`. Asegurarse de que `currentMapStyle` sea estable referencialmente para evitar reinicializaciones del estilo del mapa innecesarias.

---

## 5. Problemas Lógicos y Funcionales

1.  **Lógica de Cookies en UI (`Search.tsx`)**:
    ```typescript
    useEffect(() => {
      const setCookie = () => { ... }
      setCookie();
      // fetch data...
    }, [])
    ```
    Establecer la cookie `hasVisited` dentro del componente de búsqueda es conceptualmente incorrecto. Si el usuario navega a `/about` y luego vuelve a `/`, se intenta setear la cookie de nuevo. Esto debería estar en un `AppProvider` o en el `layout` principal, ejecutándose una sola vez al cargar la app.

2.  **Hardcoded Values en Store**:
    El cálculo de zoom asume `window.innerWidth` dentro del store. Aunque funciona en cliente, hace que el store sea difícil de testear en aislamiento (Node environment) y frágil.

3.  **Validación de Datos**:
    El `mapStore` confía en que los `features` del GeoJSON tienen ciertas propiedades. Falta validación robusta (Zod o similar) al recibir datos de la API antes de intentar procesarlos.

---

## 6. Plan de Acción Recomendado

1.  **Extraer Lógica de Negocio**: Mover cálculos matemáticos de `mapStore.ts` a `src/shared/utils/geoUtils.ts`.
2.  **Atomizar Componentes**: Dividir `MapLibreMap.tsx` y `Search.tsx`.
3.  **Custom Hooks**: Crear `useSearchLogic` y `useMapInteractions` para separar la vista de la lógica.
4.  **Optimizar Rerenders**: Aplicar `useMemo` a los resultados de búsqueda y revisar selectores de Zustand.
5.  **Centralizar Constantes**: Mover IDs de fuentes de mapa y configuraciones a `src/shared/constants`.
