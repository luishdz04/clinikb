export interface PatientFormData {
  full_name: string;
  email: string;
  password: string;
  phone: string;
  date_of_birth: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  referral_source?: string;
  attention_type: 'Psicológica' | 'Médica';
  terms_accepted: boolean;
}

export interface Patient {
  id: string;
  user_id?: string;
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  referral_source?: string;
  attention_type: 'Psicológica' | 'Médica';
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  approved_by?: string;
  approved_at?: string;
  terms_accepted: boolean;
  created_at: string;
  updated_at: string;
}
