# front_style.md — Arquitectura y estilo del front de SmoothManage

Este documento define **cómo se organiza y cómo se ve** el front de SmoothManage. Replica la lógica del backend: un **monolito modular con arquitectura hexagonal (ports and adapters)** y un **único módulo `shared`**. Lo que el backend resuelve con `domain / application / infrastructure / interfaces`, el front lo resuelve con las mismas capas y las mismas reglas.

> **Supuestos.** El front es una SPA en TypeScript. La estructura es agnóstica al framework de componentes (React, Vue, etc.): solo la capa `interfaces` lo conoce. Los estilos se basan en variables CSS (tokens), igual que los prototipos HTML ya construidos (login, notas, tareas y proyectos). Los nombres de código van en inglés, igual que el texto visible de la aplicación.

---

## 1. Principio rector

> El dominio y la aplicación **nunca** dependen de la interfaz ni de la infraestructura. Es la infraestructura (HTTP, almacenamiento local) y la interfaz (componentes, páginas) quienes dependen de los puertos definidos por la aplicación. Las flechas de import siempre apuntan hacia adentro.

```
interfaces (UI) ──► application/port/in ──► domain
                          ▲
infrastructure ──► application/port/out
```

Si un archivo de `domain` o `application` importa algo de `infrastructure`, de `interfaces`, del framework de UI o del DOM (`window`, `document`, `localStorage`), la estructura está rota.

---

## 2. Estructura de carpetas

```
src/
├── main.ts                         # Composition root: único lugar que conoce TODOS los módulos
│                                   #   y conecta adaptadores con puertos (inyección de dependencias)
│
├── shared/                         # ÚNICO módulo compartido (ver sección 4)
│   ├── design-system/
│   │   ├── tokens/                 # colors.css, typography.css, spacing.css, radius.css, motion.css
│   │   ├── components/             # Button, Input, Chip, Tab, Card, ProgressBar, Toast, StatusIcon...
│   │   └── icons/                  # Set de iconos de trazo (estilo Lucide)
│   ├── layout/                     # AppShell, NavBar (compacta/extendida), SidePanel (redimensionable), TabsBar
│   ├── infrastructure/             # Cliente HTTP base, adaptador de storage base, router, i18n runtime
│   └── lib/                        # Utilidades puras usadas por 2+ módulos (fechas, ids, clsx...)
│
└── modules/
    ├── auth/        (login, registro, recuperar contraseña)
    ├── notes/       (carpetas, notas, editor markdown)
    ├── tasks/       (listas de tareas, estados, tablero)
    └── projects/    (tarjetas, detalle; carga notes y tasks)
        │
        ├── public/                 # Contrato público del módulo (única puerta de entrada para otros módulos)
        │   └── index.ts
        │
        ├── domain/
        │   ├── model/              # Entidades y value objects puros (Note, Folder, Task, TaskStatus...)
        │   └── exception/          # Errores de negocio del módulo
        │
        ├── application/
        │   ├── port/
        │   │   ├── in/             # Casos de uso: NotesUseCase, TaskBoardUseCase, ProjectsUseCase...
        │   │   └── out/            # Lo que la aplicación necesita: NoteRepository, TaskRepository, AuthGateway...
        │   ├── service/            # Implementan port/in, usan port/out (TypeScript puro, sin framework)
        │   └── dto/                # Datos de entrada/salida de los casos de uso
        │
        ├── infrastructure/
        │   ├── api/                # Adaptadores HTTP: NoteRepositoryHttpAdapter, AuthGatewayHttpAdapter
        │   └── storage/            # Adaptadores locales: NoteRepositoryLocalStorageAdapter
        │
        └── interfaces/             # Adaptador de entrada: lo que el usuario ve y toca
            ├── pages/              # Pantallas (NotesPage, TasksPage, ProjectsPage, LoginPage)
            ├── components/         # Componentes específicos del módulo (FolderTree, TaskRow, ProjectCard...)
            ├── view-model/         # Hooks/stores que consumen port/in y exponen estado a los componentes
            └── i18n/               # Textos del módulo
```

`main.ts` **no es un módulo**: es el punto de arranque. Es el único archivo autorizado a importar a la vez la infraestructura y los servicios de cada módulo para conectarlos. Así `shared` nunca necesita conocer a los módulos de negocio.

---

## 3. Reglas de asignación (dónde va cada archivo nuevo)

| Si el archivo es...                                                                  | Va en...                                         |
|--------------------------------------------------------------------------------------|--------------------------------------------------|
| Entidad o regla de negocio pura (ej. mover una carpeta sin crear ciclos)             | `domain/model`                                   |
| Error propio de las reglas del módulo (ej. `FolderNameAlreadyExists`)                | `domain/exception`                               |
| Interfaz que describe un caso de uso ("qué hace el módulo")                          | `application/port/in`                            |
| Interfaz de algo externo que el caso de uso necesita (repositorio, gateway, reloj)   | `application/port/out`                           |
| Clase que implementa un caso de uso y orquesta el dominio (incluye el "deshacer")    | `application/service`                            |
| Implementación concreta de un puerto de salida (HTTP, `localStorage`, IndexedDB)     | `infrastructure/api` o `infrastructure/storage`  |
| Página, componente o evento del DOM (arrastrar, clic, teclado)                       | `interfaces/`                                    |
| Hook/store que une la UI con un caso de uso                                          | `interfaces/view-model`                          |
| Token de diseño, componente genérico sin lógica de negocio, iconos                   | `shared/design-system`                           |
| Estructura de pantalla común (barra lateral, pestañas, navbar)                       | `shared/layout`                                  |
| Cliente HTTP base, router, runtime de i18n                                           | `shared/infrastructure`                          |
| Utilidad pura usada por 2+ módulos                                                   | `shared/lib`                                     |

**Ejemplo con lo ya prototipado en Notas**

| Pieza del prototipo                                                         | Destino                                                  |
|-----------------------------------------------------------------------------|----------------------------------------------------------|
| Cálculo de rutas al renombrar/mover carpetas (`repath`), evitar mover una carpeta dentro de sí misma | `notes/domain/model`                        |
| Borrado de carpeta en cascada y pila de "Undo"                               | `notes/application/service`                              |
| Guardar en `localStorage`                                                    | `notes/infrastructure/storage` (implementa `NoteRepository`) |
| Eventos `dragstart/dragover/drop`, doble clic para renombrar, atajo F2        | `notes/interfaces/components`                            |
| Panel lateral con divisor redimensionable                                    | `shared/layout/SidePanel` (lo usan Notes, Tasks y Projects) |
| Render de markdown                                                           | `shared/design-system/components` (lo usan Notes y Tasks) |

---

## 4. El módulo `shared`

Un solo módulo compartido, deliberadamente **pequeño y sin negocio**.

**Entra en `shared` solo si cumple las dos condiciones:**
1. Lo usan (o lo usarían claramente) 2 o más módulos.
2. No contiene reglas de negocio de ningún módulo.

**Qué contiene:** sistema de diseño (tokens + componentes genéricos + iconos), layout de la aplicación, infraestructura técnica base y utilidades puras.

**Qué NO contiene:**
- Entidades de negocio (`Task`, `Note`, `Project`): viven en su módulo.
- Componentes con lenguaje de negocio (`TaskRow`, `FolderTree`): viven en su módulo.
- Imports hacia `modules/*`: `shared` jamás depende de un módulo.

Un componente puede ser genérico aunque tenga nombre de dominio en el prototipo. Por ejemplo, el icono de estado de las tareas se vuelve `StatusIcon` en `shared`, recibe una variante visual (`neutral | progress | danger | success`) y cada módulo decide qué estado de negocio corresponde a cada variante.

---

## 5. Comunicación entre módulos (Projects carga Notes y Tasks)

Los módulos **no se importan entre sí por sus paquetes internos**. Cada módulo expone una puerta explícita, `public/index.ts`, y los demás solo pueden importar desde ahí.

`projects` es el módulo que "carga" a los otros dos. Lo hace así:

```ts
// notes/public/index.ts
export { NotesView } from "../interfaces/public/NotesView";   // componente embebible
export type { NotesQuery } from "./NotesQuery";               // consulta de solo lectura

// NotesView recibe un alcance simple, sin tipos de otros módulos:
//   <NotesView projectId="alpha" />   → solo las notas de ese proyecto
//   <NotesView />                     → toda la bóveda (vista Notes global)
```

```ts
// projects/interfaces/pages/ProjectDetailPage
import { NotesView } from "@notes/public";
import { TasksView } from "@tasks/public";

// pestaña "Notes"  → <NotesView projectId={project.id} />
// pestaña "Tasks"  → <TasksView projectId={project.id} />
```

Reglas:
- El alcance se pasa con **tipos primitivos** (`projectId: string`), no con entidades de otro módulo.
- Para mostrar datos agregados (progreso del proyecto, próximas tareas) `projects` usa un puerto de salida propio, por ejemplo `TaskProgressReader`, implementado por un adaptador que llama a `tasks/public`. El dominio de `projects` no conoce el dominio de `tasks`.
- Las vistas globales (Notes, Tasks) y las embebidas en un proyecto son **el mismo componente** con distinto alcance. No se duplican versiones "mini".
- Un enlace de una tarea a una nota (`[[wikilink]]`) se resuelve con una consulta expuesta en `notes/public`.

---

## 6. Estilo visual

### 6.1 Tokens de color

Se definen una sola vez en `shared/design-system/tokens/colors.css` como variables CSS sobre `:root`. El tema oscuro es el principal; el claro redefine los mismos tokens. Ningún componente usa un hex directamente.

| Token (semántico)   | Alias en prototipos | Oscuro      | Claro       | Uso                                               |
|---------------------|---------------------|-------------|-------------|---------------------------------------------------|
| `--bg`              | `--bg`              | `#141414`   | `#f3f6f6`   | Fondo de la app                                   |
| `--surface`         | `--sf`              | `#1c1c1c`   | `#ffffff`   | Navbar, paneles, tarjetas, editor                 |
| `--surface-2`       | `--sf2`             | `#262626`   | `#e8eff0`   | Hover, filas seleccionadas sin foco               |
| `--border`          | `--bd`              | `#2d4b49`   | `#cbdada`   | Bordes de 1 px (teñidos de teal)                  |
| `--text`            | `--tx`              | `#e6e6e6`   | `#1b2828`   | Texto principal                                   |
| `--text-muted`      | `--mu`              | `#8c8c8c`   | `#667676`   | Texto secundario, iconos inactivos, placeholders  |
| `--accent`          | `--ac`              | `#3baba5`   | `#2a8f89`   | Acción principal, enlaces, elemento activo        |
| `--accent-strong`   | `--ac2`             | `#2b8883`   | `#1f6f6a`   | Segundo extremo del degradado de botones          |
| `--accent-soft`     | `--acs`             | `#3baba526` | `#2a8f8920` | Fondo del elemento activo, chips, anillo de foco  |
| `--danger`          | `--rd`              | `#e5736b`   | `#d65c52`   | Error, prioridad alta, estado Blocked             |
| `--warning`         | `--am`              | `#e0b04a`   | `#b9871f`   | Prioridad media, estado In progress               |

Colores de proyecto (punto de color en las tarjetas): `#3baba5`, `#e0b04a`, `#8d7be0`, `#6fa8dc`.

**Tema.** Se aplica con `prefers-color-scheme` y se puede forzar con `data-theme="dark" | "light"` en `:root`.

### 6.2 Tipografía

- Familia: **Work Sans** (400, 500, 600, 700), con `system-ui, sans-serif` como respaldo.
- Cuerpo 14–15 px / interlineado 1.5. Títulos de pantalla 26–30 px, peso 700, `letter-spacing` −0.02em.
- Etiquetas pequeñas (secciones del panel, metadatos): 11–12 px, peso 600, color `--text-muted`.
- Texto de código y editor markdown: monoespaciada del sistema (`ui-monospace`).

### 6.3 Forma, espacio y bordes

| Elemento                              | Radio     |
|---------------------------------------|-----------|
| Contenedores grandes (navbar, paneles, editor) | 18 px |
| Campos de formulario, botones grandes | 14 px     |
| Filas de árbol, tarjetas pequeñas     | 10–12 px  |
| Chips, pestañas, segmentados          | 12–19 px (píldora) |

- Espaciado base de 4 px; separación entre paneles de 10 px; padding de paneles 14–24 px.
- Todo contenedor lleva borde de 1 px con `--border`. No se usan sombras fuertes; solo el botón principal y las tarjetas flotantes (toast, drag).

### 6.4 Iconografía

Iconos de trazo (estilo Lucide): `stroke-width: 2`, esquinas redondeadas, `currentColor`. Tamaños: 14 (dentro de chips), 16 (filas), 18 (barras), 20 (acciones). Un icono hereda el color del texto; el activo usa `--accent`.

### 6.5 Patrones de estado (iguales en todos los módulos)

| Estado            | Tratamiento                                                                 |
|-------------------|-----------------------------------------------------------------------------|
| Reposo            | Fondo transparente o `--surface`, texto `--text-muted`                       |
| Hover             | Fondo `--surface-2`                                                          |
| Activo/seleccionado | Fondo `--accent-soft` + borde interior de 1 px `--accent` + texto `--text` |
| Foco de teclado   | Anillo de 4 px `--accent-soft` y borde `--accent`                            |
| Error de campo    | Borde `--danger` + mensaje de 12.5 px debajo                                 |
| Arrastrando       | Elemento origen a 40 % de opacidad; destino con `--accent-soft` + borde `--accent`; línea de inserción de 3 px en pestañas |
| Cargando          | Spinner dentro del botón, el texto se oculta, el botón no recibe clics       |
| Vacío             | Mensaje centrado en `--text-muted` que indica la acción siguiente             |
| Destructivo       | Icono en `--text-muted`, rojo `--danger` solo al hover. Sin confirmación modal: aviso con **Undo** durante 8 s |

**Estados de tarea** (componente `StatusIcon`):

| Estado        | Visual                              | Color        |
|---------------|-------------------------------------|--------------|
| Pending       | Círculo vacío                       | `--text-muted` |
| In progress   | Círculo con mitad rellena           | `--warning`  |
| Blocked       | Círculo con raya horizontal         | `--danger`   |
| Done          | Círculo relleno con check           | `--accent`   |

Prioridad: Low `--text-muted`, Medium `--warning`, High `--danger`.

### 6.6 Movimiento

Transiciones de 0.15–0.2 s para hover, foco y rotación de chevrones; entrada de vistas de 0.4 s (desvanecer + 10 px). Se desactivan por completo con `prefers-reduced-motion: reduce`.

---

## 7. Layout de la aplicación (`shared/layout`)

```
┌──────┬───────────────┬┬─────────────────────────────────────────┐
│ Nav  │  Side panel   ││  Tabs bar                               │
│ rail │  (módulo      ││ ┌─────────────────────────────────────┐ │
│      │   activo)     ││ │  Contenido principal del módulo      │ │
│      │               ││ └─────────────────────────────────────┘ │
└──────┴───────────────┴┴─────────────────────────────────────────┘
```

- **NavBar:** solo 3 módulos — Projects, Notes, Tasks — más el menú de expandir/colapsar y el avatar. Compacta de 52 px; extendida de 180–190 px con etiquetas. El módulo activo usa el patrón "activo" de la sección 6.5.
- **SidePanel:** 270 px por defecto, redimensionable de 200 a 560 px con el divisor; doble clic restablece. El ancho se guarda por usuario.
- **TabsBar:** pestañas reordenables por arrastre, nombre truncado con puntos suspensivos y botón de cerrar siempre visible.
- **Responsive:** por debajo de 900 px el panel de marca del login se oculta; por debajo de 820 px se oculta el panel lateral.
- `AppShell` recibe por *slots* el contenido del panel y de la pantalla; **no conoce** ningún módulo.

---

## 8. Catálogo mínimo del sistema de diseño

Cada componente se documenta con sus variantes y estados, y se prueba de forma aislada (Storybook o equivalente).

| Componente        | Variantes / notas                                              |
|-------------------|-----------------------------------------------------------------|
| `Button`          | primary (degradado), ghost, danger; con estado `loading`         |
| `IconButton`      | 16 / 18 / 20 px, aparece al hover cuando está en una fila        |
| `Field` + `Input` | Icono inicial, botón de mostrar/ocultar, mensaje de error        |
| `Checkbox`        | Caja con check; también usada para las tareas                    |
| `Chip`            | Neutro, accent, danger, warning                                  |
| `Segmented`       | Selector de 2–3 opciones (Edit/Read, List/Board, Files/Tasks)    |
| `Tab`             | Con cierre, arrastrable, truncado                                |
| `Card`            | Contenedor con borde; variante con barra de color superior       |
| `ProgressBar`     | 6 px, relleno `--accent`                                         |
| `StatusIcon`      | Cuatro variantes visuales (sección 6.5)                          |
| `Toast`           | Mensaje + acción (Undo), autocierre a los 8 s                    |
| `TreeRow`         | Indentación, chevron, acciones al hover (lápiz, papelera)         |
| `EmptyState`      | Icono opcional, texto y acción                                   |

---

## 9. Estado, datos y errores

- **Cada módulo gestiona su propio estado** en `interfaces/view-model`. No hay un store global compartido entre módulos.
- Los view-models solo conocen puertos `in`. Se les inyecta el servicio desde `main.ts`, nunca lo instancian.
- Los puertos `out` devuelven objetos de dominio o DTO, nunca respuestas crudas de la API. El mapeo vive en el adaptador.
- Persistencia inicial: adaptador `LocalStorage`. Cuando exista backend, se añade el adaptador `Http` y se cambia solo el cableado en `main.ts`; el dominio, los servicios y la UI no se tocan.
- Errores de negocio (`domain/exception`) se traducen a mensajes en `interfaces`; los errores técnicos (red, cuota de storage) se capturan en el adaptador y se exponen con un tipo de error de aplicación.

---

## 10. Nombres y textos

- Sufijo `UseCase` para puertos de entrada (`NotesUseCase`); sin sufijo tecnológico para puertos de salida (`NoteRepository`); sufijo `Adapter` para infraestructura (`NoteRepositoryLocalStorageAdapter`).
- El nombre de un puerto no delata la tecnología: no `NoteLocalStorageRepository` como puerto.
- Páginas con sufijo `Page`; view-models con prefijo `use` (hooks) o sufijo `Store`.
- Texto visible de la aplicación en **inglés**, producto **SmoothManage**. Todos los textos van en archivos de `i18n` (los del módulo en el módulo; los genéricos —"Cancel", "Undo"— en `shared`). Nada de texto fijo dentro de componentes.
- Alias de imports: `@shared/*` y `@<modulo>/public`. Está prohibido importar rutas internas de otro módulo.

---

## 11. Cómo se hace cumplir (arquitectura verificada, no solo acordada)

Reglas con `dependency-cruiser` (o equivalente) ejecutadas en CI:

```js
// .dependency-cruiser.js
module.exports = { forbidden: [
  { name: "domain-is-pure", severity: "error",
    from: { path: "^src/modules/[^/]+/domain" },
    to:   { path: "^src/modules/[^/]+/(application|infrastructure|interfaces)" } },

  { name: "application-no-outer-layers", severity: "error",
    from: { path: "^src/modules/[^/]+/application" },
    to:   { path: "^src/modules/[^/]+/(infrastructure|interfaces)" } },

  { name: "ui-uses-ports-not-services", severity: "error",
    from: { path: "^src/modules/[^/]+/interfaces" },
    to:   { path: "^src/modules/[^/]+/(application/service|infrastructure)" } },

  { name: "no-cross-module-internals", severity: "error",
    from: { path: "^src/modules/([^/]+)/" },
    to:   { path: "^src/modules/[^/]+/",
            pathNot: ["^src/modules/$1/", "^src/modules/[^/]+/public/"] } },

  { name: "shared-knows-no-module", severity: "error",
    from: { path: "^src/shared" },
    to:   { path: "^src/modules" } },
] };
```

Pruebas:
- `domain` y `application`: pruebas unitarias sin DOM ni red, con repositorios en memoria.
- `infrastructure`: pruebas de contrato (el mismo conjunto de pruebas valida el adaptador `LocalStorage` y el `Http`).
- `interfaces`: pruebas de componentes con el caso de uso simulado.
- `shared/design-system`: pruebas visuales de cada variante y estado, en tema claro y oscuro.

---

## 12. Checklist de validación ("¿este módulo del front es hexagonal puro?")

1. ¿Las interfaces de repositorio/gateway están en `application/port/out` y no en `infrastructure`?
2. ¿`infrastructure` contiene solo implementaciones (`...Adapter`)?
3. ¿Existe un puerto `port/in` por cada caso de uso que la UI invoca?
4. ¿Los componentes y view-models inyectan el puerto de entrada y no la clase de servicio concreta?
5. ¿`domain` y `application` están libres de imports de UI, DOM, `localStorage` y de `infrastructure`?
6. ¿Lo que hay en `shared` lo usan 2+ módulos y no contiene reglas de negocio?
7. ¿Los módulos solo se hablan a través de `public/index.ts`, con tipos primitivos en el contrato?
8. ¿Hay algún color, radio o tamaño escrito a mano en lugar de un token?
9. ¿Cada estado (reposo, hover, activo, foco, error, vacío, cargando) se ve igual en todos los módulos?
10. ¿Los textos visibles están en `i18n` y en inglés?

Si alguna respuesta es "no", se señala el archivo exacto y se indica qué se mueve, qué se renombra y qué se crea desde cero (normalmente los `port/in` y los `public/index.ts` no existen todavía y hay que crearlos, no solo moverlos).

---

## 13. Decisiones abiertas

- Framework de componentes (React, Vue u otro) y herramienta de build.
- Si el estado de las pestañas abiertas y del ancho del panel se guarda en el backend o solo en el navegador.
- Cuándo se sustituye el adaptador `LocalStorage` por el `Http` y con qué formato de API.
- Si se añade un bus de eventos tipado en `shared` para avisos entre módulos (por ejemplo, "tarea completada" que actualiza el progreso del proyecto), o si basta con las consultas de `public/`.
- Traducción al español de Tasks y Projects, hoy aún en español en los prototipos.
