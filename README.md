# 🚀 WorkHub Frontend

Sistema de gesti- **📄 View (HTML)**: Los archivos `.html` en `src/pages/auth/`n de empleos desarrollado con **TypeScript**, **Vite**, **Bootstrap** y **Supabase**.

## � Arquitectura del Proyecto

### **Estructura de Directorios**

```
src/
├── controllers/     # 🎮 Controladores de página específicos
│   ├── login.ts     # 🔐 Lógica del controlador de login
│   └── register.ts  # ✍️ Lógica del controlador de registro
├── pages/           # 📄 Páginas HTML
│   └── auth/        # 🔐 Páginas de autenticación
│       ├── login.html    # 📄 Formulario de inicio de sesión
│       └── register.html # 📄 Formulario de registro
├── assets/          # 🖼️ Recursos estáticos
│   ├── css/         # 🎨 Estilos CSS
│   └── img/         # 📷 Imágenes
├── lib/             # 🔧 Librerías y utilidades reutilizables
│   ├── auth.ts      # 🛡️ Servicio de autenticación (compartido)
│   ├── client.ts    # 🌐 Cliente de Supabase
│   └── validation.ts # ✅ Sistema de validaciones
├── types/           # 📋 Definiciones de tipos TypeScript
│   └── supabase.ts  # 🗄️ Tipos de base de datos
└── styles/          # 🎨 Estilos SCSS
    ├── main.scss
    └── variables.scss
```

---

## 🏗️ **Patrón de Arquitectura: MVC Frontend**

### **¿Por qué `controllers/` en lugar de `pages/`?**

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
8. 🛡️ Llamada al servicio AuthHandler
   ↓
9. 🌐 Comunicación con Supabase
   ↓
10. 📱 Controller actualiza la UI
   ↓
11. 🔄 Redirección o nueva acción
```

### **🔐 Ejemplo: Login Controller**

```typescript
export class LoginPage {
    private authHandler: AuthHandler;  // 🔗 Servicio de autenticación
    private form: HTMLFormElement | null = null;
    private submitButton: HTMLButtonElement | null = null;

    constructor() {
        this.authHandler = new AuthHandler();  // 🛡️ Inyección de dependencia
        this.init();
    }

    private init(): void {
        // ⏰ Esperar a que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupEventListeners());
        } else {
            this.setupEventListeners();
        }
    }

    private setupEventListeners(): void {
        // 🎯 Selección de elementos por ID específico
        this.form = document.getElementById('loginForm') as HTMLFormElement;
        this.submitButton = document.getElementById('submitButton') as HTMLButtonElement;

        // 📤 Manejo del envío del formulario
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // ✅ Validación en tiempo real
        const inputs = this.form.querySelectorAll('input[type="email"], input[type="password"]');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input as HTMLInputElement));
            input.addEventListener('input', () => this.clearFieldError(input as HTMLInputElement));
        });
    }

    private async handleSubmit(event: Event): Promise<void> {
        event.preventDefault();  // ⛔ Prevenir envío tradicional

        // 📋 Extracción de datos del formulario
        const formData = new FormData(this.form);
        const loginData: LoginCredentials = {
            email: formData.get('email') as string,
            password: formData.get('password') as string,
            rememberMe: formData.get('remember') === 'on'
        };

        // 🔄 Procesamiento asíncrono
        this.setLoading(true);
        
        try {
            // 🛡️ Llamada al servicio de autenticación
            const result = await this.authHandler.login(loginData);

            if (result.success) {
                this.showSuccess('¡Inicio de sesión exitoso! Redirigiendo...');
                setTimeout(() => window.location.href = '/', 1500);
            } else {
                this.showError(result.message || 'Error al iniciar sesión');
            }
        } catch (error: any) {
            this.showError('Ocurrió un error inesperado. Por favor intenta de nuevo.');
        } finally {
            this.setLoading(false);
        }
    }
}
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

## 🛡️ **Sistema de Autenticación**

### **Servicios Principales:**

- **`AuthHandler`**: Clase principal que maneja toda la lógica de autenticación
- **`supabase`**: Cliente configurado para la base de datos
- **`FormValidator`**: Sistema de validación reutilizable

### **Flujo de Autenticación:**

```typescript
// 1. 🎮 Controller captura datos
const loginData: LoginCredentials = { /* ... */ };

// 2. 🛡️ Servicio procesa la autenticación
const result = await this.authHandler.login(loginData);

// 3. 🌐 Supabase maneja la autenticación
const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password
});

// 4. 📱 Controller actualiza la UI
if (result.success) {
    this.showSuccess('¡Login exitoso!');
    window.location.href = '/dashboard';
}
```

---

## ✨ **Características Implementadas**

### **🔐 Login Controller**

- ✅ Validación en tiempo real
- ✅ Estados de carga con spinner
- ✅ Manejo de errores específicos
- ✅ Redirección automática
- ✅ Opción "Recuérdame"

### **✍️ Register Controller**

- ✅ Validación robusta de formulario
- ✅ Confirmación de contraseña
- ✅ Validación de username único
- ✅ Feedback visual Bootstrap
- ✅ Integración con Supabase Auth

### **🎨 UX/UI Features**

- ✅ Mensajes de error en español
- ✅ Alertas Bootstrap con auto-dismiss
- ✅ Validación visual con clases `is-invalid`
- ✅ Estados de loading en botones
- ✅ Diseño responsive

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
import { AuthHandler } from '../lib/auth';
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
import { AuthHandler } from '../lib/auth';

// Tipos
import type { LoginCredentials } from '../lib/auth';

// Utilidades
import { FormValidator } from '../lib/validation';
```

---

## 🎯 **Próximos Pasos**

- [ ] 📊 Dashboard controller
- [ ] 👤 Profile management
- [ ] 📝 Job posting system
- [ ] 🔍 Search functionality
- [ ] 📱 Mobile optimization

---

**🚀 Happy coding!** 🎉
        │   ├── router.ts       # Client-side routing
        │   ├── validation.ts   # Form validation utilities
        │   └── supabaseClient.ts
        └── pages/              # Page-specific TypeScript
            └── login.ts        # Login page logic

```

## 🚀 TypeScript Commands

### Development
```bash
# Build TypeScript files once
npm run build

# Watch for changes and auto-compile
npm run dev
# or
npm run build:watch
```

### File Paths

- **TypeScript Source**: `public/src/**/*.ts`
- **Compiled JavaScript**: `public/js/**/*.js`
- **Type Declarations**: `public/js/**/*.d.ts`

## 🔧 Configuration Details

### tsconfig.json

- **Target**: ES2020
- **Module System**: ES2020 modules
- **Source Root**: `./public/src`
- **Output Directory**: `./public/js`
- **Strict Mode**: Enabled for better type safety

### Features Enabled

- ✅ Source maps for debugging
- ✅ Declaration files (.d.ts)
- ✅ Strict type checking
- ✅ Exact optional property types
- ✅ No unchecked indexed access

## 📝 Usage Examples

### Authentication

```typescript
import { AuthHandler } from '../lib/auth.js';

const auth = new AuthHandler();
const result = await auth.login({
    email: 'user@example.com',
    password: 'password123',
    rememberMe: true
});
```

### Form Validation

```typescript
import { FormValidator, ValidationPatterns } from '../lib/validation.js';

const fields = [{
    name: 'email',
    value: userInput,
    rules: [
        { required: true },
        { pattern: ValidationPatterns.email }
    ]
}];

const validation = FormValidator.validateForm(fields);
```

### Routing

```typescript
import { Router } from '../lib/router.js';

const router = new Router([
    { path: '/login', component: 'LoginPage', title: 'Login - WorkHub' },
    { path: '/dashboard', component: 'Dashboard', title: 'Dashboard - WorkHub' }
]);
```

## 🔗 HTML Integration

### Including Compiled JavaScript

```html
<!-- Use type="module" for ES6 module support -->
<script type="module" src="../../js/pages/login.js"></script>
```

### Form Attributes

Make sure forms have proper `name` attributes for TypeScript integration:

```html
<input type="email" name="email" class="form-control" required>
<input type="password" name="password" class="form-control" required>
```

## 🛠 Development Workflow

1. **Write TypeScript**: Create/edit `.ts` files in `public/src/`
2. **Compile**: Run `npm run build` or `npm run dev` for watch mode
3. **Include in HTML**: Reference the compiled `.js` files from `public/js/`
4. **Test**: Open your HTML pages in browser

## 📚 Available Modules

### AuthHandler

- `login(credentials)` - Handle user login
- `signUp(data)` - Handle user registration

### FormValidator

- `validateField(field)` - Validate single form field
- `validateForm(fields)` - Validate entire form

### Router

- `navigateTo(path)` - Navigate to different routes
- `addRoute(route)` - Add new route definitions

## 🔍 Debugging

- Source maps are enabled - you can debug TypeScript directly in browser DevTools
- Compiled JavaScript includes readable names and structure
- Type declarations help with IDE IntelliSense

## 📦 Dependencies

- **typescript**: ^5.9.2 (DevDependency)
- **Bootstrap**: 5.3.8 (CDN)

---

**Note**: Always run `npm run build` after making changes to TypeScript files before testing in the browser.

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
