// ============================================================================
// TIPOS PARA SISTEMA DE PATRONES ALIMENTARIOS MUPAI
// ============================================================================

export interface PatronesEvaluacion {
  id: string;
  user_id: string;
  nombre: string;
  email: string;
  telefono?: string;
  edad?: number;
  sexo?: string;
  paso_actual: number;
  completado: boolean;
  fecha_completado?: string;
  respuestas: PatronesRespuestas;
  ip_address?: string;
  created_at: string;
  updated_at: string;
  _deleted: boolean;
}

export interface PatronesRespuestas {
  grupo1_proteinas_grasas?: Grupo1ProteinasGrasas;
  grupo2_proteinas_magras?: Grupo2ProteinasMagras;
  grupo3_grasas_saludables?: Grupo3GrasasSaludables;
  grupo4_carbohidratos?: Grupo4Carbohidratos;
  grupo5_vegetales?: string[];
  grupo6_frutas?: string[];
  aceites_coccion?: string[];
  bebidas_sin_calorias?: string[];
  metodos_coccion?: MetodosCoccion;
  alergias_intolerancias?: AlergiasIntolerancias;
  antojos?: Antojos;
  frecuencia_comidas?: string;
  otra_frecuencia?: string;
  sugerencias_menus?: string;
  opcion_rapida_menu?: string;
}

// ============================================================================
// GRUPO 1: PROTEÍNAS GRASAS
// ============================================================================
export interface Grupo1ProteinasGrasas {
  huevos_embutidos: string[];
  carnes_res_grasas: string[];
  carnes_cerdo_grasas: string[];
  carnes_pollo_grasas: string[];
  organos_grasos: string[];
  quesos_grasos: string[];
  lacteos_enteros: string[];
  pescados_grasos: string[];
  mariscos_grasos: string[];
}

// ============================================================================
// GRUPO 2: PROTEÍNAS MAGRAS
// ============================================================================
export interface Grupo2ProteinasMagras {
  carnes_res_magras: string[];
  carnes_cerdo_magras: string[];
  carnes_pollo_magras: string[];
  organos_magros: string[];
  pescados_magros: string[];
  mariscos_magros: string[];
  quesos_magros: string[];
  lacteos_light: string[];
  huevos_embutidos_light: string[];
}

// ============================================================================
// GRUPO 3: GRASAS SALUDABLES
// ============================================================================
export interface Grupo3GrasasSaludables {
  grasas_naturales: string[];
  frutos_secos_semillas: string[];
  mantequillas_vegetales: string[];
}

// ============================================================================
// GRUPO 4: CARBOHIDRATOS
// ============================================================================
export interface Grupo4Carbohidratos {
  cereales_integrales: string[];
  pastas: string[];
  tortillas_panes: string[];
  raices_tuberculos: string[];
  leguminosas: string[];
}

// ============================================================================
// MÉTODOS DE COCCIÓN
// ============================================================================
export interface MetodosCoccion {
  accesibles: string[];
  otro?: string;
}

// ============================================================================
// ALERGIAS E INTOLERANCIAS
// ============================================================================
export interface AlergiasIntolerancias {
  alergias: string[];
  otra_alergia?: string;
  intolerancias: string[];
  otra_intolerancia?: string;
}

// ============================================================================
// ANTOJOS
// ============================================================================
export interface Antojos {
  dulces: string[];
  salados: string[];
  comida_rapida: string[];
  bebidas: string[];
  picantes: string[];
  otros?: string;
}

// ============================================================================
// PROPS PARA FORMULARIO
// ============================================================================
export interface PatronesFormProps {
  initialData?: PatronesEvaluacion | null;
  user: {
    id: string;
    email?: string;
  };
}

// ============================================================================
// ESTADO DEL FORMULARIO
// ============================================================================
export interface PatronesFormState {
  currentStep: number;
  maxUnlockedStep: number;
  stepCompleted: Record<number, boolean>;
  respuestas: PatronesRespuestas;
  datosPersonales: {
    nombre: string;
    email: string;
    telefono: string;
    edad: number;
    sexo: 'Hombre' | 'Mujer';
  };
}

// ============================================================================
// PROPS PARA COMPONENTES DE PASOS
// ============================================================================
export interface StepComponentProps {
  value: any;
  onChange: (value: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
}

// ============================================================================
// VALIDACIÓN
// ============================================================================
export interface ValidationResult {
  isValid: boolean;
  missingItems: string[];
}

export type StepValidator = (data: any) => ValidationResult;

// ============================================================================
// API RESPONSES
// ============================================================================
export interface SaveProgressResponse {
  success: boolean;
  data?: PatronesEvaluacion;
  error?: string;
}

export interface FinalizeEvaluationResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface GetEvaluationResponse {
  success: boolean;
  data?: PatronesEvaluacion;
  error?: string;
}

// ============================================================================
// ADMIN - LISTA Y FILTROS
// ============================================================================
export interface PatronesEvaluacionListItem {
  id: string;
  nombre: string;
  email: string;
  edad?: number;
  completado: boolean;
  paso_actual: number;
  created_at: string;
  fecha_completado?: string;
  user_id: string;
}

export interface PatronesFilters {
  completado?: boolean;
  search?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  ordenar_por?: 'created_at' | 'fecha_completado' | 'nombre';
  orden?: 'asc' | 'desc';
}

export interface PatronesListResponse {
  success: boolean;
  data?: PatronesEvaluacionListItem[];
  total?: number;
  error?: string;
}
