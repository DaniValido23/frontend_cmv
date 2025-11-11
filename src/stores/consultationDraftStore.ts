/**
 * Store para manejar borradores de consultas en localStorage
 * Permite guardar el estado del formulario de consulta para cada paciente
 * y recuperarlo al cambiar entre consultas
 */

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface VitalSigns {
  temperature?: number | null;
  heartRate?: number | null;
  respiratoryRate?: number | null;
  systolicPressure?: number | null;
  diastolicPressure?: number | null;
  oxygenSaturation?: number | null;
  bloodGlucose?: number | null;
  weight?: number | null;
  height?: number | null;
  currentMedications?: string;
}

export interface AppointmentData {
  createAppointment: boolean;
  date: string;
  title: string;
  notes: string;
}

export interface ConsultationDraft {
  symptoms: string[];
  diagnoses: string[];
  medications: Medication[];
  recommendations: string;
  pocusNotes: string;
  price: string;
  attachedFileNames: string[]; // Solo guardamos nombres, no los archivos
  appointment: AppointmentData;
  editableVitals: VitalSigns;
  lastSaved: string; // ISO timestamp
}

const STORAGE_PREFIX = 'consultation_draft_';
const EXPIRATION_HOURS = 24; // Los borradores expiran después de 24 horas

/**
 * Guarda un borrador de consulta en localStorage
 */
export const saveDraft = (waitingRoomId: string, draft: Partial<ConsultationDraft>): void => {
  try {
    const draftData: ConsultationDraft = {
      symptoms: draft.symptoms || [],
      diagnoses: draft.diagnoses || [],
      medications: draft.medications || [],
      recommendations: draft.recommendations || '',
      pocusNotes: draft.pocusNotes || '',
      price: draft.price || '',
      attachedFileNames: draft.attachedFileNames || [],
      appointment: draft.appointment || {
        createAppointment: false,
        date: '',
        title: '',
        notes: '',
      },
      editableVitals: draft.editableVitals || {},
      lastSaved: new Date().toISOString(),
    };

    localStorage.setItem(
      `${STORAGE_PREFIX}${waitingRoomId}`,
      JSON.stringify(draftData)
    );
  } catch (error) {
    console.error('Error saving consultation draft:', error);
  }
};

/**
 * Obtiene un borrador de consulta desde localStorage
 * Retorna null si no existe o si expiró
 */
export const getDraft = (waitingRoomId: string): ConsultationDraft | null => {
  try {
    const stored = localStorage.getItem(`${STORAGE_PREFIX}${waitingRoomId}`);

    if (!stored) {
      return null;
    }

    const draft: ConsultationDraft = JSON.parse(stored);

    // Verificar expiración
    const lastSaved = new Date(draft.lastSaved);
    const now = new Date();
    const hoursDiff = (now.getTime() - lastSaved.getTime()) / (1000 * 60 * 60);

    if (hoursDiff > EXPIRATION_HOURS) {
      // Borrador expirado, eliminarlo
      deleteDraft(waitingRoomId);
      return null;
    }

    return draft;
  } catch (error) {
    console.error('Error loading consultation draft:', error);
    return null;
  }
};

/**
 * Elimina un borrador de consulta específico
 */
export const deleteDraft = (waitingRoomId: string): void => {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${waitingRoomId}`);
  } catch (error) {
    console.error('Error deleting consultation draft:', error);
  }
};

/**
 * Elimina todos los borradores de consultas
 */
export const clearAllDrafts = (): void => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error clearing all consultation drafts:', error);
  }
};

/**
 * Verifica si existe un borrador para una consulta específica
 */
export const hasDraft = (waitingRoomId: string): boolean => {
  return getDraft(waitingRoomId) !== null;
};

/**
 * Limpia borradores expirados (útil para ejecutar al inicio de la aplicación)
 */
export const cleanExpiredDrafts = (): void => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(STORAGE_PREFIX)) {
        const waitingRoomId = key.replace(STORAGE_PREFIX, '');
        const draft = getDraft(waitingRoomId);
        // getDraft ya elimina los expirados, solo lo llamamos
        if (!draft) {
          // Ya fue eliminado por getDraft
        }
      }
    });
  } catch (error) {
    console.error('Error cleaning expired drafts:', error);
  }
};

/**
 * Obtiene la lista de todos los IDs de waiting room que tienen borradores
 */
export const getAllDraftIds = (): string[] => {
  try {
    const keys = Object.keys(localStorage);
    return keys
      .filter((key) => key.startsWith(STORAGE_PREFIX))
      .map((key) => key.replace(STORAGE_PREFIX, ''))
      .filter((id) => hasDraft(id)); // Filtrar solo los no expirados
  } catch (error) {
    console.error('Error getting all draft IDs:', error);
    return [];
  }
};
