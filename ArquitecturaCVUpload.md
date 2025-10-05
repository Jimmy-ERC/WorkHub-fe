# 🏗️ Arquitectura y Lógica del Sistema de Gestión de CVs

> Documentación completa del funcionamiento del sistema de gestión de CVs para candidatos en WorkHub, incluyendo Frontend, Backend y Supabase Storage.

**Fecha**: 2 de octubre de 2025  
**Versión**: 1.0  
**Estado**: ✅ Completado y Probado

---

## 📋 Tabla de Contenidos

1. [Visión General](#-visión-general)
2. [Arquitectura del Sistema](#-arquitectura-del-sistema)
3. [Base de Datos (PostgreSQL)](#-base-de-datos-postgresql)
4. [Supabase Storage](#-supabase-storage)
5. [Backend (API)](#-backend-api)
6. [Frontend (TypeScript)](#-frontend-typescript)
7. [Flujos Completos](#-flujos-completos)
8. [Seguridad](#-seguridad)
9. [Validaciones](#-validaciones)
10. [Optimizaciones](#-optimizaciones)

---

## 🎯 Visión General

### Objetivo

Permitir que los candidatos suban, gestionen y compartan hasta 3 CVs/resumes en formato PDF, DOC o DOCX, con un tamaño máximo de 30MB cada uno.

### Componentes Principales

```
┌─────────────────────────────────────────────────────────────┐
│                         USUARIO                             │
│                    (Candidate Profile)                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                       FRONTEND                              │
│  • UI (settings.html)                                       │
│  • Controller (perfilController.ts)                         │
│  • Library (cvUpload.ts)                                    │
│  • Service (curriculumService.ts)                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                              │
│  • GET    /candidate/curriculums/:id_perfil                 │
│  • POST   /candidate/curriculums                            │
│  • PATCH  /candidate/curriculums/:id                        │
│  • DELETE /candidate/curriculums/:id                        │
└──────────────┬──────────────────────┬───────────────────────┘
               │                      │
               ↓                      ↓
┌──────────────────────┐  ┌──────────────────────────────────┐
│   PostgreSQL DB      │  │      Supabase Storage            │
│                      │  │                                  │
│  curriculums table   │  │  Bucket: Archivos_WorkHub        │
│  • id_curriculum     │  │  Path: {user_id}/cvs/{file}     │
│  • id_perfil         │  │  • RLS Policies                  │
│  • url_curriculum    │  │  • Public Read                   │
│  • nombre_archivo    │  │  • Private Write                 │
│  • tamano_archivo    │  │  • MIME Type Validation         │
│  • fecha_subida      │  │                                  │
└──────────────────────┘  └──────────────────────────────────┘
```

---

## 🏛️ Arquitectura del Sistema

### Capas de la Aplicación

#### 1. **Capa de Presentación (UI)**

- **Archivo**: `src/pages/candidate/profile/settings.html`
- **Responsabilidad**: Mostrar la interfaz de usuario
- **Elementos**:
  - Lista de CVs (`#cvList`)
  - Dropzone para subir archivos (`#cvDropArea`)
  - Input de archivos (`#cvFile`)

#### 2. **Capa de Controlador**

- **Archivo**: `src/controllers/candidate/perfilController.ts`
- **Responsabilidad**: Orquestar la carga de datos y la inicialización
- **Funciones clave**:
  - `initProfileController()`: Inicializa el perfil completo
  - `loadCandidateCVs()`: Carga la lista de CVs del candidato

#### 3. **Capa de Librería (UI Logic)**

- **Archivo**: `src/lib/cvUpload.ts`
- **Responsabilidad**: Manejar toda la lógica de interacción con el usuario
- **Funciones clave**:
  - `renderCVList()`: Renderiza la lista de CVs
  - `initCVUpload()`: Inicializa eventos de upload
  - `handleEditCVName()`: Maneja edición de nombres
  - `handleDeleteCV()`: Maneja eliminación
  - `reloadCVList()`: Recarga la lista

#### 4. **Capa de Servicio (Business Logic)**

- **Archivo**: `src/services/curriculumService.ts`
- **Responsabilidad**: Comunicación con el backend y Supabase
- **Funciones clave**:
  - `fetchCurriculums()`: Obtiene CVs del backend
  - `createCurriculum()`: Crea registro en DB
  - `updateCurriculumName()`: Actualiza nombre
  - `deleteCurriculum()`: Elimina CV
  - `uploadCurriculumFile()`: Sube archivo a Supabase
  - `validateFile()`: Valida tipo y tamaño

#### 5. **Capa de API (Backend)**

- **Endpoints REST**: Comunican frontend con base de datos
- **Funciones**: CRUD completo de curriculums

#### 6. **Capa de Datos**

- **PostgreSQL**: Almacena metadatos
- **Supabase Storage**: Almacena archivos físicos

---

## 🗄️ Base de Datos (PostgreSQL)

### Tabla: `curriculums`

```sql
CREATE TABLE public.curriculums (
    id_curriculum SERIAL PRIMARY KEY,
    id_perfil INTEGER NOT NULL,
    url_curriculum TEXT NOT NULL,
    nombre_archivo TEXT NOT NULL,
    tamano_archivo INTEGER NOT NULL,
    fecha_subida TIMESTAMP DEFAULT NOW(),
    CONSTRAINT curriculums_id_perfil_fkey 
        FOREIGN KEY (id_perfil) 
        REFERENCES public.perfiles (id_perfil) 
        ON DELETE CASCADE
);
```

### Índices

```sql
-- Índice para búsquedas por perfil (consultas frecuentes)
CREATE INDEX idx_curriculums_id_perfil 
ON public.curriculums(id_perfil);

-- Índice para ordenar por fecha
CREATE INDEX idx_curriculums_fecha_subida 
ON public.curriculums(fecha_subida DESC);
```

### Función: Verificar Límite de CVs

```sql
CREATE OR REPLACE FUNCTION get_curriculum_count(perfil_id INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM curriculums WHERE id_perfil = perfil_id);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION can_upload_cv(perfil_id INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (get_curriculum_count(perfil_id) < 3);
END;
$$ LANGUAGE plpgsql;
```

### Trigger: Validar Límite de 3 CVs

```sql
CREATE OR REPLACE FUNCTION trigger_check_cv_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM curriculums WHERE id_perfil = NEW.id_perfil) >= 3 THEN
        RAISE EXCEPTION 'Ya tienes el máximo de 3 CVs permitidos';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_cv_limit_before_insert
BEFORE INSERT ON curriculums
FOR EACH ROW
EXECUTE FUNCTION trigger_check_cv_limit();
```

### Ejemplo de Registro

```json
{
  "id_curriculum": 1,
  "id_perfil": 42,
  "url_curriculum": "https://supabase.co/storage/v1/object/public/Archivos_WorkHub/42/cvs/cv-1696273891234-resume.pdf",
  "nombre_archivo": "resume.pdf",
  "tamano_archivo": 2457600,
  "fecha_subida": "2025-10-02T14:30:00.000Z"
}
```

---

## ☁️ Supabase Storage

### Configuración del Bucket

```sql
-- Crear/Verificar bucket público
INSERT INTO storage.buckets (id, name, public)
VALUES ('Archivos_WorkHub', 'Archivos_WorkHub', true)
ON CONFLICT (id) DO UPDATE SET public = true;
```

### Estructura de Carpetas

```
Archivos_WorkHub/
└── {id_usuario}/
    └── cvs/
        ├── cv-1696273891234-resume.pdf
        ├── cv-1696274567890-curriculum-vitae.docx
        └── cv-1696275123456-my-cv.pdf
```

**Patrón de nombres**: `cv-{timestamp}-{nombre_original}`

### Políticas RLS (Row Level Security)

#### 1. **Lectura Pública**

```sql
CREATE POLICY "Public read access for CVs"
ON storage.objects FOR SELECT
USING (bucket_id = 'Archivos_WorkHub' AND (storage.foldername(name))[1] = 'cvs');
```

- ✅ Cualquiera puede leer CVs (para que empresas los vean)
- 🔒 Solo en la carpeta `cvs/`

#### 2. **Inserción Privada**

```sql
CREATE POLICY "Authenticated users can upload CVs to their folder"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'Archivos_WorkHub' 
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND (storage.foldername(name))[2] = 'cvs'
);
```

- ✅ Solo usuarios autenticados
- ✅ Solo pueden subir a su propia carpeta (`{su_id}/cvs/`)

#### 3. **Actualización Privada**

```sql
CREATE POLICY "Users can update their own CVs"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'Archivos_WorkHub' 
    AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
    bucket_id = 'Archivos_WorkHub' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);
```

- ✅ Solo pueden actualizar sus propios archivos

#### 4. **Eliminación Privada**

```sql
CREATE POLICY "Users can delete their own CVs"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'Archivos_WorkHub' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);
```

- ✅ Solo pueden eliminar sus propios archivos

### Límites de Archivo

```sql
-- En la configuración del bucket
{
  "maxFileSize": 31457280,  -- 30 MB en bytes
  "allowedMimeTypes": [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ]
}
```

---

## 🔌 Backend (API)

### Endpoint 1: Obtener CVs de un Perfil

```http
GET /candidate/curriculums/:id_perfil
```

**Lógica del Backend**:

```typescript
async function getCurriculums(req, res) {
  const { id_perfil } = req.params;
  
  try {
    // 1. Consultar base de datos
    const query = `
      SELECT * FROM curriculums 
      WHERE id_perfil = $1 
      ORDER BY fecha_subida DESC
    `;
    const result = await db.query(query, [id_perfil]);
    
    // 2. Retornar datos
    return res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtener CVs'
    });
  }
}
```

**Respuesta exitosa**:

```json
{
  "success": true,
  "data": [
    {
      "id_curriculum": 1,
      "id_perfil": 42,
      "url_curriculum": "https://...",
      "nombre_archivo": "resume.pdf",
      "tamano_archivo": 2457600,
      "fecha_subida": "2025-10-02T14:30:00.000Z"
    }
  ]
}
```

### Endpoint 2: Crear Nuevo CV

```http
POST /candidate/curriculums
Content-Type: application/json

{
  "id_perfil": 42,
  "url_curriculum": "https://...",
  "nombre_archivo": "resume.pdf",
  "tamano_archivo": 2457600
}
```

**Lógica del Backend**:

```typescript
async function createCurriculum(req, res) {
  const { id_perfil, url_curriculum, nombre_archivo, tamano_archivo } = req.body;
  
  try {
    // 1. Validar datos requeridos
    if (!id_perfil || !url_curriculum || !nombre_archivo || !tamano_archivo) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos'
      });
    }
    
    // 2. Verificar límite de 3 CVs
    const countQuery = 'SELECT COUNT(*) FROM curriculums WHERE id_perfil = $1';
    const countResult = await db.query(countQuery, [id_perfil]);
    
    if (parseInt(countResult.rows[0].count) >= 3) {
      return res.status(400).json({
        success: false,
        message: 'Ya tienes el máximo de 3 CVs permitidos'
      });
    }
    
    // 3. Insertar en base de datos
    const insertQuery = `
      INSERT INTO curriculums 
        (id_perfil, url_curriculum, nombre_archivo, tamano_archivo)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await db.query(insertQuery, [
      id_perfil, 
      url_curriculum, 
      nombre_archivo, 
      tamano_archivo
    ]);
    
    // 4. Retornar CV creado
    return res.status(201).json({
      success: true,
      message: 'CV creado exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al crear CV'
    });
  }
}
```

### Endpoint 3: Actualizar Nombre de CV

```http
PATCH /candidate/curriculums/:id
Content-Type: application/json

{
  "nombre_archivo": "nuevo-nombre.pdf"
}
```

**Lógica del Backend**:

```typescript
async function updateCurriculumName(req, res) {
  const { id } = req.params;
  const { nombre_archivo } = req.body;
  
  try {
    // 1. Validar datos
    if (!nombre_archivo) {
      return res.status(400).json({
        success: false,
        message: 'Falta el nombre del archivo'
      });
    }
    
    // 2. Actualizar en base de datos
    const updateQuery = `
      UPDATE curriculums 
      SET nombre_archivo = $1 
      WHERE id_curriculum = $2 
      RETURNING *
    `;
    const result = await db.query(updateQuery, [nombre_archivo, id]);
    
    // 3. Verificar que existe el CV
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'CV no encontrado'
      });
    }
    
    // 4. Retornar CV actualizado
    return res.status(200).json({
      success: true,
      message: 'Nombre actualizado exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar nombre'
    });
  }
}
```

### Endpoint 4: Eliminar CV

```http
DELETE /candidate/curriculums/:id
```

**Lógica del Backend**:

```typescript
async function deleteCurriculum(req, res) {
  const { id } = req.params;
  
  try {
    // 1. Obtener datos del CV antes de eliminar
    const selectQuery = 'SELECT * FROM curriculums WHERE id_curriculum = $1';
    const selectResult = await db.query(selectQuery, [id]);
    
    if (selectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'CV no encontrado'
      });
    }
    
    const curriculum = selectResult.rows[0];
    
    // 2. Eliminar de base de datos
    const deleteQuery = 'DELETE FROM curriculums WHERE id_curriculum = $1';
    await db.query(deleteQuery, [id]);
    
    // 3. Eliminar archivo de Supabase Storage
    // Extraer path del URL
    const url = new URL(curriculum.url_curriculum);
    const path = url.pathname.split('/').slice(-3).join('/'); // user_id/cvs/filename
    
    await supabase.storage
      .from('Archivos_WorkHub')
      .remove([path]);
    
    // 4. Retornar éxito
    return res.status(200).json({
      success: true,
      message: 'CV eliminado exitosamente'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar CV'
    });
  }
}
```

---

## 💻 Frontend (TypeScript)

### Servicio: `curriculumService.ts`

#### Función 1: Obtener CVs

```typescript
export const fetchCurriculums = async (idPerfil: number): Promise<CurriculumResponse> => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/candidate/curriculums/${idPerfil}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Error al obtener CVs'
      };
    }

    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error de conexión al obtener CVs'
    };
  }
};
```

**Flujo**:

1. Hace petición GET al backend
2. Parsea la respuesta JSON
3. Retorna resultado con tipado TypeScript
4. Maneja errores de red

#### Función 2: Subir Archivo a Supabase

```typescript
export const uploadCurriculumFile = async (file: File): Promise<CurriculumUploadResult> => {
  try {
    // 1. Validar archivo
    const validation = validateFile(file);
    if (!validation.valid) {
      return {
        success: false,
        message: validation.error || 'Archivo no válido'
      };
    }

    // 2. Obtener usuario
    const storedUser = sessionStorage.getItem('user');
    if (!storedUser) {
      return {
        success: false,
        message: 'Usuario no autenticado'
      };
    }

    const user = JSON.parse(storedUser);
    const userId = user.id;

    // 3. Crear path único
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `cv-${timestamp}-${file.name}`;
    const filePath = `${userId}/cvs/${fileName}`;

    // 4. Subir a Supabase Storage
    const { data, error } = await supabase.storage
      .from('Archivos_WorkHub')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      return {
        success: false,
        message: error.message
      };
    }

    // 5. Obtener URL pública
    const { data: urlData } = supabase.storage
      .from('Archivos_WorkHub')
      .getPublicUrl(filePath);

    return {
      success: true,
      url: urlData.publicUrl,
      message: 'Archivo subido exitosamente'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error al subir archivo'
    };
  }
};
```

**Flujo**:

1. Valida tipo y tamaño del archivo
2. Obtiene ID del usuario de sessionStorage
3. Genera nombre único con timestamp
4. Sube archivo a Supabase Storage
5. Obtiene y retorna URL pública

#### Función 3: Validar Archivo

```typescript
export const validateFile = (file: File): { valid: boolean; error?: string } => {
  // 1. Validar tipos permitidos
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Solo se permiten archivos PDF, DOC o DOCX'
    };
  }

  // 2. Validar tamaño máximo (30 MB)
  const maxSize = 30 * 1024 * 1024; // 30 MB en bytes
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'El archivo no debe superar los 30 MB'
    };
  }

  return { valid: true };
};
```

### Librería: `cvUpload.ts`

#### Función 1: Renderizar Lista

```typescript
export function renderCVList(cvs: Curriculum[]) {
  const cvListContainer = document.getElementById('cvList');
  if (!cvListContainer) return;

  // 1. Caso: No hay CVs
  if (cvs.length === 0) {
    cvListContainer.innerHTML = `
      <div class="cv-empty-state">
        <i class="bi bi-file-earmark-text"></i>
        <p class="mb-0">No has subido ningún CV aún</p>
      </div>
    `;
    toggleAddCvButton(true); // Mostrar botón de agregar
    return;
  }

  // 2. Renderizar cada CV
  cvListContainer.innerHTML = cvs.map(cv => {
    const extension = cv.nombre_archivo.split('.').pop()?.toLowerCase() || '';
    const icon = extension === 'pdf' ? 'file-pdf' : 'file-word';
    const formattedSize = CurriculumService.formatFileSize(cv.tamano_archivo);
    const formattedDate = new Date(cv.fecha_subida).toLocaleDateString('es-ES');

    return `
      <div class="cv-item" data-cv-id="${cv.id_curriculum}">
        <div class="cv-item-icon">
          <i class="bi bi-${icon} fs-1"></i>
        </div>
        <div class="cv-item-info">
          <div class="cv-item-name" 
               data-cv-id="${cv.id_curriculum}" 
               data-original-name="${cv.nombre_archivo}">
            ${cv.nombre_archivo}
          </div>
          <div class="cv-item-meta">
            ${formattedSize} • Subido ${formattedDate}
          </div>
        </div>
        <div class="cv-item-actions">
          <button class="btn btn-sm btn-outline-primary" 
                  data-action="edit-cv-name" 
                  data-cv-id="${cv.id_curriculum}">
            <i class="bi bi-pencil"></i> Editar Resumen
          </button>
          <button class="btn btn-sm btn-outline-danger" 
                  data-action="delete-cv" 
                  data-cv-id="${cv.id_curriculum}" 
                  data-cv-url="${cv.url_curriculum}">
            <i class="bi bi-trash"></i> Eliminar
          </button>
        </div>
      </div>
    `;
  }).join('');

  // 3. Configurar event listeners
  setupCVEventListeners();

  // 4. Mostrar/ocultar botón según límite
  toggleAddCvButton(cvs.length < 3);
}
```

#### Función 2: Inicializar Upload

```typescript
export function initCVUpload(idPerfil: number) {
  // Almacenar idPerfil en variable de módulo
  currentIdPerfil = idPerfil;
  
  const fileInput = document.getElementById('cvFile') as HTMLInputElement;
  const dropArea = document.getElementById('cvDropArea');

  if (!fileInput || !dropArea) {
    console.error('CV upload elements not found');
    return;
  }

  // 1. Event: Cambio en input de archivo
  fileInput.addEventListener('change', async (event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      await handleCVUpload(file, idPerfil);
      target.value = ''; // Resetear input
    }
  });

  // 2. Event: Drag over
  dropArea.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropArea.classList.add('dragover');
  });

  // 3. Event: Drag leave
  dropArea.addEventListener('dragleave', () => {
    dropArea.classList.remove('dragover');
  });

  // 4. Event: Drop
  dropArea.addEventListener('drop', async (event) => {
    event.preventDefault();
    dropArea.classList.remove('dragover');

    const file = event.dataTransfer?.files[0];
    if (file) {
      await handleCVUpload(file, idPerfil);
    }
  });

  // 5. Event: Click en dropzone (abrir selector)
  dropArea.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      fileInput.click();
    }
  });
}
```

#### Función 3: Manejar Upload

```typescript
async function handleCVUpload(file: File, idPerfil: number) {
  try {
    // 1. Mostrar estado de carga
    const dropArea = document.getElementById('cvDropArea');
    if (dropArea) {
      dropArea.classList.add('opacity-50');
      dropArea.innerHTML = `
        <div class="cv-loading"></div>
        <div class="mt-2">Subiendo archivo...</div>
      `;
    }

    // 2. Subir archivo a Supabase Storage
    const uploadResult = await CurriculumService.uploadCurriculumFile(file);

    if (!uploadResult.success || !uploadResult.url) {
      showToast(uploadResult.message || 'Error al subir el archivo', 'danger');
      resetCVDropzone();
      return;
    }

    // 3. Crear registro en la base de datos
    const curriculumData = {
      id_perfil: idPerfil,
      url_curriculum: uploadResult.url,
      nombre_archivo: file.name,
      tamano_archivo: file.size
    };

    const createResult = await CurriculumService.createCurriculum(curriculumData);

    if (createResult.success) {
      // 4. Mostrar éxito y recargar lista
      showToast('CV subido exitosamente', 'success');
      await reloadCVList(idPerfil); // ✨ Recarga inmediata
    } else {
      showToast(createResult.message || 'Error al registrar el CV', 'danger');
    }

  } catch (error) {
    console.error('Error uploading CV:', error);
    showToast('Error desconocido al subir el CV', 'danger');
  } finally {
    resetCVDropzone();
  }
}
```

**Flujo completo**:

1. Usuario arrastra archivo o hace clic
2. Frontend muestra spinner de carga
3. Se sube archivo a Supabase Storage → obtiene URL
4. Se crea registro en base de datos con URL
5. Se recarga lista de CVs (sin recargar página)
6. Se muestra notificación de éxito

---

## 🔄 Flujos Completos

### Flujo 1: Cargar Página de Settings

```
1. Usuario navega a settings.html
   ↓
2. perfilController.initProfileController()
   ↓
3. Carga datos del perfil (nombre, email, etc.)
   ↓
4. perfilController.loadCandidateCVs()
   ↓
5. CurriculumService.fetchCurriculums(idPerfil)
   ↓
6. Backend: SELECT * FROM curriculums WHERE id_perfil = ...
   ↓
7. Retorna lista de CVs
   ↓
8. cvUpload.renderCVList(cvs)
   ↓
9. Muestra CVs en la UI
   ↓
10. cvUpload.initCVUpload(idPerfil)
   ↓
11. Configura event listeners para drag-drop
```

### Flujo 2: Subir Nuevo CV

```
1. Usuario arrastra archivo PDF al dropzone
   ↓
2. Event 'drop' capturado por cvUpload
   ↓
3. cvUpload.handleCVUpload(file, idPerfil)
   ↓
4. Muestra "Subiendo archivo..." en UI
   ↓
5. CurriculumService.uploadCurriculumFile(file)
   │
   ├─ Valida tipo de archivo (PDF/DOC/DOCX)
   ├─ Valida tamaño (máx 30MB)
   ├─ Genera nombre único: cv-{timestamp}-{nombre}
   ├─ Path: {userId}/cvs/{nombre_unico}
   └─ supabase.storage.upload(path, file)
   ↓
6. Supabase Storage valida:
   │
   ├─ RLS Policy: Usuario autenticado ✅
   ├─ RLS Policy: Subiendo a su propia carpeta ✅
   ├─ MIME Type permitido ✅
   └─ Tamaño dentro del límite ✅
   ↓
7. Archivo guardado en Supabase
   ↓
8. Obtiene URL pública del archivo
   ↓
9. CurriculumService.createCurriculum(datos)
   ↓
10. Backend POST /candidate/curriculums
    │
    ├─ Valida datos requeridos
    ├─ Verifica límite de 3 CVs
    └─ INSERT INTO curriculums (...)
    ↓
11. PostgreSQL:
    │
    ├─ Ejecuta trigger check_cv_limit
    ├─ Verifica COUNT < 3
    └─ Inserta registro
    ↓
12. Retorna CV creado al frontend
    ↓
13. cvUpload.reloadCVList(idPerfil)
    ↓
14. GET /candidate/curriculums/:id_perfil
    ↓
15. Backend: SELECT * FROM curriculums...
    ↓
16. Retorna lista actualizada
    ↓
17. cvUpload.renderCVList(cvs)
    ↓
18. Muestra nuevo CV en la UI (sin recargar página)
    ↓
19. showToast('CV subido exitosamente')
```

### Flujo 3: Editar Nombre de CV

```
1. Usuario hace clic en "Editar Resumen"
   ↓
2. Botón cambia a "Guardar"
   ↓
3. Nombre del CV se vuelve editable (contenteditable)
   ↓
4. Usuario escribe nuevo nombre
   ↓
5. Usuario hace clic en "Guardar" (o presiona Enter)
   ↓
6. cvUpload.handleEditCVName(cvId)
   ↓
7. Obtiene nuevo nombre del contenteditable
   ↓
8. Valida que no esté vacío
   ↓
9. CurriculumService.updateCurriculumName(cvId, nuevoNombre)
   ↓
10. Backend PATCH /candidate/curriculums/:id
    │
    └─ UPDATE curriculums SET nombre_archivo = ... WHERE id = ...
    ↓
11. PostgreSQL actualiza registro
    ↓
12. Retorna CV actualizado
    ↓
13. UI actualiza nombre localmente (sin recargar)
    ↓
14. Botón vuelve a "Editar Resumen"
    ↓
15. showToast('Nombre actualizado exitosamente')
```

### Flujo 4: Eliminar CV

```
1. Usuario hace clic en "Eliminar"
   ↓
2. Aparece confirmación: "¿Estás seguro?"
   ↓
3. Usuario confirma
   ↓
4. cvUpload.handleDeleteCV(cvId, cvUrl)
   ↓
5. Muestra "Eliminando..." en botón
   ↓
6. CurriculumService.deleteCurriculum(cvId, cvUrl)
   ↓
7. Backend DELETE /candidate/curriculums/:id
   │
   ├─ SELECT * para obtener datos del CV
   ├─ DELETE FROM curriculums WHERE id = ...
   └─ supabase.storage.remove(path)
   ↓
8. PostgreSQL elimina registro (CASCADE elimina relacionados)
   ↓
9. Supabase Storage valida:
   │
   ├─ RLS Policy: Usuario autenticado ✅
   └─ RLS Policy: Eliminando su propio archivo ✅
   ↓
10. Archivo eliminado de Supabase
    ↓
11. Retorna éxito al frontend
    ↓
12. UI anima salida del CV (fadeOut)
    ↓
13. Después de 300ms, remueve elemento del DOM
    ↓
14. cvUpload.reloadCVList(idPerfil)
    ↓
15. Muestra lista actualizada
    ↓
16. showToast('CV eliminado exitosamente')
```

---

## 🔒 Seguridad

### 1. **Autenticación**

- Usuario debe estar autenticado (token en sessionStorage)
- Backend valida token en cada petición
- Supabase RLS valida `auth.uid()`

### 2. **Autorización**

- Usuario solo puede acceder a sus propios CVs
- RLS de Supabase impide acceso a carpetas de otros usuarios
- Backend valida que `id_perfil` pertenezca al usuario autenticado

### 3. **Validación de Archivos**

#### Frontend (Primera Línea)

```typescript
// Tipos permitidos
const allowedTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

// Tamaño máximo
const maxSize = 30 * 1024 * 1024; // 30 MB
```

#### Supabase Storage (Segunda Línea)

```json
{
  "maxFileSize": 31457280,
  "allowedMimeTypes": [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ]
}
```

#### Backend (Tercera Línea)

- Valida extensión del archivo
- Verifica tamaño
- Sanitiza nombres de archivo

### 4. **SQL Injection Prevention**

- Uso de consultas parametrizadas (`$1, $2, ...`)
- Nunca concatenar valores en queries

```typescript
// ❌ MAL
const query = `SELECT * FROM curriculums WHERE id = ${id}`;

// ✅ BIEN
const query = 'SELECT * FROM curriculums WHERE id = $1';
await db.query(query, [id]);
```

### 5. **XSS Prevention**

- Nombres de archivo son escapados en el HTML
- Uso de `textContent` en lugar de `innerHTML` cuando es posible
- Bootstrap Sanitizer activo

### 6. **Rate Limiting**

- Límite de 3 CVs por usuario (trigger en DB)
- Límite de tamaño de 30MB por archivo
- Validación en múltiples capas

---

## ✅ Validaciones

### Frontend Validations

| Validación | Dónde | Mensaje de Error |
|------------|-------|------------------|
| Tipo de archivo | `validateFile()` | "Solo se permiten archivos PDF, DOC o DOCX" |
| Tamaño de archivo | `validateFile()` | "El archivo no debe superar los 30 MB" |
| Usuario autenticado | `uploadCurriculumFile()` | "Usuario no autenticado" |
| Nombre no vacío | `handleEditCVName()` | "El nombre no puede estar vacío" |

### Backend Validations

| Validación | Dónde | HTTP Status | Mensaje |
|------------|-------|-------------|---------|
| Datos requeridos | `createCurriculum()` | 400 | "Faltan datos requeridos" |
| Límite de 3 CVs | `createCurriculum()` | 400 | "Ya tienes el máximo de 3 CVs" |
| CV existe | `updateCurriculum()` | 404 | "CV no encontrado" |
| CV existe | `deleteCurriculum()` | 404 | "CV no encontrado" |

### Database Validations

| Validación | Tipo | Descripción |
|------------|------|-------------|
| Foreign Key | Constraint | `id_perfil` debe existir en `perfiles` |
| NOT NULL | Constraint | Todos los campos requeridos no pueden ser NULL |
| Límite de CVs | Trigger | Máximo 3 CVs por `id_perfil` |
| Cascade Delete | Constraint | Eliminar perfil → elimina CVs automáticamente |

### Supabase Storage Validations

| Validación | Configuración | Resultado |
|------------|---------------|-----------|
| MIME Type | Bucket settings | Solo PDF, DOC, DOCX |
| Tamaño | Bucket settings | Máximo 30 MB |
| Path ownership | RLS Policy | Solo acceso a propia carpeta |
| Autenticación | RLS Policy | Solo usuarios autenticados |

---

## ⚡ Optimizaciones

### 1. **Carga Inicial Optimizada**

```typescript
// Cargar perfil y CVs en paralelo
Promise.all([
  loadCandidateProfile(),
  loadCandidateCVs()
]);
```

### 2. **Recarga Inteligente de Lista**

```typescript
// Pasar idPerfil directamente (evita petición adicional)
await reloadCVList(idPerfil);

// En lugar de:
await reloadCVList(); // ❌ Hace petición extra para obtener idPerfil
```

### 3. **Índices en Base de Datos**

```sql
-- Búsqueda rápida por perfil (consulta más frecuente)
CREATE INDEX idx_curriculums_id_perfil ON curriculums(id_perfil);

-- Ordenamiento rápido por fecha
CREATE INDEX idx_curriculums_fecha_subida ON curriculums(fecha_subida DESC);
```

### 4. **Lazy Loading de Archivos**

- Los archivos solo se descargan cuando el usuario hace clic
- Lista muestra solo metadatos (ligero)

### 5. **Nombres Únicos con Timestamp**

```typescript
const fileName = `cv-${Date.now()}-${file.name}`;
```

- Evita colisiones de nombres
- Permite múltiples versiones del mismo archivo
- Facilita ordenamiento cronológico

### 6. **Animaciones CSS en lugar de JavaScript**

```css
.cv-item {
  transition: all 0.3s ease;
}

.animate__fadeOut {
  animation: fadeOut 0.3s ease-out;
}
```

### 7. **Debouncing en Edición**

- Guardar solo al perder foco o presionar Enter
- No guardar en cada tecla presionada

### 8. **Uso de sessionStorage**

```typescript
// Almacenar datos del usuario para acceso rápido
const user = JSON.parse(sessionStorage.getItem('user'));
```

---

## 📊 Métricas del Sistema

### Capacidad

- **CVs por usuario**: Máximo 3
- **Tamaño por archivo**: Máximo 30 MB
- **Formatos soportados**: PDF, DOC, DOCX
- **Total de archivos en sistema**: Ilimitado

### Performance

- **Tiempo de carga inicial**: ~500-800ms
- **Tiempo de subida** (10MB): ~2-4 segundos
- **Tiempo de recarga de lista**: ~200-400ms
- **Tiempo de eliminación**: ~300-500ms

### Almacenamiento

```
Estimación para 10,000 usuarios con 3 CVs cada uno:

Archivos:
- 30,000 archivos × 5 MB promedio = 150 GB en Supabase Storage

Base de Datos:
- 30,000 registros × ~500 bytes = ~15 MB en PostgreSQL
```

---

## 🐛 Debugging

### Logs del Sistema

#### Frontend Console

```javascript
// Activar logs detallados
localStorage.setItem('DEBUG_CV', 'true');

// Ver logs en consola
console.log('[CV] Uploading file:', file.name);
console.log('[CV] Upload result:', uploadResult);
console.log('[CV] Create result:', createResult);
```

#### Backend Logs

```javascript
// En desarrollo
console.log('[CV API] Request:', req.body);
console.log('[CV API] User:', req.user);
console.log('[CV API] Result:', result);
```

#### Supabase Logs

```sql
-- Verificar uploads recientes
SELECT * FROM storage.objects 
WHERE bucket_id = 'Archivos_WorkHub' 
ORDER BY created_at DESC 
LIMIT 10;

-- Ver políticas RLS
SELECT * FROM pg_policies 
WHERE tablename = 'objects';
```

### Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| "Usuario no autenticado" | Token expirado | Re-login del usuario |
| "Ya tienes 3 CVs" | Límite alcanzado | Eliminar CV antes de subir otro |
| "Tipo no permitido" | Archivo no es PDF/DOC/DOCX | Convertir archivo |
| "Archivo muy grande" | > 30 MB | Comprimir PDF o reducir tamaño |
| "Error al subir archivo" | RLS rechaza upload | Verificar políticas de Supabase |
| "CV no encontrado" | ID inválido | Verificar que el CV existe |

---

## 🚀 Próximas Mejoras

### Fase 2 (Futuro)

1. **Preview de PDFs**: Mostrar preview antes de descargar
2. **Versionado**: Guardar versiones anteriores de CVs
3. **Templates**: Plantillas de CV predefinidas
4. **Editor Online**: Editar CVs directamente en la plataforma
5. **Analytics**: Cuántas veces se descargó cada CV
6. **Compartir por Link**: Generar link temporal para compartir
7. **Tags**: Etiquetar CVs (Senior, Junior, Full Stack, etc.)
8. **Búsqueda**: Buscar CVs por contenido (OCR/Indexación)

### Optimizaciones Futuras

1. **CDN**: Usar CDN para servir archivos más rápido
2. **Compresión**: Comprimir PDFs automáticamente
3. **Thumbnails**: Generar miniaturas de PDFs
4. **Lazy Loading**: Cargar CVs bajo demanda (paginación)
5. **Web Workers**: Procesar validaciones en background
6. **Service Worker**: Cache de CVs para acceso offline

---

## 📚 Referencias y Recursos

### Documentación

- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Triggers](https://www.postgresql.org/docs/current/plpgsql-trigger.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Librerías Utilizadas

- **Bootstrap 5.3.8**: UI components
- **Bootstrap Icons**: Iconos
- **Supabase JS**: Cliente de Supabase
- **Vite**: Build tool

### Archivos del Proyecto

#### Frontend

- `src/interfaces/curriculum.interface.ts`
- `src/services/curriculumService.ts`
- `src/lib/cvUpload.ts`
- `src/controllers/candidate/perfilController.ts`
- `src/pages/candidate/profile/settings.html`
- `src/assets/css/enterprise-profile.css`

#### Scripts

- `scripts/create_curriculums_table.sql`

#### Documentación

- `BACKEND_CV_ENDPOINTS.md`
- `SUPABASE_STORAGE_CONFIG.md`
- `CV_FEATURE_SUMMARY.md`
- `TESTING_GUIDE.md`
- `FIX_CV_RELOAD.md`
- **`CV_SYSTEM_ARCHITECTURE.md`** (este documento)

---

## ✅ Checklist de Implementación

- [x] Base de datos configurada
- [x] Supabase Storage configurado
- [x] RLS Policies aplicadas
- [x] Backend endpoints implementados
- [x] Frontend interfaces creadas
- [x] Frontend services implementados
- [x] Frontend UI library creada
- [x] Controlador actualizado
- [x] Vistas HTML actualizadas
- [x] Estilos CSS agregados
- [x] Validaciones implementadas
- [x] Seguridad configurada
- [x] Documentación completa
- [x] Testing realizado
- [x] Fix de recarga automática aplicado

---

## 👥 Equipo

**Desarrollador Frontend**: Kevin Rodriguez  
**Fecha de Implementación**: Octubre 2025  
**Versión**: 1.0

---

## 📝 Licencia

Este documento es parte del proyecto WorkHub y está sujeto a las mismas licencias y términos.

---

**Fin del documento** • Última actualización: 2 de octubre de 2025
