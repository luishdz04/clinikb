export interface Service {
  id: string;
  key: string;
  title: string;
  category: 'Psicológica' | 'Médica';
  duration_minutes: number;
  description: string | null;
  active: boolean;
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
