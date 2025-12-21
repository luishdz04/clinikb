export interface Service {
  id: string;
  key: string;
  title: string;
  category: 'Psicológica' | 'Médica';
  duration_minutes: number;
  description: string | null;
  active: boolean;
  available_modalities?: string[];
  created_at: string;
  updated_at: string;
}

export interface DoctorService {
  id: string;
  doctor_id: string;
  service_id: string;
  active: boolean;
  created_at: string;
  service?: Service; // Join
}

export interface AvailabilitySlot {
  id: string;
  doctor_id: string;
  service_id: string;
  slot_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM:SS
  end_time: string; // HH:MM:SS
  is_available: boolean;
  max_appointments: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  service?: Service; // Join
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  service_id: string;
  slot_id: string | null;
  appointment_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM:SS
  end_time: string; // HH:MM:SS
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed' | 'no_show';
  patient_notes: string | null;
  doctor_notes: string | null;
  meeting_link: string | null;
  modality?: 'online' | 'presencial';
  rejection_reason: string | null;
  cancellation_reason: string | null;
  cancelled_by: string | null;
  confirmed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  // Joins
  patient?: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
  };
  service?: Service;
}

// Attachment for medical records
export interface MedicalRecordAttachment {
  type: 'lab_result' | 'prescription' | 'imaging' | 'document' | 'other';
  url: string;
  name: string;
  uploaded_at: string;
}

// Medical Record interface
export interface MedicalRecord {
  id: string;
  patient_id: string;
  appointment_id: string | null;
  doctor_id: string;
  
  // Visit information
  visit_date: string; // YYYY-MM-DD
  chief_complaint: string | null;
  
  // Vital signs (medical)
  blood_pressure: string | null;
  heart_rate: number | null;
  temperature: number | null;
  weight: number | null;
  height: number | null;
  bmi: number | null;
  
  // Clinical history
  current_illness: string | null;
  medical_history: string | null;
  family_history: string | null;
  allergies: string | null;
  current_medications: string | null;
  
  // Psychological assessment
  mental_status: string | null;
  mood: string | null;
  affect: string | null;
  thought_process: string | null;
  thought_content: string | null;
  perception: string | null;
  cognition: string | null;
  insight: string | null;
  judgment: string | null;
  risk_assessment: string | null;
  
  // Physical examination
  physical_examination: string | null;
  
  // Diagnosis and treatment
  diagnosis: string;
  differential_diagnosis: string | null;
  treatment_plan: string | null;
  prescriptions: string | null;
  recommendations: string | null;
  
  // Follow-up
  next_visit_date: string | null; // YYYY-MM-DD
  follow_up_notes: string | null;
  
  // Attachments
  attachments: MedicalRecordAttachment[];
  
  created_at: string;
  updated_at: string;
  
  // Joins
  patient?: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    date_of_birth: string;
    attention_type: 'Psicológica' | 'Médica';
  };
  doctor?: {
    id: string;
    full_name: string;
    specialty: string | null;
  };
  appointment?: Appointment;
}
