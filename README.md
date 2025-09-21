# WorkHub Frontend - TypeScript Setup

## 🎯 Overview
This project now includes TypeScript support for better development experience, type safety, and maintainability.

## 📁 Project Structure
```
WorkHub-fe/
├── index.html                    # Main landing page
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependencies and scripts
└── public/
    ├── assets/                   # Static assets (CSS, images)
    ├── js/                      # Compiled JavaScript (auto-generated)
    └── src/                     # TypeScript source files
        ├── app.ts               # Main application entry
        ├── lib/                 # Utility libraries
        │   ├── auth.ts         # Authentication handling
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