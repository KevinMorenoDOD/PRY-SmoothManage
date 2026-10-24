# ==================== FRONTEND DOCKERFILE ====================
# Etapa 1: Compilación con Node.js y Vite
FROM node:20-alpine AS builder

WORKDIR /app

# ⭐ PASO CLAVE: Copiar archivos de configuración primero (package.json, vite.config.ts)
COPY package.json package-lock.json vite.config.ts tsconfig*.json ./

# Instalar dependencias de forma consistente (npm ci)
RUN npm ci

# Copiar todo el código fuente fuente
COPY vite-env.d.ts tsconfig.app.json tsconfig.node.json src/ public/ ./

# ⚡ Compilar para producción (modo optimizado)
RUN npm run build

# Etapa 2: Servir con nginx (servidor web estándar en producción)
FROM nginx:alpine

# Copiar los archivos compilados a la carpeta por defecto de nginx
# Vite genera archivos en dist/ con nombres hasheados (ideal para caching)
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponer el puerto 80 (HTTP) - Render lo mapeará automáticamente a HTTPS
EXPOSE 80