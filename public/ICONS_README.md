# PWA Icons Setup

Para completar la configuración PWA, necesitas agregar los siguientes iconos en la carpeta `public/`:

## Iconos Requeridos

1. **icon-192.png** (192x192 píxeles)
   - Icono para dispositivos Android y Chrome
   - Formato: PNG con fondo transparente o color sólido
   - Debe incluir el logo/marca de Medical Clinic

2. **icon-512.png** (512x512 píxeles)
   - Icono de alta resolución para splash screens
   - Formato: PNG con fondo transparente o color sólido
   - Debe incluir el logo/marca de Medical Clinic

## Sugerencias de Diseño

- Usa el color principal Shakespeare (#03b1db) como color de marca
- Incluye un símbolo médico reconocible (ej: cruz médica, estetoscopio, corazón con pulso)
- Mantén el diseño simple y legible en tamaños pequeños
- Asegúrate de que el icono se vea bien tanto en fondos claros como oscuros

## Herramientas Recomendadas

- [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator)
- [Favicon.io](https://favicon.io/)
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- Adobe Illustrator / Figma / Inkscape para diseño

## Generación Rápida

Puedes usar el siguiente comando con pwa-asset-generator:

```bash
npx pwa-asset-generator logo.svg public --icon-only --background "#03b1db"
```

Reemplaza `logo.svg` con tu archivo de logo fuente.
