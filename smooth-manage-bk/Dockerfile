# ==================== BACKEND DOCKERFILE (DESARROLLO / SERVICIO SEPARADO) ====================
# La imagen de producción en Render es la del /Dockerfile de la raíz
# (frontend + backend juntos). Este archivo sirve para docker-compose local
# o si algún día despliegas el backend como servicio independiente.
#
# Etapa 1: Compilación (Build) con Maven
FROM maven:3.9.6-eclipse-temurin-21 AS build

WORKDIR /app

# ⭐ PASO CLAVE: Copiar solo pom.xml primero para caching de dependencias
COPY pom.xml .

# Descargar dependencias una sola vez (evita recompilar cada vez)
RUN mvn -B dependency:go-offline

# Copiar todo el código fuente
COPY src ./src

# Compilar y generar el JAR (saltar tests en producción rápida)
RUN mvn -B package -DskipTests

# Etapa 2: Ejecución con JRE ligero
FROM eclipse-temurin:21-jre-alpine

# Crear usuario no root (comandos de Alpine: addgroup/adduser)
RUN addgroup -S smoothmanage && adduser -S -G smoothmanage smoothmanage

WORKDIR /app

# Copiar el JAR generado desde la etapa build (glob directo, sin ARG)
COPY --from=build /app/target/smooth-manage-*.jar /app/app.jar

# Exponer el puerto de Spring Boot
EXPOSE 8080

# Variables de entorno por defecto (sobreescribibles en Render)
ENV SPRING_PROFILES_ACTIVE=default
ENV JAVA_OPTS=""

USER smoothmanage

# Ejecutar la aplicación
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
