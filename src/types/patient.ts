/**
 * Declaración obligatoria sobre la estructura familiar. Permite distinguir
 * «no tiene familiares» de «no se llenó el paso», que no son lo mismo.
 */
export type FamilyStructureStatus = 'registrada' | 'sin_familiares' | 'no_desea_compartir';

/** Un integrante de la estructura familiar del paciente. */
export interface FamilyMemberInput {
  full_name: string;
  /** Parentesco con el paciente: madre, padre, hermano, ... */
  relationship: string;
  age?: number;
  occupation?: string;
}

export interface FamilyMember extends FamilyMemberInput {
  id: string;
  patient_id: string;
  /** Conserva el orden en que se capturaron los integrantes. */
  position: number;
  created_at: string;
  updated_at: string;
}

/**
 * Campos comunes entre el formulario de alta y el registro ya persistido.
 *
 * La edad NO vive aquí: se deriva de `date_of_birth` (en SQL con
 * `public.patient_age()`, en el cliente con `calcularEdad()`), para que no se
 * desactualice sola con el paso del tiempo.
 */
interface PatientFields {
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  /** Estado civil. */
  marital_status?: string;
  religion?: string;
  /** Grado de estudios. */
  education_level?: string;
  /** Enfermedades recurrentes, texto libre. */
  recurrent_illnesses?: string;
  /** Objetivos que el paciente desea lograr en consulta. */
  consultation_goals?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  referral_source?: string;
  /** Obligatorio desde el formulario de registro. */
  family_structure_status?: FamilyStructureStatus;
  /** Detalle opcional cuando no se registran integrantes. */
  family_structure_reason?: string;
  attention_type: 'Psicológica' | 'Médica';
  terms_accepted: boolean;
}

export interface PatientFormData extends PatientFields {
  password: string;
  /** Se guardan en `patient_family_members`, no como columna de `patients`. */
  family_members?: FamilyMemberInput[];
  /**
   * Auxiliares del formulario: aparecen al elegir «Otro» y no se persisten.
   * Su contenido se vuelca sobre `gender` / `religion` antes de enviar, para
   * que en la BD quede el dato real y no la etiqueta «Otro».
   */
  gender_other?: string;
  religion_other?: string;
}

export interface Patient extends PatientFields {
  id: string;
  user_id?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
  /** Solo viene poblado cuando la consulta lo pide explícitamente. */
  family_members?: FamilyMember[];
}

/** Edad en años cumplidos. Espejo cliente de `public.patient_age()`. */
export function calcularEdad(dateOfBirth?: string | null): number | undefined {
  if (!dateOfBirth) return undefined;
  const nacimiento = new Date(dateOfBirth);
  if (Number.isNaN(nacimiento.getTime())) return undefined;

  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
  return edad >= 0 ? edad : undefined;
}
