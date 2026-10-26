#!/bin/sh
# ==================== ENTRYPOINT DE LA IMAGEN ÚNICA ====================
# Arranca Spring Boot (8080, solo localhost) y, cuando está listo, nginx.
# Render no debe recibir tráfico hasta que la API pueda responder: si nginx
# arranca antes, las peticiones al /api devuelven 502 durante el arranque.
set -eu

PORT="${PORT:-10000}"
export PORT

JAVA_PID=""
NGINX_PID=""

terminate() {
    echo "[entrypoint] Deteniendo procesos..."
    if [ -n "$NGINX_PID" ]; then
        kill -TERM "$NGINX_PID" 2>/dev/null || true
    fi
    if [ -n "$JAVA_PID" ]; then
        kill -TERM "$JAVA_PID" 2>/dev/null || true
    fi
}
trap terminate TERM INT QUIT

echo "[entrypoint] Iniciando Spring Boot en 127.0.0.1:8080"
java ${JAVA_OPTS:-} -jar /app/app.jar &
JAVA_PID=$!

# Esperar a que Spring Boot (y su health check con la BD) esté listo.
# Máximo 240 s: en el plan free de Render + Supabase puede tardar ~30-60 s.
echo "[entrypoint] Esperando a que Spring Boot esté listo (máx. 240s)..."
READY=0
i=0
while [ "$i" -lt 120 ]; do
    if ! kill -0 "$JAVA_PID" 2>/dev/null; then
        echo "[entrypoint] Spring Boot terminó durante el arranque" >&2
        exit 1
    fi

    if wget -qO- http://127.0.0.1:8080/actuator/health >/dev/null 2>&1; then
        READY=1
        break
    fi

    i=$((i + 1))
    if [ $((i % 15)) -eq 0 ]; then
        echo "[entrypoint] Aún esperando a Spring Boot ($((i * 2))s)..."
    fi
    sleep 2
done

if [ "$READY" -ne 1 ]; then
    echo "[entrypoint] Spring Boot no respondió en 240s; se cancela el arranque" >&2
    terminate
    exit 1
fi

echo "[entrypoint] Spring Boot listo. Iniciando nginx en 0.0.0.0:${PORT}"
# El entrypoint oficial de nginx procesa /etc/nginx/templates/*.template
# sustituyendo ${PORT} y luego ejecuta "nginx -g daemon off;".
/docker-entrypoint.sh "$@" &
NGINX_PID=$!

# Si cualquiera de los dos procesos muere, se detiene el contenedor para que
# Render lo reinicie en lugar de dejar el servicio sirviendo errores 502.
while kill -0 "$JAVA_PID" 2>/dev/null && kill -0 "$NGINX_PID" 2>/dev/null; do
    sleep 2
done

echo "[entrypoint] Uno de los procesos terminó; apagando el contenedor"
terminate

wait "$JAVA_PID" 2>/dev/null || true
wait "$NGINX_PID" 2>/dev/null || true
