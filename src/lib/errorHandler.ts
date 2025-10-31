import { toast } from "sonner";
import type { ApiError, ApiErrorResponse, ErrorCode, ErrorMessage } from "@/types/errors";
import { AxiosError } from "axios";

/**
 * Parse API error response into structured format
 */
export function parseApiError(error: unknown): ApiError {
  // Handle Axios errors
  if (error instanceof AxiosError) {
    const response = error.response?.data as ApiErrorResponse | undefined;
    const statusCode = error.response?.status;

    const apiError: ApiError = {
      name: 'ApiError',
      message: response?.message || response?.error?.message || error.message || 'Error desconocido',
      code: response?.error?.code || getErrorCodeFromStatus(statusCode),
      statusCode,
      details: response?.error?.details || formatValidationErrors(response?.errors),
      originalError: error,
    };

    return apiError;
  }

  if (error instanceof Error) {
    return {
      name: 'Error',
      message: error.message,
      code: 'UNKNOWN',
      originalError: error,
    };
  }

  return {
    name: 'UnknownError',
    message: 'Ha ocurrido un error inesperado',
    code: 'UNKNOWN',
    originalError: error,
  };
}


function formatValidationErrors(errors?: Record<string, string | string[]>): Record<string, string[]> | undefined {
  if (!errors) return undefined;

  const formatted: Record<string, string[]> = {};

  for (const [field, messages] of Object.entries(errors)) {
    formatted[field] = Array.isArray(messages) ? messages : [messages];
  }

  return formatted;
}

function getErrorCodeFromStatus(status?: number): ErrorCode {
  if (!status) return 'UNKNOWN' as ErrorCode;

  switch (status) {
    case 401:
      return 'UNAUTHORIZED' as ErrorCode;
    case 403:
      return 'FORBIDDEN' as ErrorCode;
    case 404:
      return 'NOT_FOUND' as ErrorCode;
    case 422:
      return 'VALIDATION_ERROR' as ErrorCode;
    case 500:
      return 'INTERNAL_ERROR' as ErrorCode;
    case 503:
      return 'SERVICE_UNAVAILABLE' as ErrorCode;
    default:
      return 'UNKNOWN' as ErrorCode;
  }
}

export function getErrorMessage(error: ApiError): ErrorMessage {
  const code = error.code as ErrorCode;

  const messages: Record<ErrorCode, ErrorMessage> = {
    UNAUTHORIZED: {
      title: 'Sesión expirada',
      description: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
      action: 'Ir a login',
    },
    FORBIDDEN: {
      title: 'Acceso denegado',
      description: 'No tienes permisos para realizar esta acción.',
    },
    TOKEN_EXPIRED: {
      title: 'Token expirado',
      description: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
      action: 'Ir a login',
    },
    INVALID_CREDENTIALS: {
      title: 'Credenciales inválidas',
      description: 'El usuario o contraseña son incorrectos.',
    },
    VALIDATION_ERROR: {
      title: 'Error de validación',
      description: error.message || 'Los datos ingresados no son válidos.',
    },
    INVALID_INPUT: {
      title: 'Datos inválidos',
      description: error.message || 'Por favor, verifica los datos ingresados.',
    },
    NOT_FOUND: {
      title: 'Recurso no encontrado',
      description: error.message || 'El recurso solicitado no existe.',
    },
    ALREADY_EXISTS: {
      title: 'Recurso existente',
      description: error.message || 'El recurso ya existe en el sistema.',
    },
    INTERNAL_ERROR: {
      title: 'Error del servidor',
      description: 'Ha ocurrido un error en el servidor. Intenta nuevamente.',
    },
    SERVICE_UNAVAILABLE: {
      title: 'Servicio no disponible',
      description: 'El servicio no está disponible en este momento.',
    },
    NETWORK_ERROR: {
      title: 'Error de conexión',
      description: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
    },
    TIMEOUT: {
      title: 'Tiempo de espera agotado',
      description: 'La petición tardó demasiado tiempo. Intenta nuevamente.',
    },
    UNKNOWN: {
      title: 'Error inesperado',
      description: error.message || 'Ha ocurrido un error inesperado.',
    },
  };

  return messages[code] || messages.UNKNOWN;
}


export function formatValidationErrorMessage(details?: Record<string, string[]>): string {
  if (!details) return '';

  const messages = Object.entries(details)
    .map(([field, errors]) => {
      const fieldName = getFieldDisplayName(field);
      return `${fieldName}: ${errors.join(', ')}`;
    })
    .join('\n');

  return messages;
}

function getFieldDisplayName(field: string): string {
  const fieldNames: Record<string, string> = {
    full_name: 'Nombre completo',
    age: 'Edad',
    gender: 'Género',
    phone: 'Teléfono',
    email: 'Correo electrónico',
    address: 'Dirección',
    allergies: 'Alergias',

    temperature: 'Temperatura',
    heart_rate: 'Frecuencia cardíaca',
    respiratory_rate: 'Frecuencia respiratoria',
    systolic_pressure: 'Presión sistólica',
    diastolic_pressure: 'Presión diastólica',
    oxygen_saturation: 'Saturación de oxígeno',
    blood_glucose: 'Glucosa en sangre',
    weight: 'Peso',
    height: 'Altura',

    symptoms: 'Síntomas',
    diagnoses: 'Diagnósticos',
    medications: 'Medicamentos',
    price: 'Precio',

    username: 'Usuario',
    password: 'Contraseña',
    role: 'Rol',
  };

  return fieldNames[field] || field;
}


export function handleError(error: unknown, customMessage?: string): ApiError {
  const apiError = parseApiError(error);
  const errorMessage = getErrorMessage(apiError);

  if (apiError.details) {
    const validationMessage = formatValidationErrorMessage(apiError.details);
    if (validationMessage) {
      toast.error(validationMessage);
      return apiError;
    }
  }

  const message = customMessage || errorMessage.description;
  toast.error(message);

  return apiError;
}


export function handleErrorSilent(error: unknown): ApiError {
  return parseApiError(error);
}

export function logError(error: ApiError, context?: string): void {
  if (import.meta.env.DEV) {
    console.group(`🔴 Error${context ? ` in ${context}` : ''}`);
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    console.error('Status:', error.statusCode);
    if (error.details) {
      console.error('Details:', error.details);
    }
    if (error.originalError) {
      console.error('Original:', error.originalError);
    }
    console.groupEnd();
  }
}