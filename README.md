# 🏥 Medical Clinic Management System - Frontend

Sistema de gestión de consultorios médicos construido con **Astro + React + TypeScript + Tailwind CSS**.

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+
- npm o pnpm
- Backend API corriendo en `http://localhost:8080`

### Ejecutar en Desarrollo

```bash
npm run dev
```

Abre [http://localhost:4321](http://localhost:4321) en tu navegador.

### Build para Producción

```bash
npm run build
npm run preview
```

---

## 📁 Estructura del Proyecto

```
frontend_cmv/
├── public/               # Assets estáticos
├── src/
│   ├── components/
│   │   ├── ui/          # Componentes base (Button, Input, Card, etc.)
│   │   ├── layouts/     # Layouts de Astro
│   │   └── features/    # Componentes por módulo
│   │       ├── auth/          # Login, 2FA, RouteGuard
│   │       ├── dashboard/     # Stats, QuickActions
│   │       ├── navigation/    # Sidebar
│   │       ├── patients/      # PatientList, PatientForm, PatientDetail
│   │       ├── consultations/ # ConsultationList, ConsultationForm, ConsultationDetail
│   │       ├── waiting-room/  # WaitingRoomBoard
│   │       ├── analytics/     # Gráficas y reportes
│   │       └── profile/       # ProfileForm
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilidades y configuración
│   │   ├── api.ts       # Cliente Axios
│   │   ├── auth.ts      # Helpers de autenticación
│   │   └── queryClient.ts
│   ├── stores/          # Zustand stores
│   │   ├── authStore.ts
│   │   └── uiStore.ts
│   ├── types/           # TypeScript types
│   ├── pages/           # Rutas de Astro
│   │   ├── index.astro  # Redirect a login
│   │   ├── login.astro
│   │   └── dashboard/
│   ├── styles/
│   │   └── global.css   # Tailwind + custom styles
│   └── middleware.ts    # Protección de rutas
├── .env                 # Variables de entorno
├── todo.md             # Lista de tareas del proyecto
└── README.md           # Este archivo
```

---

## 🎯 Funcionalidades Implementadas

### ✅ FASE 1: Setup Básico (Completada)
- [x] Configuración de Astro + React + TypeScript
- [x] Tailwind CSS con paleta Shakespeare personalizada
- [x] Path aliases configurados
- [x] 7 Componentes UI base
- [x] API client con interceptors
- [x] Stores de Zustand (auth, ui)
- [x] Sistema de tipos TypeScript completo

### ✅ FASE 2: Autenticación (Completada)
- [x] Login con validación (React Hook Form + Zod)
- [x] Soporte para 2FA con QR code
- [x] Sistema de códigos de respaldo
- [x] Layouts (Base, Auth, Dashboard)
- [x] Sidebar con navegación por rol
- [x] Protección del lado del cliente (RouteGuard)

### ✅ FASE 3: Dashboard Core (Completada)
- [x] Middleware de protección de rutas
- [x] Dashboard con estadísticas en tiempo real
- [x] Componente de acciones rápidas
- [x] KPIs integrados con backend
- [x] Loading states y error handling

### ✅ FASE 4: Módulo de Pacientes (Completada)
- [x] CRUD completo de pacientes
- [x] Búsqueda y filtrado
- [x] Formulario con validación completa
- [x] Vista detallada con historial
- [x] Información médica (alergias, condiciones crónicas, tipo de sangre)
- [x] Contacto de emergencia

### ✅ FASE 5: Módulo de Consultas (Completada)
- [x] CRUD completo de consultas
- [x] Gestión de signos vitales
- [x] Subida de archivos adjuntos
- [x] Estados de consulta (pending, in_progress, completed)
- [x] Completar consulta (diagnóstico, tratamiento, costo)
- [x] Sala de espera con prioridades
- [x] Llamado de pacientes
- [x] Auto-refresh cada 30 segundos

### ✅ FASE 6: Analytics (Solo Doctor) (Completada)
- [x] Dashboard con filtros por fecha
- [x] Gráfica de ingresos por día (Chart.js)
- [x] Top 10 síntomas más frecuentes
- [x] Demografía de pacientes (edad, género)
- [x] Restricción de acceso por rol

### ✅ FASE 7: Extras (Completada)
- [x] Página de perfil de usuario
- [x] Cambio de contraseña
- [x] PWA configurado (manifest + service worker)
- [x] Soporte offline básico

---

## 🔐 Autenticación

### Login
- Usuario: `doctor1` o `assistant1` (según tu backend)
- Contraseña: La configurada en tu backend
- Si 2FA está habilitado, se solicitará el código de 6 dígitos

### Roles y Permisos

**Doctor:**
- Acceso completo al sistema
- Analytics y métricas
- Gestión de usuarios
- Todas las funciones de asistente

**Asistente:**
- Gestión de pacientes
- Gestión de consultas
- Sala de espera
- Sin acceso a analytics ni usuarios

---

## 🛠️ Stack Tecnológico

### Core
- **Astro 5.14.4** - Framework principal (SSR/SSG)
- **React 19.2.0** - Islands para interactividad
- **TypeScript** - Type safety

### Estado y Data
- **Zustand** - Estado global (1kb)
- **TanStack Query (React Query)** - Cache y fetching
- **Axios** - HTTP client

### UI/UX
- **Tailwind CSS 4** - Estilos utility-first
- **Sonner** - Toast notifications
- **React Hook Form + Zod** - Validación de formularios
- **React ChartJS 2** - Gráficas (para analytics)
- **QRCode.react** - Códigos QR (2FA)

### Utilidades
- **date-fns** - Manejo de fechas
- **clsx** - Clases condicionales

---

## 📝 Mejoras Futuras (Opcionales)

Ver [todo.md](./todo.md) para información detallada.

### Módulos Adicionales Sugeridos:
- **Gestión de Usuarios** (solo doctor): CRUD de usuarios del sistema
- **Recetas PDF**: Generación automática de recetas médicas
- **Notificaciones**: Sistema de notificaciones push
- **Agenda**: Calendario de citas programadas
- **Reportes**: Reportes médicos en PDF
- **Multi-idioma**: Soporte para inglés/español

---

## 🧞 Commands

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |

---

## 📚 Documentación Adicional

- **Astro:** https://docs.astro.build
- **React:** https://react.dev
- **Tailwind CSS:** https://tailwindcss.com
- **TanStack Query:** https://tanstack.com/query
- **Zustand:** https://zustand-demo.pmnd.rs

---

**✅ Proyecto Completado: 27/27 tareas (100%)** | **Desarrollado con ❤️ usando Astro + React**

---

## 🚀 Cómo Empezar

1. **Clonar el repositorio**
2. **Instalar dependencias**: `npm install`
3. **Configurar .env**: Verificar que PUBLIC_API_URL apunte a tu backend
4. **Iniciar backend**: Asegurar que el backend esté corriendo en http://localhost:8080
5. **Generar iconos PWA** (opcional): Ver `public/ICONS_README.md`
6. **Iniciar dev server**: `npm run dev`
7. **Abrir navegador**: http://localhost:4321
