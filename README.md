# Boletín+ · Sistema de Gestión Académica

Aplicación web para gestionar **estudiantes**, **materias** y **calificaciones** de una
institución educativa. Permite dar de alta, listar, editar y eliminar cada entidad, calcula
automáticamente si una calificación está **aprobada o desaprobada** según la nota mínima de
la materia, y mantiene la integridad de los datos con **borrado en cascada**.

> Proyecto Final — Programación III.

---

## 🛠️ Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Front-end | HTML5, CSS3 (sistema de diseño con variables), JavaScript (ES Modules) |
| UI | [Bootstrap 5.3](https://getbootstrap.com/) (vía CDN) |
| Peticiones HTTP | [Axios](https://axios-http.com/) (vía CDN) |
| Back-end / API REST simulada | [json-server](https://github.com/typicode/json-server) v1 |
| Base de datos | `db.json` (archivo plano) |

---

## 📁 Estructura del proyecto

```
.
├── index.html              # Página de Estudiantes (home)
├── materias.html           # Página de Materias
├── calificaciones.html     # Página de Calificaciones
├── db.json                 # "Base de datos" que sirve json-server
├── package.json            # Dependencias y scripts
├── STYLE/
│   └── style.css           # Sistema de diseño (tokens, componentes)
└── JS/
    ├── config.js           # Configuración global (API_URL)
    ├── utils/
    │   └── dom.js          # Helpers compartidos (escapeHtml, mismoId)
    ├── services/           # Capa de datos: SOLO llamadas HTTP (axios)
    │   ├── estudiantes.service.js
    │   ├── materias.service.js
    │   └── calificaciones.service.js
    ├── ui/                 # Capa de vista: SOLO arma el HTML y los formularios
    │   ├── navegacion.js   # Navegación del navbar manejada por el DOM
    │   ├── estudiantes.ui.js
    │   ├── materias.ui.js
    │   └── calificaciones.ui.js
    └── pages/              # Controladores: orquestan services + ui por página
        ├── estudiantes.page.js
        ├── materias.page.js
        └── calificaciones.page.js
```

### Arquitectura por capas

Cada página carga **un único módulo** (`pages/*.page.js`) que importa lo que necesita. La
responsabilidad está separada en tres capas para que cada archivo tenga un solo propósito:

- **services/** → habla con la API (json-server). No toca el DOM.
- **ui/** → arma el HTML y lee/limpia formularios. No hace peticiones.
- **pages/** → conecta las dos anteriores y maneja los eventos del usuario.

---

## 🚀 Puesta en marcha

### Requisitos previos

- [Node.js](https://nodejs.org/) 18 o superior (incluye `npm`).

### 1. Instalar dependencias

```bash
npm install
```

### 2. Levantar la aplicación

```bash
npm start
```

Este único comando levanta **dos servidores en paralelo** (con `concurrently`):

- **API REST** — `json-server` en `http://localhost:3000` (ej.: `http://localhost:3000/estudiantes`).
- **Front-end** — servidor estático en `http://localhost:8080` (HTML, CSS y JS).

> **¿Por qué dos servidores?** Los nombres de las páginas (`materias.html`,
> `calificaciones.html`) coinciden con los de los recursos de la API (`/materias`,
> `/calificaciones`). Sirviéndolos por separado se evita esa colisión: el front vive en
> `:8080` y consume la API en `:3000`.

Luego abrí en el navegador:

```
http://localhost:8080
```

> ⚠️ **Importante:** la app usa **ES Modules**, que el navegador **bloquea si abrís el HTML
> con doble clic** (`file://`). Siempre accedé a través de `http://localhost:8080`.
> Como alternativa, podés correr cada servidor por separado: `npm run api` (API) y
> `npm run front` (front), o usar la extensión **Live Server** de VS Code para el front.

---

## 🔌 Endpoints de la API

`json-server` genera automáticamente un CRUD REST por cada colección de `db.json`:

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/estudiantes` | Lista todos los estudiantes |
| `POST` | `/estudiantes` | Crea un estudiante |
| `PATCH` | `/estudiantes/:id` | Edita un estudiante |
| `DELETE` | `/estudiantes/:id` | Elimina un estudiante |

(Lo mismo aplica para `/materias` y `/calificaciones`.)

---

## ✨ Funcionalidades

- CRUD completo de **estudiantes**, **materias** y **calificaciones**.
- **Validaciones**: campos obligatorios, DNI numérico, notas entre 1 y 10.
- **Control de duplicados**: no se permite repetir DNI ni cargar la misma materia dos veces
  para un mismo alumno.
- **Borrado en cascada**: al eliminar un estudiante o una materia, se borran sus
  calificaciones para no dejar registros huérfanos.
- **Estado de aprobación** calculado automáticamente comparando la nota con la nota mínima
  de la materia.
- **Protección contra XSS**: todo dato del usuario se escapa antes de inyectarse en el DOM.

---

## 👥 Autores

- **Jorge Lazarte** — [GitHub](https://github.com/lazartej71)
- **Lautaro Orellana**[GitHub]()

San Miguel de Tucumán, Argentina.
