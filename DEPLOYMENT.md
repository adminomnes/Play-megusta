# Deployment Guide - Cloudflare Pages

## Problema
Cloudflare Pages tiene un límite de 1000 archivos cuando se sube directamente desde el dashboard. Next.js genera muchos más archivos que esto.

## Solución Recomendada: Conectar GitHub a Cloudflare Pages

Esta es la forma más fácil y confiable de deployar a Cloudflare Pages:

### Pasos:

1. **Ve a Cloudflare Dashboard**
   - Navega a: https://dash.cloudflare.com
   - Ve a "Workers & Pages" en el menú lateral

2. **Crear nuevo proyecto**
   - Click en "Create application"
   - Selecciona la pestaña "Pages"
   - Click en "Connect to Git"

3. **Conectar GitHub**
   - Autoriza Cloudflare para acceder a tu cuenta de GitHub
   - Selecciona el repositorio: `adminomnes/Play-megusta`

4. **Configurar el build**
   - **Framework preset**: Next.js
   - **Build command**: `npm run build`
   - **Build output directory**: `.next`
   - **Node version**: 18 o superior

5. **Variables de entorno** (si las necesitas)
   - Agrega cualquier variable de entorno necesaria (API keys, etc.)

6. **Deploy**
   - Click en "Save and Deploy"
   - Cloudflare automáticamente:
     - Clonará tu repositorio
     - Instalará dependencias
     - Hará el build
     - Deployará la aplicación

### Ventajas de este método:
- ✅ Sin límite de archivos
- ✅ Deploy automático en cada push a GitHub
- ✅ Preview deployments para cada Pull Request
- ✅ Rollback fácil a versiones anteriores
- ✅ CDN global automático
- ✅ SSL/HTTPS automático

### Configuración del dominio personalizado:
Una vez deployado, puedes configurar tu dominio personalizado en:
- Pages → Tu proyecto → Custom domains → Add custom domain

## Alternativa: Usar Wrangler CLI (Más complejo)

Si prefieres usar la CLI, necesitas:

1. Instalar el adaptador de Cloudflare para Next.js
2. Configurar el proyecto para usar Cloudflare Workers
3. Hacer build y deploy con Wrangler

**Nota**: Este método es más complejo y requiere configuración adicional para rutas dinámicas.

## Recomendación

**Usa la integración con GitHub** - Es más simple, más confiable, y te da deploy automático.
