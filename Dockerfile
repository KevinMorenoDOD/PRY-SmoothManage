# syntax=docker/dockerfile:1
# ==================== IMAGEN ÚNICA: FRONTEND + BACKEND ====================
# Construye el JAR de Spring Boot y el bundle de Vite, y los sirve juntos:
#   - nginx escucha en $PORT (Render) y sirve el frontend
#   - nginx hace proxy de /api/ hacia Spring Boot en 127.0.0.1:8080
#
# Un solo servicio en Render => mismo origen => no hay CORS entre front y back.

# ==================== ETAPA 1: BACKEND (Spring Boot) ====================
FROM maven:3.9.6-eclipse-temurin-21 AS backend-build

WORKDIR /build

# Copiar primero el pom para aprovechar el caché de dependencias
COPY smooth-manage-bk/pom.xml ./
RUN mvn -B -q dependency:go-offline

COPY smooth-manage-bk/src ./src
RUN mvn -B -q package -Dmaven.test.skip=true

# ==================== ETAPA 2: FRONTEND (Vite) ====================
FROM node:22-alpine AS frontend-build

WORKDIR /build

# URL relativa: el navegador llama al mismo dominio y nginx hace proxy a Spring Boot.
ARG VITE_API_BASE_URL=/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY smooth-manage-fnt/package.json smooth-manage-fnt/package-lock.json ./
RUN npm ci

COPY smooth-manage-fnt/ ./
RUN npm run build

# ==================== ETAPA 3: RUNTIME (nginx + JRE) ====================
FROM nginx:alpine

# JRE de Alpine para ejecutar el JAR (ligero, sin JDK)
RUN apk add --no-cache openjdk21-jre-headless

WORKDIR /app

COPY --from=backend-build /build/target/smooth-manage-*.jar /app/app.jar
COPY --from=frontend-build /build/dist /usr/share/nginx/html

# Plantilla procesada por el entrypoint oficial de nginx (envsubst de ${PORT})
COPY docker/nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY docker/entrypoint.sh /usr/local/bin/app-entrypoint.sh
RUN chmod +x /usr/local/bin/app-entrypoint.sh

ENV JAVA_OPTS=""
ENV PORT=10000

EXPOSE 10000

ENTRYPOINT ["/usr/local/bin/app-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
