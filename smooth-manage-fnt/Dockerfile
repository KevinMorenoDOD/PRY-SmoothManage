# ==================== FRONTEND DOCKERFILE ====================
# Etapa 1: Compilación con Node.js y Vite
FROM node:22-alpine AS builder

WORKDIR /app

# URL base de la API inyectada en tiempo de BUILD.
# Por defecto es relativa (/api/v1) y nginx la reenvía al backend.
# Para producción (Render) puedes sobrescribirla con el ARG.
ARG VITE_API_BASE_URL=/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Copiar archivos de dependencias primero para aprovechar el caché de Docker
COPY package.json package-lock.json ./

# Instalar dependencias de forma consistente
RUN npm ci

# Copiar el resto del código fuente (node_modules y dist van en .dockerignore)
COPY . .

# Compilar para producción (tsc + vite build)
RUN npm run build

# Etapa 2: Servir con nginx
FROM nginx:alpine

# Configuración de nginx: SPA + proxy /api -> backend
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos compilados a la carpeta por defecto de nginx
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
