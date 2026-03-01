# RepuestosIA - Catálogo de Repuestos con IA

Este proyecto es un catálogo de repuestos automotrices que utiliza Google Sheets como base de datos y Gemini AI para asistir en las búsquedas.

## Requisitos

- Node.js 18+
- Una API Key de Google Gemini (puedes obtenerla en [Google AI Studio](https://aistudio.google.com/app/apikey))
- Una hoja de cálculo de Google o un Google Apps Script que devuelva datos en JSON/CSV.

## Configuración para Despliegue (Vercel / GitHub)

Para que la aplicación funcione correctamente después de subirla a GitHub y desplegarla en Vercel, debes configurar las siguientes **Variables de Entorno** en el panel de control de Vercel:

1.  `VITE_GEMINI_API_KEY`: Tu clave de API de Gemini.
2.  `VITE_GOOGLE_SHEET_ID`: La URL de tu Google Apps Script o el ID de tu hoja de cálculo.

### Pasos para desplegar en Vercel:

1.  Sube este código a un repositorio de GitHub.
2.  Importa el proyecto en Vercel.
3.  En la sección de **Environment Variables**, añade las dos variables mencionadas arriba.
4.  Haz clic en **Deploy**.

## Desarrollo Local

1.  Instala las dependencias: `npm install`
2.  Crea un archivo `.env` basado en `.env.example` y añade tus claves.
3.  Inicia el servidor de desarrollo: `npm run dev`
