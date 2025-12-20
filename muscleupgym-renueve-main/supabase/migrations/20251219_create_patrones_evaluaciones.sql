-- ============================================================================
-- MIGRATION: Crear tabla patrones_evaluaciones para MUPAI
-- Fecha: 2025-12-19
-- Descripción: Sistema de evaluación de patrones alimentarios vinculado a usuarios
-- ============================================================================

-- Tabla principal: patrones_evaluaciones
CREATE TABLE public.patrones_evaluaciones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  
  -- Vínculo con usuario autenticado (obligatorio)
  user_id uuid NOT NULL,
  
  -- Datos personales (pre-llenados desde perfil)
  nombre character varying(255) NOT NULL,
  email character varying(255) NOT NULL,
  telefono character varying(20),
  edad integer,
  sexo character varying(10),
  
  -- Estado del formulario
  paso_actual integer NOT NULL DEFAULT 1,
  completado boolean NOT NULL DEFAULT false,
  fecha_completado timestamp with time zone,
  
  -- Respuestas del cuestionario (estructura JSON)
  respuestas jsonb NOT NULL DEFAULT '{}'::jsonb,
  
  -- Metadata
  ip_address inet,
  
  -- Timestamps estándar
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  _deleted boolean DEFAULT false,
  
  -- Primary key
  CONSTRAINT patrones_evaluaciones_pkey PRIMARY KEY (id),
  
  -- Foreign key a auth.users (tabla de Supabase Auth)
  CONSTRAINT patrones_evaluaciones_user_id_fkey FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Validación de email
  CONSTRAINT patrones_evaluaciones_email_check 
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  
  -- Un usuario solo puede tener UNA evaluación incompleta a la vez
  CONSTRAINT patrones_evaluaciones_unique_active 
    UNIQUE (user_id, completado) DEFERRABLE INITIALLY DEFERRED
);

-- ============================================================================
-- ÍNDICES para optimizar búsquedas
-- ============================================================================

-- Índice por usuario (búsquedas frecuentes)
CREATE INDEX idx_patrones_evaluaciones_user_id 
  ON public.patrones_evaluaciones(user_id);

-- Índice por estado completado
CREATE INDEX idx_patrones_evaluaciones_completado 
  ON public.patrones_evaluaciones(completado);

-- Índice por fecha de creación (orden descendente para listar recientes primero)
CREATE INDEX idx_patrones_evaluaciones_created_at 
  ON public.patrones_evaluaciones(created_at DESC);

-- Índice por fecha de completado
CREATE INDEX idx_patrones_evaluaciones_fecha_completado 
  ON public.patrones_evaluaciones(fecha_completado DESC);

-- Índice compuesto para admin (completadas ordenadas por fecha)
CREATE INDEX idx_patrones_evaluaciones_admin 
  ON public.patrones_evaluaciones(completado, created_at DESC);

-- Índice en email para búsquedas
CREATE INDEX idx_patrones_evaluaciones_email 
  ON public.patrones_evaluaciones(email);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) - Políticas de acceso
-- ============================================================================

-- Habilitar RLS
ALTER TABLE public.patrones_evaluaciones ENABLE ROW LEVEL SECURITY;

-- Política 1: Los usuarios pueden ver SOLO sus propias evaluaciones
CREATE POLICY "users_view_own_evaluations" 
  ON public.patrones_evaluaciones
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política 2: Los usuarios pueden crear sus propias evaluaciones
CREATE POLICY "users_create_own_evaluations" 
  ON public.patrones_evaluaciones
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política 3: Los usuarios pueden actualizar SOLO sus evaluaciones incompletas
CREATE POLICY "users_update_own_evaluations" 
  ON public.patrones_evaluaciones
  FOR UPDATE
  USING (auth.uid() = user_id AND completado = false)
  WITH CHECK (auth.uid() = user_id);

-- Política 4: Los usuarios NO pueden eliminar evaluaciones (soft delete solo)
CREATE POLICY "users_soft_delete_own_evaluations" 
  ON public.patrones_evaluaciones
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND _deleted = true);

-- Política 5: Los ADMINS pueden ver TODAS las evaluaciones
CREATE POLICY "admins_view_all_evaluations" 
  ON public.patrones_evaluaciones
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 
      FROM public.profiles 
      WHERE profiles.id = auth.uid() 
        AND profiles.rol = 'admin'
        AND profiles._deleted = false
    )
  );

-- Política 6: Los ADMINS pueden actualizar cualquier evaluación
CREATE POLICY "admins_update_all_evaluations" 
  ON public.patrones_evaluaciones
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 
      FROM public.profiles 
      WHERE profiles.id = auth.uid() 
        AND profiles.rol = 'admin'
        AND profiles._deleted = false
    )
  );

-- ============================================================================
-- TRIGGER: Actualizar updated_at automáticamente
-- ============================================================================

-- Función trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_patrones_evaluaciones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger que ejecuta la función antes de cada UPDATE
CREATE TRIGGER update_patrones_evaluaciones_updated_at
  BEFORE UPDATE ON public.patrones_evaluaciones
  FOR EACH ROW
  EXECUTE FUNCTION public.update_patrones_evaluaciones_updated_at();

-- ============================================================================
-- COMENTARIOS en la tabla (documentación)
-- ============================================================================

COMMENT ON TABLE public.patrones_evaluaciones IS 
  'Evaluaciones de patrones alimentarios MUPAI vinculadas a usuarios con membresías activas';

COMMENT ON COLUMN public.patrones_evaluaciones.user_id IS 
  'ID del usuario autenticado (auth.users)';

COMMENT ON COLUMN public.patrones_evaluaciones.paso_actual IS 
  'Paso actual del cuestionario (1-13) para recuperar sesión';

COMMENT ON COLUMN public.patrones_evaluaciones.completado IS 
  'Indica si la evaluación fue finalizada y enviada';

COMMENT ON COLUMN public.patrones_evaluaciones.respuestas IS 
  'Estructura JSON con todas las respuestas del cuestionario de 13 pasos';

COMMENT ON COLUMN public.patrones_evaluaciones._deleted IS 
  'Soft delete: true = eliminado lógicamente, false = activo';

-- ============================================================================
-- EJEMPLO de estructura del campo JSONB 'respuestas'
-- ============================================================================
/*
{
  "grupo1_proteinas_grasas": {
    "huevos_embutidos": ["Huevo entero", "Chorizo"],
    "carnes_res_grasas": ["Ribeye", "Arrachera"],
    "carnes_cerdo_grasas": ["Costilla de cerdo"],
    "carnes_pollo_grasas": ["Muslo de pollo con piel"],
    "organos_grasos": ["Ninguno"],
    "quesos_grasos": ["Queso manchego"],
    "lacteos_enteros": ["Leche entera"],
    "pescados_grasos": ["Salmón"],
    "mariscos_grasos": ["Ninguno"]
  },
  "grupo2_proteinas_magras": {
    "carnes_res_magras": ["Filete", "Lomo bajo"],
    "carnes_cerdo_magras": ["Lomo de cerdo"],
    "carnes_pollo_magras": ["Pechuga de pollo sin piel"],
    "organos_magros": ["Ninguno"],
    "pescados_magros": ["Tilapia", "Atún en agua"],
    "mariscos_magros": ["Camarón"],
    "quesos_magros": ["Queso panela"],
    "lacteos_light": ["Leche descremada", "Yogur griego natural"],
    "huevos_embutidos_light": ["Clara de huevo"]
  },
  "grupo3_grasas_saludables": {
    "grasas_naturales": ["Aguacate", "Aceitunas"],
    "frutos_secos_semillas": ["Almendras", "Nueces"],
    "mantequillas_vegetales": ["Mantequilla de maní natural"]
  },
  "grupo4_carbohidratos": {
    "cereales_integrales": ["Avena tradicional", "Arroz integral"],
    "pastas": ["Pasta integral"],
    "tortillas_panes": ["Tortilla de maíz", "Pan integral"],
    "raices_tuberculos": ["Papa", "Camote"],
    "leguminosas": ["Frijoles negros", "Lentejas"]
  },
  "grupo5_vegetales": ["Espinaca", "Brócoli", "Jitomate", "Cebolla"],
  "grupo6_frutas": ["Manzana", "Plátano", "Naranja", "Fresas"],
  "aceites_coccion": ["Aceite de oliva extra virgen", "Aceite de aguacate"],
  "bebidas_sin_calorias": ["Agua natural", "Té verde sin azúcar"],
  "metodos_coccion": {
    "accesibles": ["A la plancha", "Horneado", "Al vapor"],
    "otro": ""
  },
  "alergias_intolerancias": {
    "alergias": ["Ninguna"],
    "otra_alergia": "",
    "intolerancias": ["Lácteos con lactosa"],
    "otra_intolerancia": ""
  },
  "antojos": {
    "dulces": ["Chocolate amargo", "Helado"],
    "salados": ["Papas fritas"],
    "comida_rapida": ["Tacos", "Pizza"],
    "bebidas": ["Refrescos regulares"],
    "picantes": ["Salsas picantes"],
    "otros": ""
  },
  "frecuencia_comidas": "Desayuno, comida, cena y una colación",
  "otra_frecuencia": "",
  "sugerencias_menus": "Que el equipo decida completamente por mí",
  "opcion_rapida_menu": ""
}
*/

-- ============================================================================
-- FIN DE MIGRATION
-- ============================================================================
