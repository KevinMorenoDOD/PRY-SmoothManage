# PRY-SmoothManage

## 📋 Descripción General

**PRY-SmoothManage** es una aplicación completa de gestión integrada que combina un backend robusto (Spring Boot con Java) y un frontend interactivo (Vite + React + TypeScript) para la administración de proyectos, tareas, notas y documentación personal. El sistema está diseñado para ser autosuficiente, escalable y fácil de desplegar en contenedores Docker.

El nombre "SmoothManage" refleja el objetivo principal: proporcionar una experiencia de gestión fluida y sin fricciones para el seguimiento de proyectos personales, tomando decisiones basadas en datos y manteniendo un historial organizado de actividades y notas.

## 🛠️ Tecnologías y Stack

### **Frontend**
- **Vite** - Build tool y dev server ultrarrápido
- **React** - Biblioteca de interfaces de usuario
- **TypeScript** - Tipado estático para mayor robustez
- **ESLint** - Linting de código
- **CSS3** - Estilos personalizados

### **Backend**
- **Spring Boot** - Framework Java para aplicaciones listas para producción
- **Java 21** - Versión más reciente del lenguaje
- **Maven** - Gestor de dependencias y build
- **PostgreSQL** - Base de datos relacional (migraciones con Flyway)
- **Spring Security** - Autenticación y autorización
- **JWT** - Token-based authentication
- **Mail SMTP** - Envío de emails (notificaciones)

### **DevOps y Despliegue**
- **Docker** - Contenerización de ambos servicios
- **Docker Compose** - Orquestación local
- **Render.com** - Despliegue en la nube (plan free tier)
- **Git & GitHub** - Control de versiones y colaboración

### **Herramientas Adicionales**
- **DeepSeek API** - Integración de IA para funcionalidades asistidas
- **Various IDE plugins** - Configuración de desarrollo

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRY-SmoothManage Architecture                │
├─────────────────────┬─────────────────────┬───────────────────────┤
│                     │                     │                       │
│   ┌─────────────┐   │   ┌─────────────┐   │   ┌─────────────┐ │
│   │  Frontend   │   │   │  Backend    │   │   │   Database  │ │
│   │ (React +   │   │   │ (Spring Boot)│   │   │ (Supabase/Postgres)│ │
│   │  Vite)      │   │   │             │   │   │             │ │
│   │  puerto 3000│   │   │  puerto 8080│   │   │             │ │
│   └─────────────┘   │   └─────────────┘   │   └─────────────┘ │
│                     │                     │                       │
└─────────────────────┴─────────────────────┴───────────────────────┘
```

### Flujo de Peticiones
1. **Usuario interactúa** con el frontend (React) en el navegador
2. **Frontend** realiza peticiones API al backend (`/api/v1/...`)
3. **Backend** procesa lógica de negocio, seguridad y acceso a datos
4. **Base de datos** almacena y recupera información (proyectos, tareas, notas)
5. **IA (DeepSeek)** puede integrarse para funcionalidades asistidas

## ⚡ Características Principales

- **Gestión de Proyectos**: Crear, editar y seguir el progreso de proyectos personales
- **Sistema de Tareas**: Organizar tareas con estados y seguimiento de progreso
- **Gestor de Notas**: Almacenar y categorizar notas personales con formato HTML
- **Autenticación Segura**: Registro, login, recuperación de contraseña con JWT
- **Gestión de Email**: Sistema de notificaciones por correo electrónico
- **Respaldo de Datos**: Migraciones de base de datos con Flyway
- **Docker-ready**: Fácil despliegue en contenedores para desarrollo y producción

## 🚀 Instalación y Despliegue

### Requisitos Previos
- Docker y Docker Compose
- Git
- Java 21 (si se ejecuta localmente sin Docker)
- Cuenta en Supabase (opcional, para BD en la nube)

### Despliegue Local con Docker

```bash
# 1. Clonar el repositorio
git clone https://github.com/KevinMorenoDOD/PRY-SmoothManage.git
cd PRY-SmoothManage

# 2. Construir e iniciar todos los servicios
docker-compose up --build
```

### Primera Ejecución
- **Frontend**: Disponible en `http://localhost:3000`
- **Backend API**: Disponible en `http://localhost:8080`
- **API Base URL**: Configurar `VITE_API_BASE_URL` en el `.env.local`

### Configuración de Entorno
El proyecto utiliza un archivo `application-local.properties` para configuración local (credenciales de BD, email, JWT). Este archivo está en `.gitignore` y nunca se sube al repositorio público.

## 📁 Estructura del Proyecto

```
PRY-SmoothManage/
├── smooth-manage-bk/          # Backend Java (Spring Boot)
│   ├── src/main/java/        # Código fuente
│   ├── src/main/resources/   # Configuración
│   └── pom.xml               # Dependencias Maven
├── smooth-manage-fnt/         # Frontend (Vite + React + TypeScript)
│   ├── src/                  # Componentes y lógica
│   ├── dist/                 # Build de producción
│   └── package.json          # Dependencias Node
├── smooth-manage-db/          # Configuración Docker
│   ├── docker-compose.yml
│   └── Dockerfile (planes)
└── README.md                 # Esta documentación
```

## 🎯 Estado Actual del Proyecto

| Módulo | Estado | Comentarios |
|--------|--------|-------------|
| **Backend** | En Desarrollo Activo | Funcionalidades principales implementadas, autenticación completa |
| **Frontend** | En Desarrollo Activo | Interfaz de usuario en iteración, módulos de auth y notes |
| **Base de Datos** | Estructurada | Schema de PostgreSQL con migraciones Flyway |
| **Docker** | Listo para pruebas | Dockerfiles y docker-compose configurados |
| **Despliegue** | Configurado | Ready para Render.com y otras plataformas cloud |

## 💡 Aprendizajes y Logros (Para Hoja de Vida)

### Competencias Desarrolladas

1. **Full-Stack Development**
   - Arquitectura cliente-servidor completa
   - Integración entre frontend (React + TypeScript) y backend (Spring Boot + Java)
   - Comunicación API RESTful con manejo de JWT y autenticación

2. **DevOps y Cloud**
   - Contenedorización con Docker (multi-stage builds)
   - Orquestación con Docker Compose
   - Despliegue en la nube (Render.com free tier)
   - Configuración de variables de entorno y secretos

3. **Buenas Prácticas de Seguridad**
   - Almacenamiento seguro de credenciales (`.gitignore` + `.env.local`)
   - Spring Security con configuración personalizada
   - JWT implementation con firma segura
   - Prevención de data exposure en repositorios públicos

4. **Gestión de Proyectos**
   - Manejo de ramas Git (`login_front` branch)
   - Control de versiones y merge strategies
   - Migración de base de datos con Flyway
   - Estructura modular y escalable

5. **Resolución de Problemas**
   - Optimización de builds de Docker
   - Configuración de caching en builds (pom.xml-first strategy)
   - Manejo de dependencias y resolvers
   - Debugging en entornos locales y producción

## 📦 Próximos Pasos Planeados

- [ ] Implementar módulo completo de gestión de notas con formato HTML
- [ ] Integrar DeepSeek API para funcionalidades asistidas por IA
- [ ] Configurar CI/CD pipeline para despliegue automático
- [ ] Optimizar tiempos de inicio de contenedores Docker
- [ ] Implementar testing unitario y de integración
- [ ] Mejorar UI/UX en todos los módulos
- [ ] Preparar documentación técnica detallada

## 👤 Autor

**Kevin Moreno**  
Desarrollador Full-Stack | Entusiasta de tecnologías cloud y contenerización  
Proyecto personal orientado a la gestión eficiente de proyectos y notas personales.

- **GitHub**: [@KevinMorenoDOD](https://github.com/KevinMorenoDOD)
- **Repositorio**: [PRY-SmoothManage](https://github.com/KevinMorenoDOD/PRY-SmoothManage)

---

*Última actualización: Octubre 2023*

*Este proyecto fue desarrollado como herramienta personal para la gestión de proyectos, notas y tareas, con un fuerte énfasis en buenas prácticas de ingeniería de software, seguridad y despliegue en la nube.*