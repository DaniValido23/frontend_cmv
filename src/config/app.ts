/**
 * Configuración centralizada de la aplicación
 */

export const APP_CONFIG = {
  // Información de la aplicación
  name: "Centro Medico Del Valle",
  description: "Sistema de gestión de consultas médicas para doctores y asistentes",
  version: "1.0.0",

  // Tema
  theme: {
    defaultTheme: "light" as const,
    colorModes: ["light", "dark"] as const,
    themeColorLight: "#ffffff",
    themeColorDark: "#18181b",
  },

  // Paginación
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 20, 50, 100],
  },

  // Formatos
  formats: {
    dateDisplay: "es-MX",
    dateInput: "YYYY-MM-DD",
    dateAPI: "DD-MM-YYYY",
    currency: "MXN",
    currencySymbol: "$",
  },

  // Tiempos (en milisegundos)
  timeouts: {
    apiRequest: 30000, // 30 segundos
    toastDuration: 3000, // 3 segundos
    debounceSearch: 300, // 300ms
  },

  // Query Client
  queryClient: {
    staleTime: 1000 * 60 * 5, // 5 minutos
    cacheTime: 1000 * 60 * 10, // 10 minutos
    refetchOnWindowFocus: false,
    retry: 1,
  },

  // Rutas
  routes: {
    home: "/",
    login: "/login",
    dashboard: "/dashboard",
    waitingRoom: "/waiting-room",
    preConsultation: "/pre-consultation",
    consultation: "/consultation",
    patients: "/patients",
    users: "/users",
  },

  // Roles
  roles: {
    doctor: "doctor",
    assistant: "assistant",
  },

  // Validaciones
  validation: {
    phoneLength: 10,
    minPasswordLength: 6,
    minUsernameLength: 3,
    maxAllergiesLength: 1000,
    maxNotesLength: 5000,
    twoFactorCodeLength: 6,
  },

  // PWA
  pwa: {
    enabled: true,
    name: "Centro Medico Del Valle",
    shortName: "CMV",
  },
} as const;

export type AppConfig = typeof APP_CONFIG;
