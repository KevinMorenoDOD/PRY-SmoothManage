#!/bin/sh
# ==================== ENTRYPOINT DE LA IMAGEN ÚNICA ====================
# Arranca Spring Boot (8080, solo localhost) y nginx (puerto público de Render).
# Si cualquiera de los dos procesos muere, se detiene el contenedor para que
# Render lo reinicie en lugar de dejar el servicio sirviendo errores 502.
set -eu

PORT="${PORT:-10000}"
export PORT

echo "[entrypoint] Iniciando Spring Boot en 127.0.0.1:8080"
java ${JAVA_OPTS:-} -jar /app/app.jar &
JAVA_PID=$!

echo "[entrypoint] Iniciando nginx en 0.0.0.0:${PORT}"
# El entrypoint oficial de nginx procesa /etc/nginx/templates/*.template
# sustituyendo ${PORT} y luego ejecuta "nginx -g daemon off;".
/docker-entrypoint.sh "$@" &
NGINX_PID=$!

terminate() {
    echo "[entrypoint] Deteniendo procesos..."
    kill -TERM "$NGINX_PID" "$JAVA_PID" 2>/dev/null || true
}
trap terminate TERM INT QUIT

# Esperar mientras ambos sigan vivos
while kill -0 "$JAVA_PID" 2>/dev/null && kill -0 "$NGINX_PID" 2>/dev/null; do
    sleep 2
done

echo "[entrypoint] Uno de los procesos terminó; apagando el contenedor"
terminate

wait "$JAVA_PID" 2>/dev/null || true
wait "$NGINX_PID" 2>/dev/null || true
