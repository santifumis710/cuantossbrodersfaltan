# 🍺 ¿Cuántos Broders faltan?

Página web para contar los martes que vamos a Broders con los amigos de la facu.

## Funcionalidades

- ✅ Contador de martes transcurridos y restantes (10 de marzo al 1 de diciembre 2026)
- ✅ Indicador especial si hoy es martes
- ✅ Barra de progreso del año
- ✅ Subida de fotos protegida con contraseña
- ✅ Galería de fotos agrupada por martes
- ✅ Eliminación de fotos con contraseña
- ✅ Compresión automática de imágenes
- ✅ Diseño mobile-first

## Deploy en Vercel

### 1. Subir a GitHub

```bash
cd cuantosbrodersfaltan
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TU_USUARIO/cuantosbrodersfaltan.git
git push -u origin main
```

### 2. Conectar con Vercel

1. Ir a [vercel.com](https://vercel.com) y loguearte con GitHub
2. Click en **"Add New Project"**
3. Importar el repositorio `cuantosbrodersfaltan`
4. Framework preset: **Next.js** (debería autodetectarse)
5. Click en **Deploy**

### 3. Configurar Vercel Blob (almacenamiento de fotos)

1. En el dashboard de Vercel, ir a tu proyecto
2. Ir a **Storage** → **Create Database** → **Blob**
3. Crear un Blob store con el nombre que quieras (ej: "broders-photos")
4. Conectarlo al proyecto → automáticamente agrega `BLOB_READ_WRITE_TOKEN`

### 4. Configurar variable de entorno

1. En Vercel → tu proyecto → **Settings** → **Environment Variables**
2. Agregar:
   - `UPLOAD_PASSWORD` = `sanfrancisco2026`
3. **Redeploy** el proyecto para que tome las variables

### 5. ¡Listo!

Tu página estará disponible en `https://cuantosbrodersfaltan.vercel.app` (o el dominio que Vercel te asigne).

## Desarrollo local

```bash
npm install
npm run dev
```

> ⚠️ Las fotos solo funcionan en producción (Vercel Blob). En local solo funciona el contador.

## Estructura del proyecto

```
cuantosbrodersfaltan/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── upload/route.js    # API para subir fotos
│   │   │   ├── photos/route.js    # API para listar fotos
│   │   │   └── delete/route.js    # API para borrar fotos
│   │   ├── globals.css            # Estilos globales
│   │   ├── layout.js              # Layout raíz
│   │   └── page.js                # Página principal
│   ├── components/
│   │   ├── Counter.js             # Contador de martes
│   │   ├── PhotoUpload.js         # Componente de subida
│   │   └── PhotoGallery.js        # Galería de fotos
│   └── lib/
│       └── tuesdays.js            # Utilidades de cálculo
├── .env.local                     # Variables de entorno (no se sube a git)
├── .gitignore
├── next.config.mjs
├── package.json
└── README.md
```
