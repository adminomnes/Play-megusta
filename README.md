# PLAY ME GUSTA - Neon Elegant Premium Streaming Platform

Una plataforma de streaming inspirada en Netflix con una estética neón elegante y moderna.

## 🚀 Tecnologías
- **Next.js 15+** (App Router)
- **React 19**
- **Vanilla CSS** (Componentes modulares)
- **TMDB API** (The Movie Database)
- **Lucide React** (Iconos)

## 🛠️ Instalación y Configuración Local

1. Clona el repositorio.
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Configura las variables de entorno. Crea un archivo `.env.local` en la raíz con tu token de TMDB:
   ```env
   TMDB_BEARER_TOKEN=tu_token_aqui
   ```
   *Nota: Debes obtener un "API Read Access Token" desde la configuración de tu cuenta en TMDB.*

4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
5. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto
- `/app`: Rutas y páginas (Next.js App Router).
- `/app/api/tmdb`: Proxy API para evitar exponer el token en el cliente.
- `/components`: Componentes visuales (Navbar, Hero, Row, Card, etc.).
- `/lib`: Utilidades de fetch, tipos y constantes de TMDB.
- `/public`: Activos estáticos.

## ☁️ Despliegue en Cloudflare Pages

Esta aplicación está optimizada para ser desplegada en **Cloudflare Pages** o **Vercel**.

1. Sube tu código a un repositorio de GitHub/GitLab.
2. En Cloudflare Pages, conecta tu repositorio.
3. Configuraciones de build:
   - **Framework preset**: `Next.js`
   - **Build command**: `npm run build`
   - **Build output directory**: `.next`
4. **Variables de Entorno**: Agrega `TMDB_BEARER_TOKEN` en el panel de Cloudflare.

## ✨ Características Premium
- **Estética Neón Elegante**: Contraste alto con resplandores suaves y gradientes premium.
- **100% Responsive**: Optimizado para móviles, tablets y escritorio.
- **Proxy Seguro**: Las peticiones a la API de TMDB pasan por el backend para proteger tus credenciales.
- **Kids Mode**: Filtrado automático de contenido seguro (Animación/Familiar).
- **Lista de Favoritos**: Persistencia local mediante `localStorage`.
- **Skeleton Loaders**: Fluidez visual durante la carga de datos.

---
**Powered by Radio Me Gusta**
