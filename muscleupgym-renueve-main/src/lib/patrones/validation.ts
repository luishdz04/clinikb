// ============================================================================
// VALIDACIONES PARA FORMULARIO DE PATRONES ALIMENTARIOS MUPAI
// ============================================================================

import type { PatronesRespuestas } from "@/types/patrones";

// ============================================================================
// VALIDACIONES POR PASO
// ============================================================================

export function validatePaso1(respuestas: PatronesRespuestas): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Grupo 1: Proteínas con grasa - debe seleccionar al menos 3 opciones en total
  const grupo1 = respuestas.grupo1_proteinas_grasas;
  const totalGrupo1 =
    (grupo1?.huevos_embutidos?.length || 0) +
    (grupo1?.carnes_res_grasas?.length || 0) +
    (grupo1?.carnes_cerdo_grasas?.length || 0) +
    (grupo1?.carnes_pollo_grasas?.length || 0) +
    (grupo1?.organos_grasos?.length || 0) +
    (grupo1?.quesos_grasos?.length || 0) +
    (grupo1?.lacteos_enteros?.length || 0) +
    (grupo1?.pescados_grasos?.length || 0) +
    (grupo1?.mariscos_grasos?.length || 0);

  if (totalGrupo1 < 3) {
    errors.push(
      "Selecciona al menos 3 alimentos del Grupo 1 (Proteínas con grasa)"
    );
  }

  return { isValid: errors.length === 0, errors };
}

export function validatePaso2(respuestas: PatronesRespuestas): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Grupo 2: Proteínas magras - debe seleccionar al menos 3 opciones en total
  const grupo2 = respuestas.grupo2_proteinas_magras;
  const totalGrupo2 =
    (grupo2?.carnes_res_magras?.length || 0) +
    (grupo2?.carnes_cerdo_magras?.length || 0) +
    (grupo2?.carnes_pollo_magras?.length || 0) +
    (grupo2?.organos_magros?.length || 0) +
    (grupo2?.pescados_magros?.length || 0) +
    (grupo2?.mariscos_magros?.length || 0) +
    (grupo2?.quesos_magros?.length || 0) +
    (grupo2?.lacteos_light?.length || 0) +
    (grupo2?.huevos_embutidos_light?.length || 0);

  if (totalGrupo2 < 3) {
    errors.push(
      "Selecciona al menos 3 alimentos del Grupo 2 (Proteínas magras)"
    );
  }

  return { isValid: errors.length === 0, errors };
}

export function validatePaso3(respuestas: PatronesRespuestas): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Grupo 3: Grasas saludables - debe seleccionar al menos 2 opciones en total
  const grupo3 = respuestas.grupo3_grasas_saludables;
  const totalGrupo3 =
    (grupo3?.grasas_naturales?.length || 0) +
    (grupo3?.frutos_secos_semillas?.length || 0) +
    (grupo3?.mantequillas_vegetales?.length || 0);

  if (totalGrupo3 < 2) {
    errors.push(
      "Selecciona al menos 2 alimentos del Grupo 3 (Grasas saludables)"
    );
  }

  return { isValid: errors.length === 0, errors };
}

export function validatePaso4(respuestas: PatronesRespuestas): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Grupo 4: Carbohidratos - debe seleccionar al menos 3 opciones en total
  const grupo4 = respuestas.grupo4_carbohidratos;
  const totalGrupo4 =
    (grupo4?.cereales_integrales?.length || 0) +
    (grupo4?.pastas?.length || 0) +
    (grupo4?.tortillas_panes?.length || 0) +
    (grupo4?.raices_tuberculos?.length || 0) +
    (grupo4?.leguminosas?.length || 0);

  if (totalGrupo4 < 3) {
    errors.push(
      "Selecciona al menos 3 alimentos del Grupo 4 (Carbohidratos)"
    );
  }

  return { isValid: errors.length === 0, errors };
}

export function validatePaso5(respuestas: PatronesRespuestas): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Grupo 5: Vegetales - debe seleccionar al menos 5 vegetales
  if (!respuestas.grupo5_vegetales || respuestas.grupo5_vegetales.length < 5) {
    errors.push("Selecciona al menos 5 vegetales que consumes regularmente");
  }

  return { isValid: errors.length === 0, errors };
}

export function validatePaso6(respuestas: PatronesRespuestas): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Grupo 6: Frutas - debe seleccionar al menos 3 frutas
  if (!respuestas.grupo6_frutas || respuestas.grupo6_frutas.length < 3) {
    errors.push("Selecciona al menos 3 frutas que consumes regularmente");
  }

  return { isValid: errors.length === 0, errors };
}

export function validatePaso7(respuestas: PatronesRespuestas): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Aceites de cocción - debe seleccionar al menos 1
  if (
    !respuestas.aceites_coccion ||
    respuestas.aceites_coccion.length === 0
  ) {
    errors.push("Selecciona al menos un aceite o grasa para cocinar");
  }

  return { isValid: errors.length === 0, errors };
}

export function validatePaso8(respuestas: PatronesRespuestas): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Bebidas sin calorías - debe seleccionar al menos 1
  if (
    !respuestas.bebidas_sin_calorias ||
    respuestas.bebidas_sin_calorias.length === 0
  ) {
    errors.push("Selecciona al menos una bebida que consumes regularmente");
  }

  return { isValid: errors.length === 0, errors };
}

export function validatePaso9(respuestas: PatronesRespuestas): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Métodos de cocción - debe seleccionar al menos 1
  const metodos = respuestas.metodos_coccion;
  if (!metodos?.accesibles || metodos.accesibles.length === 0) {
    errors.push(
      "Selecciona al menos un método de cocción que tengas disponible"
    );
  }

  return { isValid: errors.length === 0, errors };
}

export function validatePaso10(respuestas: PatronesRespuestas): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Alergias e intolerancias - debe seleccionar al menos 1 en cada categoría
  const alergias = respuestas.alergias_intolerancias;
  if (!alergias?.alergias || alergias.alergias.length === 0) {
    errors.push("Selecciona al menos una opción en alergias (o 'Ninguna')");
  }
  if (!alergias?.intolerancias || alergias.intolerancias.length === 0) {
    errors.push(
      "Selecciona al menos una opción en intolerancias (o 'Ninguna')"
    );
  }

  return { isValid: errors.length === 0, errors };
}

export function validatePaso11(respuestas: PatronesRespuestas): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Antojos - debe seleccionar al menos 1 opción en total
  const antojos = respuestas.antojos;
  const totalAntojos =
    (antojos?.dulces?.length || 0) +
    (antojos?.salados?.length || 0) +
    (antojos?.comida_rapida?.length || 0) +
    (antojos?.bebidas?.length || 0) +
    (antojos?.picantes?.length || 0);

  if (totalAntojos === 0) {
    errors.push(
      "Selecciona al menos un antojo (o 'Ninguno' en alguna categoría)"
    );
  }

  return { isValid: errors.length === 0, errors };
}

export function validatePaso12(respuestas: PatronesRespuestas): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Frecuencia de comidas - debe seleccionar 1 opción
  if (!respuestas.frecuencia_comidas) {
    errors.push("Selecciona una opción de frecuencia de comidas");
  }

  // Si seleccionó "Otro", debe especificar
  if (
    respuestas.frecuencia_comidas === "Otro (especificar)" &&
    (!respuestas.otra_frecuencia || respuestas.otra_frecuencia.trim() === "")
  ) {
    errors.push("Especifica tu frecuencia de comidas personalizada");
  }

  return { isValid: errors.length === 0, errors };
}

export function validatePaso13(respuestas: PatronesRespuestas): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Sugerencias de menús - debe seleccionar 1 opción
  if (
    !respuestas.sugerencias_menus ||
    respuestas.sugerencias_menus === "Seleccionar..."
  ) {
    errors.push("Selecciona una opción de sugerencias de menús");
  }

  return { isValid: errors.length === 0, errors };
}

// ============================================================================
// VALIDADOR GENERAL
// ============================================================================

export function validatePaso(
  paso: number,
  respuestas: PatronesRespuestas
): { isValid: boolean; errors: string[] } {
  switch (paso) {
    case 1:
      return validatePaso1(respuestas);
    case 2:
      return validatePaso2(respuestas);
    case 3:
      return validatePaso3(respuestas);
    case 4:
      return validatePaso4(respuestas);
    case 5:
      return validatePaso5(respuestas);
    case 6:
      return validatePaso6(respuestas);
    case 7:
      return validatePaso7(respuestas);
    case 8:
      return validatePaso8(respuestas);
    case 9:
      return validatePaso9(respuestas);
    case 10:
      return validatePaso10(respuestas);
    case 11:
      return validatePaso11(respuestas);
    case 12:
      return validatePaso12(respuestas);
    case 13:
      return validatePaso13(respuestas);
    default:
      return { isValid: false, errors: ["Paso inválido"] };
  }
}

// ============================================================================
// CALCULAR PROGRESO TOTAL
// ============================================================================

export function calculateProgress(respuestas: PatronesRespuestas): number {
  let completed = 0;
  const total = 13;

  for (let i = 1; i <= 13; i++) {
    const { isValid } = validatePaso(i, respuestas);
    if (isValid) completed++;
  }

  return Math.round((completed / total) * 100);
}
