# 📋 Changelog - Cuántos Broders Faltan

Registro de todos los cambios, errores y fixes del proyecto.

---

## [v1.0.0] - 2026-05-13

### ✅ Commit inicial (`f730c52`)
**Descripción:** Primera versión funcional del proyecto.

**Archivos creados:**
- `src/app/page.js` — Página principal
- `src/components/Counter.js` — Contador de martes (pasados, restantes, progreso)
- `src/components/PhotoUpload.js` — Subida de fotos con contraseña + selector de martes
- `src/components/PhotoGallery.js` — Galería agrupada por martes, visor fullscreen, borrado
- `src/app/api/upload/route.js` — API de subida (server-side, con sharp para comprimir)
- `src/app/api/photos/route.js` — API para listar fotos desde Vercel Blob
- `src/app/api/delete/route.js` — API para borrar fotos con contraseña
- `src/lib/tuesdays.js` — Utilidades de cálculo de martes
- `src/app/globals.css` — Diseño completo verde oscuro, mobile-first
- `src/app/layout.js` — Layout raíz con metadata SEO
- `.env.local` — Variables de entorno (no se sube a git)
- `README.md` — Documentación con instrucciones de deploy

**Deploy:** ✅ Exitoso en Vercel (`2w4updLmB`)

---

### 🐛 Bug #1: Contraseña incorrecta aparecía tarde
**Problema:** Al ingresar una contraseña incorrecta en el modal, no mostraba el error inmediatamente. El código tenía un bug donde ambas ramas del `if/else` avanzaban al modal de subida sin importar la contraseña.

**Solución:** Se separó la validación de contraseña para que el error "Contraseña incorrecta ❌" aparezca inmediatamente en el modal de contraseña, sin avanzar al siguiente paso. El error se limpia al empezar a escribir de nuevo.

---

### 🐛 Bug #2: Error al subir foto (body size limit)
**Problema:** Al intentar subir una foto desde el celular, aparecía "Error al subir la foto". La causa era que las fotos de celular pesan 5-10MB, pero las funciones serverless de Vercel tienen un límite de 4.5MB en el body del request.

**Solución:** Se migró de server-side upload a **Vercel Blob client upload**:
- Antes: Browser → Serverless Function → Vercel Blob (limitado a 4.5MB)
- Ahora: Browser → Vercel Blob directo (soporta hasta 25MB)
- Se removió la dependencia de `sharp` (ya no se comprime server-side)
- Se usa `upload()` de `@vercel/blob/client` en el frontend
- Se usa `handleUpload()` de `@vercel/blob/client` en la API route

**Archivos modificados:**
- `src/app/api/upload/route.js` — Reescrito con `handleUpload`
- `src/components/PhotoUpload.js` — Reescrito con `upload()` client-side

### Commit fix (`c030011`)
**Deploy:** ❌ Bloqueado en Vercel

---

### 🐛 Bug #3: Mensaje de error genérico
**Problema:** El mensaje "Error al subir la foto" no daba información útil para debuggear.

**Solución:** Se agregó:
- Chequeo explícito de `BLOB_READ_WRITE_TOKEN` con mensaje descriptivo
- Mejor propagación de errores del servidor al cliente

### Commit fix (`c3f42b6`)
**Deploy:** ❌ Bloqueado en Vercel

---

### 🐛 Bug #4: Deploys bloqueados en Vercel
**Problema:** Los commits se deployaban como "Blocked" con el error:
> "The commit author did not have contributing access to the project on Vercel. The Hobby Plan does not support collaboration for private repositories."

**Causa:** El repositorio de GitHub estaba configurado como **privado**. El plan Hobby de Vercel no permite deploys de colaboradores en repos privados.

**Solución:** Se cambió el repositorio a **público** en GitHub y se pusheó un commit vacío para triggear un nuevo deploy.

### Commit trigger (`31c17dd`)
**Deploy:** ⏳ Pendiente de verificación

---

### ⚠️ Warnings corregidos
- `viewport` y `themeColor` movidos de `metadata` a `viewport` export en `layout.js` (requerido por Next.js 16)
- Hydration mismatch warning — causado por extensión del browser, no por el código

---

## 📝 Notas

### Configuración necesaria en Vercel
1. **Blob Store:** Crear en Storage → Blob → Connect to Project (agrega `BLOB_READ_WRITE_TOKEN` automáticamente)
2. **Variable de entorno:** `UPLOAD_PASSWORD` = `sanfrancisco2026` en Settings → Environment Variables
3. **Redeploy** después de configurar las variables

### Stack técnico
- **Framework:** Next.js 16.2.6 (App Router)
- **Almacenamiento:** Vercel Blob (client upload)
- **Estilos:** Vanilla CSS, tema verde oscuro, mobile-first
- **Fuente:** Outfit (Google Fonts)
- **Deploy:** Vercel (plan Hobby)
- **Repo:** github.com/santifumis710/cuantossbrodersfaltan (público)
