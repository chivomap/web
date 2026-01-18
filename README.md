# ChivoMap 🗺️

Aplicación web interactiva para visualización y análisis de datos geográficos de El Salvador.

![License](https://img.shields.io/badge/license-AGPL--3.0-blue.svg)
![Version](https://img.shields.io/badge/version-2.0.0-green.svg)

## 🌟 Características

- 🔍 Búsqueda de departamentos, municipios y distritos
- 📍 Sistema de anotaciones (pins, polígonos)
- ✏️ Dibujo manual de polígonos
- 📥 Exportación a GeoJSON
- 🗺️ Múltiples estilos de mapa
- 📱 Diseño responsive (móvil y desktop)
- 🎨 Navegación jerárquica con colores por región

## 🚀 Tecnologías

- **React 18** + TypeScript
- **MapLibre GL JS** - Mapas interactivos
- **Tailwind CSS** - Estilos
- **Zustand** - Estado global
- **Turf.js** - Análisis geoespacial
- **Vite** - Build tool

## 📦 Instalación

```bash
# Clonar repositorio
git clone https://github.com/chivomap/web.git
cd web

# Instalar dependencias
pnpm install

# Desarrollo
pnpm dev

# Build para producción
pnpm build
```

## 🎯 Uso

### Búsqueda
- Escribe el nombre de un departamento, municipio o distrito
- Selecciona de los resultados para visualizar en el mapa

### Anotaciones
- **Click derecho** → Menú contextual con opciones
- **Agregar pin** → Marca un punto en el mapa
- **Dibujar polígono** → Activa modo dibujo manual
- **Exportar** → Descarga como GeoJSON

### Navegación
- Click en polígonos para navegar entre niveles
- Departamento → Municipio → Distrito
- Botones de "Volver" para regresar

## 📄 Licencia

Este proyecto está licenciado bajo **GNU Affero General Public License v3.0 (AGPL-3.0)**.

### ¿Qué significa esto?

✅ **Puedes:**
- Usar el software libremente
- Modificarlo según tus necesidades
- Distribuirlo
- Usarlo comercialmente

❌ **Debes:**
- Mantener la misma licencia AGPL-3.0
- Compartir el código fuente de cualquier modificación
- Si lo usas como servicio web, hacer el código disponible a los usuarios

### ¿Por qué AGPL?

Esta licencia protege que ChivoMap siempre sea **software libre y de código abierto**. Evita que:
- Gobiernos o empresas hagan versiones privadas
- Se comercialice sin compartir mejoras con la comunidad
- Se cierre el acceso al código fuente

Para más detalles, ver [LICENSE](./LICENSE) o https://www.gnu.org/licenses/agpl-3.0.html

## 👨‍💻 Desarrollador

**Eliseo Arévalo**
- Website: [eliseo-arevalo.github.io](https://eliseo-arevalo.github.io/)
- GitHub: [@eliseo-arevalo](https://github.com/eliseo-arevalo)

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Este es un proyecto comunitario.

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

Ver [CONTRIBUTING.md](./CONTRIBUTING.md) para más detalles.

## 🏢 Organización

Este proyecto es parte de [ChivoMap](https://github.com/chivomap) - Una iniciativa para democratizar el acceso a datos geográficos de El Salvador.

## 📞 Soporte

- Issues: [GitHub Issues](https://github.com/chivomap/web/issues)
- Discusiones: [GitHub Discussions](https://github.com/chivomap/web/discussions)

## 🙏 Agradecimientos

- Datos geográficos de El Salvador
- Comunidad open source
- Contribuidores del proyecto

---

**Nota importante sobre la licencia:** Si planeas usar ChivoMap en tu organización o modificarlo, por favor lee cuidadosamente la licencia AGPL-3.0. Si tienes dudas sobre cómo cumplir con los términos, abre un issue para discutirlo.
