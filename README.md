# 🚀 WorkHub Frontend

Sistema de gesti- **📄 View (HTML)**: Los archivos `.html` en `src/pages/auth/`n de empleos desarrollado con **TypeScript**, **Vite**, **Bootstrap** y **Supabase**.

## � Arquitectura del Proyecto

## 🗂 Estructura recomendada (actualizada)

```
src/
├── controllers/     # 🎮 Controladores de página (uno por página)
│   ├── login.ts
│   └── register.ts
├── pages/           # 📄 Páginas HTML (public / HTML estático)
│   └── auth/
├── services/        # 🧭 Lógica de negocio / servicios por dominio
│   ├── authService.ts      # Lógica concreta de Auth (usa lib)
│   ├── userService.ts
│   └── projectService.ts
├── lib/             # 🔧 Utilidades de bajo nivel y agnósticas al dominio
│   ├── client.ts    # Cliente HTTP / supabase wrapper
│   ├── auth.ts      # Helpers de autenticación (token store, refresh)
│   └── validation.ts# Validadores y utilidades reutilizables
├── types/           # 📋 Tipos TypeScript
│   └── supabase.ts
└── styles/          # 🎨 Estilos SCSS
    ├── main.scss
    └── variables.scss
```

## 📌 ¿Qué guardar en lib vs services?

- lib (utilidades de bajo nivel)
  - Código agnóstico del dominio.
  - Wrappers de clientes (axios/supabase), helpers de auth (leer/guardar token), validadores, transformaciones genéricas.
  - Debe poder reutilizarse en múltiples features sin depender de rutas o endpoints específicos.
  - Ejemplo: client.ts, validation.ts, small helpers.

- services (lógica por dominio / API)
  - Llamadas a endpoints concretos y orquestación de utilidades de lib.
  - Funciones o clases con métodos como login(), fetchUsers(), createProject().
  - Contiene reglas de negocio ligadas a recursos (users, projects, auth flows).

---

## 🏗️ **Patrón de Arquitectura: MVC Frontend**

El directorio `controllers/` sigue el patrón **Model-View-Controller (MVC)** adaptado al frontend:

- **� View (HTML)**: Los archivos `.html` en `public/auth/`
- **🎮 Controller (TypeScript)**: Los archivos `.ts` en `src/controllers/`
- **🛡️ Model/Service (Auth)**: Los servicios en `src/lib/`

### **Ventajas de esta Arquitectura:**

1. **🎯 Separación Clara de Responsabilidades**
2. **🔄 Reutilización de Código**
3. **📈 Escalabilidad**
4. **🧪 Facilidad de Testing**
5. **🔧 Mantenibilidad**

---

## � **Conexión HTML ↔ TypeScript Controllers**

### **1. Inclusión del Script**

Cada página HTML incluye su controlador específico:

```html
<!-- login.html -->
<script type="module" src="../../controllers/login.ts"></script>

<!-- register.html -->
<script type="module" src="../../controllers/register.ts"></script>
```

### **2. Inicialización Automática**

Los controladores se auto-inicializan al cargar:

```typescript
// Al final de cada controlador
new LoginPage();    // login.ts
new RegisterPage(); // register.ts
```

---

## 🔄 **Flujo de Funcionamiento**

### **� Controller Pattern - Flujo Completo**

```
1. 👤 Usuario visita página HTML
   ↓
2. 📜 HTML carga el script del controlador
   ↓
3. 🎮 Controller se auto-inicializa
   ↓
4. 🎯 Se configuran event listeners
   ↓
5. 👤 Usuario interactúa con el formulario
   ↓
6. 🎮 Controller captura eventos
   ↓
7. ✅ Validación local
   ↓
8. 🛡️ Llamada al servicio AuthService
   ↓
9. 🌐 Comunicación con Supabase
   ↓
10. 📱 Controller actualiza la UI
   ↓
11. 🔄 Redirección o nueva acción
```

---

## 🎯 **Mapeo HTML ↔ Controller**

### **🔗 Convención de IDs y Names**

| **Elemento HTML** | **ID** | **Name** | **Propósito** |
|------------------|--------|----------|---------------|
| Formulario | `loginForm` / `registerForm` | - | Selección del contenedor |
| Input Email | `email` | `email` | ID para validación, name para FormData |
| Input Password | `password` | `password` | ID para validación, name para FormData |
| Botón Submit | `submitButton` | - | Control de estados de carga |

### **📋 Extracción de Datos**

```typescript
// 🎯 Selección por ID (para validación y control)
const emailInput = document.getElementById('email') as HTMLInputElement;

// 📋 Extracción por name (para datos del formulario)
const formData = new FormData(this.form);
const email = formData.get('email') as string;
```

---

## 🚀 **Cómo Extender el Sistema**

### **Agregar Nuevo Controller:**

1. **📁 Crear archivo**: `src/controllers/dashboard.ts`

```typescript
export class DashboardPage {
    constructor() {
        this.init();
    }

    private init(): void {
        // Configuración inicial
    }
}

// Auto-inicialización
new DashboardPage();
```

2. **📄 Crear HTML**: `public/dashboard.html`

```html
<script type="module" src="../src/controllers/dashboard.ts"></script>
```

3. **🔄 Reutilizar servicios**:

```typescript
import { AuthService } from '../lib/auth';
import { supabase } from '../lib/client';
```

---

## 🛠️ **Tecnologías Utilizadas**

- **⚡ Vite**: Build tool y dev server
- **📘 TypeScript**: Tipado estático
- **🎨 Bootstrap 5**: Framework CSS
- **🗄️ Supabase**: Backend as a Service
- **💾 SCSS**: Preprocesador CSS

---

## 🏃‍♂️ **Comandos de Desarrollo**

```bash
# 🚀 Iniciar servidor de desarrollo
npm run dev

# 🏗️ Build para producción
npm run build

# 👀 Preview del build
npm run preview

# 🔍 Type checking
npm run type-check
```

---

## 📚 **Convenciones del Proyecto**

### **📝 Naming Conventions:**

- **Controllers**: `PascalCase` (ej: `LoginPage`)
- **Files**: `kebab-case` (ej: `login.ts`)
- **IDs**: `camelCase` (ej: `loginForm`)
- **Classes CSS**: `kebab-case` (ej: `login-card`)

### **🗂️ File Organization:**

- Un controller por página
- Servicios compartidos en `lib/`
- Tipos en `types/`
- Estilos en `styles/`

### **🔄 Import Patterns:**

```typescript
// Servicios
import { AuthService } from '../lib/auth';

// Tipos
import type { LoginCredentials } from '../lib/auth';

// Utilidades
import { FormValidator } from '../lib/validation';
```

---

## 🛠 Development Workflow

1. **Write TypeScript**: Create/edit `.ts` files in `public/src/`
2. **Compile**: Run `npm run build` or `npm run dev` for watch mode
3. **Include in HTML**: Reference the compiled `.js` files from `public/js/`
4. **Test**: Open your HTML pages in browser

---

## 🖥️ Ver el proyecto en el navegador

Aquí tienes instrucciones rápidas y copiables para compilar y servir la carpeta `public/` localmente.

1) Compilar + servir (rápido)

- Compilar TypeScript una vez:

    ```bash
    npm run build
    ```

- Servir la carpeta `public/` (en otra terminal). Opciones:
  - Con `live-server` (recomendado si lo tienes):

        ```bash
        npx live-server public --port=3000
        ```

  - Con `http-server`:

        ```bash
        npx http-server public -p 3000
        ```

  - Con Python (si no quieres instalar npm adicionales):

        ```bash
        python3 -m http.server 3000 --directory public
        ```

- Abrir en el navegador:

    ```
    http://localhost:3000
    ```

2) Modo desarrollo (compila en watch + servidor)

- Instalar dependencias de desarrollo (una sola vez):

    ```bash
    npm install -D concurrently live-server
    ```

- Actualizar los scripts en `package.json` (ejemplo):

    ```json
    {
        "scripts": {
            "build": "npx tsc",
            "build:watch": "npx tsc --watch",
            "dev": "npx concurrently \"npx tsc --watch\" \"npx live-server public --port=3000\"",
            "start": "npx live-server public --port=3000"
        }
    }
    ```

- Ejecutar modo desarrollo:

    ```bash
    npm run dev
    ```

- Abrir en el navegador:

    ```
    http://localhost:3000
    ```

3) Notas rápidas

- El servidor sólo sirve archivos estáticos desde `public/`. Asegúrate de que los `.js` compilados estén en `public/js/`.
- Si prefieres un flujo moderno con recarga más rápida y bundling (Vite), puedo configurarlo por ti.
