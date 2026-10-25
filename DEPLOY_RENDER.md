# 🚀 Despliegue en Render (imagen única: frontend + backend)

Este proyecto se despliega como **un solo Web Service Docker** que contiene:

```
┌──────────────────────────────────────────────────────────────┐
│                Contenedor (Render Web Service)               │
│                                                              │
│   navegador ──▶ nginx :$PORT ──▶ /            (React + Vite) │
│                       └────────▶ /api/  ──▶ Spring Boot:8080│
│                       └────────▶ /healthz ──▶ /actuator/health│
└──────────────────────────────────────────────────────────────┘
                                │
                                ▼
                     Supabase (PostgreSQL)
```

Ventajas:

- **Un único servicio** en Render (más simple y económico en el plan free).
- **Mismo origen** para frontend y API → no hay CORS entre dominios.
- El backend **no queda expuesto** a Internet; solo nginx publica el puerto.
- Un solo `Dockerfile` multi-stage construye el JAR y el bundle de Vite.

---

## 1. Requisitos

- Repositorio en GitHub con la rama `main` actualizada.
- Proyecto en [Supabase](https://supabase.com) con el schema y las migraciones aplicadas.
- Cuenta en [Render](https://render.com).
- (Opcional) Cuenta de Gmail con contraseña de aplicación para el SMTP.

---

## 2. Cadena de conexión de Supabase

En Supabase: **Project Settings → Database → Connection string → Session pooler**.

Copia los datos y sepáralos en tres variables. **Importante:** Spring Boot necesita el prefijo `jdbc:`.

| Variable | Ejemplo |
|---|---|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://aws-0-<region>.pooler.supabase.com:5432/postgres?sslmode=require` |
| `SPRING_DATASOURCE_USERNAME` | `postgres.<project-ref>` |
| `SPRING_DATASOURCE_PASSWORD` | `tu-password-de-supabase` |

> ✅ Usa el **Session pooler en el puerto 5432**. Es el compatible con Flyway y conexiones persistentes.
>
> ❌ No uses el Transaction pooler (6543) para este backend: puede romper Flyway y los prepared statements.
>
> ❌ No pegues el connection string completo (`postgresql://...`) en `SPRING_DATASOURCE_URL`; Spring necesita `jdbc:postgresql://...`.
>
> 🔐 La contraseña va **solo** en Render, nunca en el repositorio.

---

## 3. Variables de entorno

`render.yaml` ya declara todo. Las marcadas con `sync: false` te las pedirá Render al crear el Blueprint:

| Variable | Obligatoria | Descripción |
|---|---|---|
| `SPRING_PROFILES_ACTIVE` | Sí | `production` (ya definida en `render.yaml`). |
| `SPRING_DATASOURCE_URL` | Sí | URL JDBC del Session pooler de Supabase. |
| `SPRING_DATASOURCE_USERNAME` | Sí | Usuario del pooler (`postgres.<project-ref>`). |
| `SPRING_DATASOURCE_PASSWORD` | Sí | Contraseña de Supabase. |
| `JWT_SIGNING_KEY` | Sí | Render la genera automáticamente (`generateValue: true`). No la cambies después del primer deploy. |
| `SPRING_MAIL_USERNAME` | Sí (correo) | Cuenta de Gmail que envía los correos. |
| `SPRING_MAIL_PASSWORD` | Sí (correo) | Contraseña de aplicación de Gmail (16 caracteres), **no** la contraseña normal. |
| `APP_EMAIL_FROM` | No | Remitente visible. Por defecto `kevin.dev.dod@gmail.com`. |
| `APP_FRONTEND_URL` | No | Se toma de `RENDER_EXTERNAL_URL` automáticamente. |
| `APP_CORS_ALLOWED_ORIGINS` | No | Solo si llamas la API desde otro dominio. Por defecto `http://localhost:3000,http://localhost:5173`. |
| `DEEPSEEK_API_KEY` | No | Solo si usas la integración de IA. |
| `JAVA_OPTS` | No | Ajustes de memoria para el plan free. Ya definido en `render.yaml`. |

> ⚠️ **Correo en el plan free:** Render bloquea el tráfico saliente a los puertos SMTP **25, 465 y 587** en servicios free. Gmail SMTP (465/587) **no funcionará** en el plan free. Opciones:
> - Usar un plan pago de Render (permite 465/587).
> - Usar un proveedor SMTP en el puerto **2525** (Brevo, Mailjet, etc.) y cambiar `SPRING_MAIL_HOST`, `SPRING_MAIL_PORT`, `SPRING_MAIL_USERNAME` y `SPRING_MAIL_PASSWORD`.
> - Integrar una API de correo por HTTPS (Resend, SendGrid, etc.), que requiere adaptar `SmtpEmailService`.
>
> El health check no depende del correo (`management.health.mail.enabled=false`), así que la app arranca aunque el SMTP falle. |

> En el plan **free** de Render (512 MB) se configura `-XX:MaxRAMPercentage=70` para que la JVM no se coma toda la memoria del contenedor.

---

## 4. Desplegar con Blueprint (recomendado)

1. Sube los cambios a `main` (incluye `Dockerfile`, `render.yaml` y `docker/`).
2. En Render: **New → Blueprint**.
3. Conecta el repositorio `PRY-SmoothManage`.
4. Render detecta `render.yaml` y muestra el servicio `smoothmanage`.
5. Rellena las variables `sync: false` del paso anterior.
6. Pulsa **Apply** / **Deploy**.

> ℹ️ Si ya tenías los servicios antiguos `smoothmanage-frontend` y `smoothmanage-backend` en Render, este Blueprint crea uno nuevo llamado `smoothmanage`. Elimina los anteriores cuando confirmes que el nuevo funciona, para no consumir recursos del plan free.
>
> ℹ️ La base de datos `smoothmanage-db` que aparecía en el `render.yaml` anterior ya no se usa. Si aún existe en Render, puedes eliminarla: la BD real está en Supabase.

Render construirá la imagen con el `Dockerfile` de la raíz y publicará:

```
https://smoothmanage.onrender.com
```

El health check usa `GET /healthz`, que nginx reenvía a `/actuator/health` de Spring Boot. Solo responde `200` cuando el backend y la conexión a Supabase están listos.

---

## 5. Verificar el despliegue

```bash
# Frontend
curl -I https://smoothmanage.onrender.com

# Health check (debe devolver {"status":"UP"})
curl https://smoothmanage.onrender.com/healthz

# API (ejemplo: login)
curl -X POST https://smoothmanage.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"...","password":"..."}'
```

En **Logs** de Render deberías ver:

```
[entrypoint] Iniciando Spring Boot en 127.0.0.1:8080
[entrypoint] Iniciando nginx en 0.0.0.0:10000
... Flyway ... Successfully applied ...
... Tomcat started on port 8080 ...
```

---

## 6. CORS: cómo quedó configurado

El frontend se sirve desde el **mismo dominio** y las peticiones van a `/api/v1/...`, que nginx reenvía al backend. Por eso **en producción no se necesita CORS**.

Aun así, el backend quedó con CORS correctamente configurado para desarrollo y para llamadas directas:

- Se activa en la cadena de seguridad con `.cors(Customizer.withDefaults())`.
- Los orígenes se leen de `APP_CORS_ALLOWED_ORIGINS` (lista separada por comas).
- Se eliminó la combinación inválida `allowedOrigin("*")` + `allowCredentials(true)`.
- Si algún día necesitas llamar la API desde otro dominio, añade:

```properties
APP_CORS_ALLOWED_ORIGINS=https://tu-frontend.com,https://otro-dominio.com
```

> No uses `*` en producción salvo que sea realmente necesario. Si lo haces, el backend usa `allowedOriginPatterns` para que las credenciales sigan funcionando.

---

## 7. Probar la imagen localmente (igual que en Render)

```bash
# Construir
docker build -t smoothmanage:local .

# Ejecutar (usa tus credenciales de Supabase)
docker run --rm -p 10000:10000 \
  -e SPRING_PROFILES_ACTIVE=production \
  -e SPRING_DATASOURCE_URL='jdbc:postgresql://aws-0-<region>.pooler.supabase.com:5432/postgres?sslmode=require' \
  -e SPRING_DATASOURCE_USERNAME='postgres.<project-ref>' \
  -e SPRING_DATASOURCE_PASSWORD='tu-password' \
  -e JWT_SIGNING_KEY='una-clave-larga-de-al-menos-64-caracteres-para-firmar-los-jwt-123456' \
  smoothmanage:local

# Abrir
#   http://localhost:10000
#   http://localhost:10000/healthz
```

O con un archivo `.env` (no lo subas al repo):

```bash
docker run --rm -p 10000:10000 --env-file .env.render smoothmanage:local
```

---

## 8. Desarrollo local con Docker Compose

El `docker-compose.yml` de la raíz sigue levantando **dos contenedores** para desarrollo:

```bash
docker compose up --build
```

- Frontend: <http://localhost:3000>
- Backend: <http://localhost:8080>
- El backend monta `smooth-manage-bk/application-local.properties` en `/app/config/`.
- El frontend usa el proxy de nginx (`/api/` → `backend:8080`), así que tampoco hay CORS.

Si no tienes `application-local.properties`, créalo a partir de los valores de Supabase, Gmail y JWT (está en `.gitignore` y nunca se sube).

---

## 9. Problemas comunes

| Síntoma | Causa probable | Solución |
|---|---|---|
| `no open ports detected` | La app no escucha en `$PORT`. | La imagen usa nginx con `${PORT}` (10000 por defecto). Revisa que `PORT` no esté sobrescrita con 8080. |
| `502 Bad Gateway` | Spring Boot aún no arrancó o falló. | Revisa los logs; normalmente es una variable de BD mal escrita. |
| `Flyway validate failed` | Se modificó una migración ya aplicada en Supabase. | No edites migraciones aplicadas: crea una nueva `V06__...sql`. |
| `Connection refused` a Supabase | Estás usando el puerto/direct connection equivocado. | Usa el Session pooler en `5432` y `sslmode=require`. |
| `password authentication failed` | Usuario o contraseña incorrectos. | Usa `postgres.<project-ref>` y la contraseña de la BD (no la de tu cuenta Supabase). |
| El servicio tarda en responder | Plan free: Render duerme el servicio tras inactividad. | Es normal; la primera petición tarda ~30-60 s. |
| `OutOfMemoryError` | JVM con poca memoria en el plan free. | Mantén `JAVA_OPTS=-XX:MaxRAMPercentage=70 -XX:+UseSerialGC`. |
| CORS bloqueado | `APP_CORS_ALLOWED_ORIGINS` no incluye el dominio. | Añade el dominio exacto (con `https://`, sin barra final). |
| No llegan correos en Render free | Render bloquea los puertos SMTP 25/465/587 en free. | Usa un plan pago o un SMTP en puerto 2525 (Brevo, Mailjet) / API HTTPS. |

---

## 10. Actualizaciones

Con `autoDeploy: true`, cada push a `main` reconstruye y despliega la imagen automáticamente. Si cambias variables de entorno, Render reinicia el servicio.
