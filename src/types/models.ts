export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  birth_date: string;
  age: number;
  phone?: string;
  gender: "Masculino" | "Femenino";
  allergies?: string;
  active: boolean;
  created_at: string;
  total_consultations?: number;
  last_consultation_date?: string;
  // Campos adicionales opcionales
  email?: string;
  address?: string;
  blood_type?: string;
  chronic_conditions?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  updated_at?: string;
  // Nuevos campos del backend
  personal_background?: string;
  obstetric_gynecological_background?: string;
  religion?: string;
  occupation?: string;
  native_of?: string;
}

export interface VitalSigns {
  id: string;
  consultation_id: string;
  weight?: number;
  height?: number;
  temperature?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  heart_rate?: number;
  respiratory_rate?: number;
  oxygen_saturation?: number;
  blood_glucose?: number;
  notes?: string;
  measured_at: string;
}

export interface PreConsultation {
  id: string;
  patient_id: string;
  temperature?: number;
  heart_rate?: number;
  respiratory_rate?: number;
  systolic_pressure?: number;
  diastolic_pressure?: number;
  oxygen_saturation?: number;
  blood_glucose?: number;
  weight?: number;
  height?: number;
  current_medications?: string;
  created_at: string;
  updated_at?: string;
}

export interface Consultation {
  id: string;
  patient_id?: string;
  doctor_id: string;
  assistant_id?: string;
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  symptoms: string[];
  diagnoses: string[];
  prescribed_medications: string[];
  recommendations?: string;
  pocus_notes?: string;
  diagnosis?: string;
  treatment?: string;
  prescription?: string;
  notes?: string;
  follow_up_date?: string;
  price: number;
  consultation_date: string;
  status?: "pending" | "in_progress" | "completed" | "cancelled";
  created_at: string;
  updated_at?: string;
  patient?: {
    id: string;
    first_name: string;
    last_name: string;
    IMC?: string;
    age: number;
    gender?: string;
    phone?: string;
    allergies?: string;
  };
  doctor?: {
    id: string;
    name: string;
    role: string;
  };
  recorded_by?: {
    id: string;
    name: string;
    role: string;
  };
  vital_signs?: {
    temperature?: number;
    heart_rate?: number;
    respiratory_rate?: number;
    systolic_pressure?: number;
    diastolic_pressure?: number;
    oxygen_saturation?: number;
    blood_glucose?: number;
    weight?: number;
    height?: number;
    imc?: number;
    recorded_at?: string;
  };
  pre_consultation_id?: string;
}

// Modelo simplificado para GET /waiting-room (sala de espera)
export interface WaitingRoomEntry {
  id: string;
  status: string;
  arrival_time: string;
  priority: string;
  patient: {
    id: string;
    full_name: string;
    age: number;
    gender: string;
  };
  doctor: {
    id: string;
    full_name: string;
  };
  pre_consultation_id: string;
}

// Modelo completo para GET /waiting-room/active (consulta activa)
export interface ActiveConsultationEntry {
  id: string;
  patient_id: string;
  pre_consultation_id: string;
  doctor_id: string;
  status: string;
  arrival_time: string;
  priority: string;
  patient: {
    id: string;
    first_name: string;
    last_name: string;
    full_name: string;
    birth_date: string;
    age: number;
    gender: string;
    phone?: string;
    email?: string;
    address?: string;
    allergies?: string;
    blood_type?: string;
    occupation?: string;
    curp?: string;
    personal_background?: string;
    obstetric_gynecological_background?: string;
    religion?: string;
    native_of?: string;
    created_at: string;
  };
  pre_consultation?: {
    id: string;
    temperature?: number;
    heart_rate?: number;
    respiratory_rate?: number;
    systolic_pressure?: number;
    diastolic_pressure?: number;
    oxygen_saturation?: number;
    blood_glucose?: number;
    weight?: number;
    height?: number;
    imc?: number;
    blood_pressure_category?: string;
    current_medications?: string;
    pocus_notes?: string;
    notes?: string;
    recorded_at: string;
    recorded_by: {
      id: string;
      name: string;
      role?: string;
    };
  };
  added_by?: {
    id: string;
    name: string;
    role?: string;
  };
  doctor?: {
    id: string;
    name: string;
    role?: string;
  };
}

export interface Attachment {
  id: string;
  consultation_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  uploaded_by: string;
  created_at: string;
}
