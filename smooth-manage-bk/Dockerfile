# ==================== BACKEND DOCKERFILE ====================
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

# Crear usuario no root (mejor práctica de seguridad)
RUN groupadd -r smoothmanage && useradd -r -g smoothmanage smoothmanage

# Copiar el JAR generado desde la etapa build
ARG JAR_FILE=target/smooth-manage-*.jar
COPY --from=build ${JAR_FILE} app.jar

# Exponer el puerto de Spring Boot
EXPOSE 8080

# Variables de entorno por defecto (sobreescribibles en Render)
ENV SPRING_PROFILES_ACTIVE=default
ENV JAVA_OPTS=""

# Ejecutar la aplicación
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app.jar"]