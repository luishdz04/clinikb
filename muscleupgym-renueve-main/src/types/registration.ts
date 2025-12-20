/**
 * Tipos para el formulario de registro multi-paso
 */

export interface PersonalData {
  profilePhoto?: string; // Base64 string
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  whatsapp: string;
  dateOfBirth: string;
  street: string;
  number: string;
  colony: string;
  state: string;
  city: string;
  zipCode: string;
  country: string;
  gender: 'male' | 'female' | 'other';
  civilStatus: 'single' | 'married' | 'divorced' | 'widowed';
  isMinor?: boolean;
  tutorIdFile?: string; // Base64 string
}

export interface EmergencyData {
  emergencyContactName: string;
  emergencyContactPhone: string;
  medicalCondition: string;
  bloodType: string;
}

export interface PreferencesData {
  mainMotivation: string;
  trainingLevel: string;
  referredBy: string;
  receivePlans: boolean;
}

export interface Contract {
  signature: string; // Base64 string del canvas
  acceptedTerms: boolean;
  acceptedPrivacy: boolean;
  signedDate: string;
}

export interface RegistrationFormData {
  personalData: PersonalData;
  emergencyData: EmergencyData;
  preferences: PreferencesData;
  contract: Contract;
}

export type RegistrationStep = 'personal' | 'emergency' | 'preferences' | 'contract';
