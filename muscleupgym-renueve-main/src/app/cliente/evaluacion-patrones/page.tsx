'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Steps,
  Button,
  Typography,
  App,
  Space,
  Progress,
  Spin,
  Alert,
  Checkbox,
  Input,
  Select,
  Radio,
  Divider,
} from 'antd';
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  SaveOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { colors } from '@/theme';
import type { PatronesRespuestas } from '@/types/patrones';
import { validatePaso, calculateProgress } from '@/lib/patrones/validation';
import * as FormData from '@/lib/patrones/formData';
import { useRouter } from 'next/navigation';
import {
  Paso4,
  Paso5,
  Paso6,
  Paso7,
  Paso8,
  Paso9,
  Paso10,
  Paso11,
  Paso12,
  Paso13,
} from '@/components/patrones/StepComponents';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export default function EvaluacionPatronesPage() {
  const { message } = App.useApp();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [hasActiveEvaluation, setHasActiveEvaluation] = useState(false);
  const [completedEvaluation, setCompletedEvaluation] = useState<any>(null);
  const [respuestas, setRespuestas] = useState<PatronesRespuestas>({
    grupo1_proteinas_grasas: {
      huevos_embutidos: [],
      carnes_res_grasas: [],
      carnes_cerdo_grasas: [],
      carnes_pollo_grasas: [],
      organos_grasos: [],
      quesos_grasos: [],
      lacteos_enteros: [],
      pescados_grasos: [],
      mariscos_grasos: [],
    },
    grupo2_proteinas_magras: {
      carnes_res_magras: [],
      carnes_cerdo_magras: [],
      carnes_pollo_magras: [],
      organos_magros: [],
      pescados_magros: [],
      mariscos_magros: [],
      quesos_magros: [],
      lacteos_light: [],
      huevos_embutidos_light: [],
    },
    grupo3_grasas_saludables: {
      grasas_naturales: [],
      frutos_secos_semillas: [],
      mantequillas_vegetales: [],
    },
    grupo4_carbohidratos: {
      cereales_integrales: [],
      pastas: [],
      tortillas_panes: [],
      raices_tuberculos: [],
      leguminosas: [],
    },
    grupo5_vegetales: [],
    grupo6_frutas: [],
    aceites_coccion: [],
    bebidas_sin_calorias: [],
    metodos_coccion: {
      accesibles: [],
      otro: '',
    },
    alergias_intolerancias: {
      alergias: [],
      otra_alergia: '',
      intolerancias: [],
      otra_intolerancia: '',
    },
    antojos: {
      dulces: [],
      salados: [],
      comida_rapida: [],
      bebidas: [],
      picantes: [],
      otros: '',
    },
    frecuencia_comidas: '',
    otra_frecuencia: '',
    sugerencias_menus: '',
    opcion_rapida_menu: '',
  });

  // Cargar evaluación existente
  useEffect(() => {
    const loadEvaluation = async () => {
      try {
const response = await fetch('/api/patrones/get-evaluation', {
        credentials: 'include',
      });
        const data = await response.json();

        if (data.success && data.evaluacion) {
          if (data.tipo === 'incompleta') {
            setRespuestas(data.evaluacion.respuestas);
            setCurrentStep(data.evaluacion.paso_actual);
            setHasActiveEvaluation(true);
          } else if (data.tipo === 'completada') {
            setCompletedEvaluation(data.evaluacion);
          }
        }
      } catch (error) {
        console.error('Error al cargar evaluación:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEvaluation();
  }, []);

  // Auto-guardar progreso
  const saveProgress = async (silent = false) => {
    if (!silent) setSaving(true);
    try {
      const response = await fetch('/api/patrones/save-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          paso_actual: currentStep,
          respuestas,
        }),
      });

      if (!response.ok) throw new Error('Error al guardar');

      if (!silent) message.success('Progreso guardado');
    } catch (error) {
      if (!silent) message.error('Error al guardar progreso');
    } finally {
      if (!silent) setSaving(false);
    }
  };

  // Finalizar evaluación
  const finalize = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/patrones/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ respuestas }),
      });

      if (!response.ok) throw new Error('Error al finalizar');

      message.success('¡Evaluación completada exitosamente!');
      setTimeout(() => router.push('/cliente/dashboard'), 2000);
    } catch (error) {
      message.error('Error al finalizar evaluación');
    } finally {
      setSaving(false);
    }
  };

  // Navegación
  const handleNext = () => {
    const validation = validatePaso(currentStep, respuestas);
    if (!validation.isValid) {
      message.warning(validation.errors[0]);
      return;
    }
    if (currentStep < 13) {
      setCurrentStep(currentStep + 1);
      saveProgress(true);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    const validation = validatePaso(13, respuestas);
    if (!validation.isValid) {
      message.warning(validation.errors[0]);
      return;
    }
    finalize();
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  // Si ya completó la evaluación
  if (completedEvaluation) {
    return (
      <div>
        <Title level={2} style={{ color: colors.text.primary }}>
          Evaluación de Patrones Alimentarios
        </Title>
        <Card>
          <Alert
            message="Evaluación Completada"
            description={
              <div>
                <Paragraph>
                  Ya has completado tu evaluación de patrones alimentarios el{' '}
                  {new Date(completedEvaluation.fecha_completado).toLocaleDateString('es-MX')}.
                </Paragraph>
                <Paragraph>
                  Nuestro equipo está analizando tus respuestas y pronto recibirás tu plan nutricional
                  personalizado.
                </Paragraph>
              </div>
            }
            type="success"
            showIcon
            icon={<CheckCircleOutlined />}
          />
          <div style={{ marginTop: 24 }}>
            <Button type="primary" onClick={() => router.push('/cliente/dashboard')}>
              Volver al Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const progress = calculateProgress(respuestas);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, color: colors.text.primary }}>
          Evaluación de Patrones Alimentarios MUPAI
        </Title>
        <Text style={{ color: colors.text.secondary }}>
          Completa este cuestionario para recibir tu plan nutricional personalizado
        </Text>
      </div>

      {hasActiveEvaluation && (
        <Alert
          message="Sesión Recuperada"
          description="Hemos recuperado tu progreso anterior. Puedes continuar donde lo dejaste."
          type="info"
          showIcon
          closable
          style={{ marginBottom: 24 }}
        />
      )}

      <Card 
        style={{ 
          background: `linear-gradient(135deg, ${colors.background.secondary} 0%, ${colors.background.tertiary} 100%)`,
          border: `1px solid ${colors.border.secondary}`,
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
            <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: 600 }}>
              Paso {currentStep} de 13
            </Text>
            <div style={{ 
              padding: '4px 16px', 
              background: colors.brand.primary, 
              borderRadius: 20,
              animation: 'pulse 2s infinite'
            }}>
              <Text style={{ fontSize: 14, fontWeight: 700, color: colors.background.primary }}>
                {progress}% Completado
              </Text>
            </div>
          </div>
          <Progress 
            percent={progress} 
            strokeColor={{
              '0%': colors.brand.primary,
              '100%': colors.state.success,
            }}
            railColor={colors.background.tertiary}
            size={10}
            showInfo={false}
          />
        </div>

        {/* Steps para móvil - solo mostrar paso actual y total */}
        <div className="block md:hidden" style={{ marginBottom: 24 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '16px',
            background: `linear-gradient(135deg, ${colors.background.tertiary} 0%, ${colors.background.secondary} 100%)`,
            borderRadius: 12,
            border: `1px solid ${colors.border.secondary}`,
          }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: colors.brand.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 18,
              color: colors.background.primary,
            }}>
              {currentStep}
            </div>
            <div style={{ flex: 1 }}>
              <Text style={{ color: colors.text.primary, fontWeight: 600, display: 'block' }}>
                {[
                  'Proteínas con Grasa',
                  'Proteínas Magras',
                  'Grasas Saludables',
                  'Carbohidratos',
                  'Vegetales',
                  'Frutas',
                  'Aceites de Cocción',
                  'Bebidas',
                  'Métodos de Cocción',
                  'Alergias e Intolerancias',
                  'Antojos',
                  'Frecuencia de Comidas',
                  'Menús Semanales'
                ][currentStep - 1]}
              </Text>
              <Text style={{ color: colors.text.secondary, fontSize: 12 }}>
                Paso {currentStep} de 13
              </Text>
            </div>
          </div>
        </div>

        {/* Steps para desktop */}
        <div className="hidden md:block">
          <Steps
            current={currentStep - 1}
            size="small"
            responsive={false}
            style={{ marginBottom: 32, overflowX: 'auto', padding: '8px 0' }}
            items={[
              { title: 'Grupo 1', icon: currentStep > 1 ? <CheckCircleOutlined /> : null },
              { title: 'Grupo 2', icon: currentStep > 2 ? <CheckCircleOutlined /> : null },
              { title: 'Grupo 3', icon: currentStep > 3 ? <CheckCircleOutlined /> : null },
              { title: 'Grupo 4', icon: currentStep > 4 ? <CheckCircleOutlined /> : null },
              { title: 'Vegetales', icon: currentStep > 5 ? <CheckCircleOutlined /> : null },
              { title: 'Frutas', icon: currentStep > 6 ? <CheckCircleOutlined /> : null },
              { title: 'Aceites', icon: currentStep > 7 ? <CheckCircleOutlined /> : null },
              { title: 'Bebidas', icon: currentStep > 8 ? <CheckCircleOutlined /> : null },
              { title: 'Cocción', icon: currentStep > 9 ? <CheckCircleOutlined /> : null },
              { title: 'Alergias', icon: currentStep > 10 ? <CheckCircleOutlined /> : null },
              { title: 'Antojos', icon: currentStep > 11 ? <CheckCircleOutlined /> : null },
              { title: 'Frecuencia', icon: currentStep > 12 ? <CheckCircleOutlined /> : null },
              { title: 'Menús' },
            ]}
          />
        </div>

        {/* Contenido del paso con animación */}
        <div style={{ 
          minHeight: 400, 
          marginBottom: 24,
          animation: 'fadeIn 0.4s ease-in',
          padding: '16px 0'
        }}>
          {renderStep(currentStep, respuestas, setRespuestas)}
        </div>

        <Divider />

        {/* Botones de navegación mejorados */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap'
        }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handlePrev}
            disabled={currentStep === 1}
            size="large"
            style={{
              borderRadius: 8,
              height: 48,
              minWidth: 120,
              fontSize: 16
            }}
          >
            Anterior
          </Button>

          {currentStep < 13 ? (
            <Button
              type="primary"
              icon={<ArrowRightOutlined />}
              onClick={handleNext}
              loading={saving}
              size="large"
              style={{
                borderRadius: 8,
                height: 48,
                minWidth: 120,
                fontSize: 16,
                backgroundColor: colors.brand.primary,
                borderColor: colors.brand.primary,
                fontWeight: 600,
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 4px rgba(255, 204, 0, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(255, 204, 0, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(255, 204, 0, 0.2)';
              }}
            >
              Siguiente
            </Button>
          ) : (
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={handleFinish}
              loading={saving}
              size="large"
              style={{
                borderRadius: 8,
                height: 48,
                minWidth: 180,
                fontSize: 16,
                backgroundColor: colors.state.success,
                borderColor: colors.state.success,
                fontWeight: 600,
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 4px rgba(82, 196, 26, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(82, 196, 26, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(82, 196, 26, 0.2)';
              }}
            >
              🎉 Finalizar Evaluación
            </Button>
          )}
        </div>
      </Card>

      {/* CSS para animaciones y responsividad */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
        
        /* Responsive para tablets */
        @media (max-width: 768px) {
          .ant-steps-item-title {
            font-size: 11px !important;
          }
          .ant-steps-item {
            padding-inline-start: 8px !important;
          }
          .ant-card-body {
            padding: 16px !important;
          }
          .ant-checkbox-group {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)) !important;
            gap: 8px !important;
          }
        }
        
        /* Responsive para móviles */
        @media (max-width: 480px) {
          .ant-space {
            width: 100%;
          }
          .ant-space > .ant-space-item {
            width: 100%;
          }
          .ant-space > .ant-space-item > button {
            width: 100%;
          }
          .ant-checkbox-group {
            grid-template-columns: 1fr !important;
          }
          .ant-steps {
            padding: 4px 0 !important;
          }
          .ant-steps-item-title {
            font-size: 10px !important;
          }
        }
        
        /* Mejoras visuales */
        .ant-checkbox-wrapper {
          padding: 8px;
          border-radius: 6px;
          transition: all 0.2s ease;
        }
        .ant-checkbox-wrapper:hover {
          background: rgba(255, 204, 0, 0.1);
        }
        .ant-checkbox-wrapper-checked {
          background: rgba(255, 204, 0, 0.15);
          font-weight: 500;
        }
        .ant-btn-lg {
          transition: all 0.3s ease;
        }
        .ant-btn-lg:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// RENDERIZADO DE CADA PASO
// ============================================================================

function renderStep(
  step: number,
  respuestas: PatronesRespuestas,
  setRespuestas: (r: PatronesRespuestas) => void
) {
  switch (step) {
    case 1:
      return <Paso1 respuestas={respuestas} setRespuestas={setRespuestas} />;
    case 2:
      return <Paso2 respuestas={respuestas} setRespuestas={setRespuestas} />;
    case 3:
      return <Paso3 respuestas={respuestas} setRespuestas={setRespuestas} />;
    case 4:
      return <Paso4 respuestas={respuestas} setRespuestas={setRespuestas} />;
    case 5:
      return <Paso5 respuestas={respuestas} setRespuestas={setRespuestas} />;
    case 6:
      return <Paso6 respuestas={respuestas} setRespuestas={setRespuestas} />;
    case 7:
      return <Paso7 respuestas={respuestas} setRespuestas={setRespuestas} />;
    case 8:
      return <Paso8 respuestas={respuestas} setRespuestas={setRespuestas} />;
    case 9:
      return <Paso9 respuestas={respuestas} setRespuestas={setRespuestas} />;
    case 10:
      return <Paso10 respuestas={respuestas} setRespuestas={setRespuestas} />;
    case 11:
      return <Paso11 respuestas={respuestas} setRespuestas={setRespuestas} />;
    case 12:
      return <Paso12 respuestas={respuestas} setRespuestas={setRespuestas} />;
    case 13:
      return <Paso13 respuestas={respuestas} setRespuestas={setRespuestas} />;
    default:
      return null;
  }
}

// ============================================================================
// PASO 1: PROTEÍNAS CON GRASA
// ============================================================================

function Paso1({
  respuestas,
  setRespuestas,
}: {
  respuestas: PatronesRespuestas;
  setRespuestas: (r: PatronesRespuestas) => void;
}) {
  const updateGroup1 = (key: string, values: string[]) => {
    setRespuestas({
      ...respuestas,
      grupo1_proteinas_grasas: {
        ...respuestas.grupo1_proteinas_grasas!,
        [key]: values,
      },
    });
  };

  return (
    <div>
      <Title level={3} style={{ color: colors.brand.primary }}>
        GRUPO 1: Proteína Animal con Más Contenido Graso
      </Title>
      <Paragraph style={{ color: colors.text.secondary }}>
        Selecciona <strong>todos</strong> los alimentos que consumes regularmente (mínimo 3 en total).
      </Paragraph>

      <Space vertical size="large" style={{ width: '100%' }}>
        <CheckboxGroup
          title="🥚 Huevos y Embutidos"
          options={FormData.HUEVOS_EMBUTIDOS}
          value={respuestas.grupo1_proteinas_grasas?.huevos_embutidos || []}
          onChange={(v) => updateGroup1('huevos_embutidos', v)}
        />

        <CheckboxGroup
          title="🥩 Carnes de Res Grasas"
          options={FormData.CARNES_RES_GRASAS}
          value={respuestas.grupo1_proteinas_grasas?.carnes_res_grasas || []}
          onChange={(v) => updateGroup1('carnes_res_grasas', v)}
        />

        <CheckboxGroup
          title="🐷 Carnes de Cerdo Grasas"
          options={FormData.CARNES_CERDO_GRASAS}
          value={respuestas.grupo1_proteinas_grasas?.carnes_cerdo_grasas || []}
          onChange={(v) => updateGroup1('carnes_cerdo_grasas', v)}
        />

        <CheckboxGroup
          title="🍗 Carnes de Pollo/Pavo Grasas"
          options={FormData.CARNES_POLLO_GRASAS}
          value={respuestas.grupo1_proteinas_grasas?.carnes_pollo_grasas || []}
          onChange={(v) => updateGroup1('carnes_pollo_grasas', v)}
        />

        <CheckboxGroup
          title="🫀 Órganos Grasos"
          options={FormData.ORGANOS_GRASOS}
          value={respuestas.grupo1_proteinas_grasas?.organos_grasos || []}
          onChange={(v) => updateGroup1('organos_grasos', v)}
        />

        <CheckboxGroup
          title="🧀 Quesos Grasos"
          options={FormData.QUESOS_GRASOS}
          value={respuestas.grupo1_proteinas_grasas?.quesos_grasos || []}
          onChange={(v) => updateGroup1('quesos_grasos', v)}
        />

        <CheckboxGroup
          title="🥛 Lácteos Enteros"
          options={FormData.LACTEOS_ENTEROS}
          value={respuestas.grupo1_proteinas_grasas?.lacteos_enteros || []}
          onChange={(v) => updateGroup1('lacteos_enteros', v)}
        />

        <CheckboxGroup
          title="🐟 Pescados Grasos"
          options={FormData.PESCADOS_GRASOS}
          value={respuestas.grupo1_proteinas_grasas?.pescados_grasos || []}
          onChange={(v) => updateGroup1('pescados_grasos', v)}
        />

        <CheckboxGroup
          title="🦞 Mariscos Grasos"
          options={FormData.MARISCOS_GRASOS}
          value={respuestas.grupo1_proteinas_grasas?.mariscos_grasos || []}
          onChange={(v) => updateGroup1('mariscos_grasos', v)}
        />
      </Space>
    </div>
  );
}

// ============================================================================
// PASO 2: PROTEÍNAS MAGRAS
// ============================================================================

function Paso2({
  respuestas,
  setRespuestas,
}: {
  respuestas: PatronesRespuestas;
  setRespuestas: (r: PatronesRespuestas) => void;
}) {
  const updateGroup2 = (key: string, values: string[]) => {
    setRespuestas({
      ...respuestas,
      grupo2_proteinas_magras: {
        ...respuestas.grupo2_proteinas_magras!,
        [key]: values,
      },
    });
  };

  return (
    <div>
      <Title level={3} style={{ color: colors.brand.primary }}>
        GRUPO 2: Proteína Animal Magra
      </Title>
      <Paragraph style={{ color: colors.text.secondary }}>
        Selecciona <strong>todos</strong> los alimentos que consumes regularmente (mínimo 3 en total).
      </Paragraph>

      <Space vertical size="large" style={{ width: '100%' }}>
        <CheckboxGroup
          title="🥩 Carnes de Res Magras"
          options={FormData.CARNES_RES_MAGRAS}
          value={respuestas.grupo2_proteinas_magras?.carnes_res_magras || []}
          onChange={(v) => updateGroup2('carnes_res_magras', v)}
        />

        <CheckboxGroup
          title="🐷 Carnes de Cerdo Magras"
          options={FormData.CARNES_CERDO_MAGRAS}
          value={respuestas.grupo2_proteinas_magras?.carnes_cerdo_magras || []}
          onChange={(v) => updateGroup2('carnes_cerdo_magras', v)}
        />

        <CheckboxGroup
          title="🍗 Carnes de Pollo/Pavo Magras"
          options={FormData.CARNES_POLLO_MAGRAS}
          value={respuestas.grupo2_proteinas_magras?.carnes_pollo_magras || []}
          onChange={(v) => updateGroup2('carnes_pollo_magras', v)}
        />

        <CheckboxGroup
          title="🫀 Órganos Magros"
          options={FormData.ORGANOS_MAGROS}
          value={respuestas.grupo2_proteinas_magras?.organos_magros || []}
          onChange={(v) => updateGroup2('organos_magros', v)}
        />

        <CheckboxGroup
          title="🐟 Pescados Magros"
          options={FormData.PESCADOS_MAGROS}
          value={respuestas.grupo2_proteinas_magras?.pescados_magros || []}
          onChange={(v) => updateGroup2('pescados_magros', v)}
        />

        <CheckboxGroup
          title="🦐 Mariscos Magros"
          options={FormData.MARISCOS_MAGROS}
          value={respuestas.grupo2_proteinas_magras?.mariscos_magros || []}
          onChange={(v) => updateGroup2('mariscos_magros', v)}
        />

        <CheckboxGroup
          title="🧀 Quesos Magros"
          options={FormData.QUESOS_MAGROS}
          value={respuestas.grupo2_proteinas_magras?.quesos_magros || []}
          onChange={(v) => updateGroup2('quesos_magros', v)}
        />

        <CheckboxGroup
          title="🥛 Lácteos Light"
          options={FormData.LACTEOS_LIGHT}
          value={respuestas.grupo2_proteinas_magras?.lacteos_light || []}
          onChange={(v) => updateGroup2('lacteos_light', v)}
        />

        <CheckboxGroup
          title="🥚 Huevos y Embutidos Light"
          options={FormData.HUEVOS_EMBUTIDOS_LIGHT}
          value={respuestas.grupo2_proteinas_magras?.huevos_embutidos_light || []}
          onChange={(v) => updateGroup2('huevos_embutidos_light', v)}
        />
      </Space>
    </div>
  );
}

// ============================================================================
// PASO 3: GRASAS SALUDABLES
// ============================================================================

function Paso3({
  respuestas,
  setRespuestas,
}: {
  respuestas: PatronesRespuestas;
  setRespuestas: (r: PatronesRespuestas) => void;
}) {
  const updateGroup3 = (key: string, values: string[]) => {
    setRespuestas({
      ...respuestas,
      grupo3_grasas_saludables: {
        ...respuestas.grupo3_grasas_saludables!,
        [key]: values,
      },
    });
  };

  return (
    <div>
      <Title level={3} style={{ color: colors.brand.primary }}>
        GRUPO 3: Fuentes de Grasa Saludable
      </Title>
      <Paragraph style={{ color: colors.text.secondary }}>
        Selecciona <strong>todos</strong> los alimentos que consumes regularmente (mínimo 2 en total).
      </Paragraph>

      <Space vertical size="large" style={{ width: '100%' }}>
        <CheckboxGroup
          title="🥑 Grasas Naturales"
          options={FormData.GRASAS_NATURALES}
          value={respuestas.grupo3_grasas_saludables?.grasas_naturales || []}
          onChange={(v) => updateGroup3('grasas_naturales', v)}
        />

        <CheckboxGroup
          title="🥜 Frutos Secos y Semillas"
          options={FormData.FRUTOS_SECOS_SEMILLAS}
          value={respuestas.grupo3_grasas_saludables?.frutos_secos_semillas || []}
          onChange={(v) => updateGroup3('frutos_secos_semillas', v)}
        />

        <CheckboxGroup
          title="🧈 Mantequillas Vegetales"
          options={FormData.MANTEQUILLAS_VEGETALES}
          value={respuestas.grupo3_grasas_saludables?.mantequillas_vegetales || []}
          onChange={(v) => updateGroup3('mantequillas_vegetales', v)}
        />
      </Space>
    </div>
  );
}

// ============================================================================
// COMPONENTE AUXILIAR: CheckboxGroup
// ============================================================================

function CheckboxGroup({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: string[];
  value: string[];
  onChange: (values: string[]) => void;
}) {
  const selectedCount = value.length;
  
  return (
    <Card 
      size="small"
      style={{ 
        background: colors.background.tertiary,
        border: `1px solid ${colors.border.secondary}`,
        borderRadius: 8,
        marginBottom: 16,
        transition: 'all 0.3s ease',
        boxShadow: selectedCount > 0 ? `0 0 0 2px ${colors.brand.primary}40` : 'none'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <Title level={5} style={{ color: colors.text.primary, margin: 0, fontSize: 16 }}>
          {title}
        </Title>
        {selectedCount > 0 && (
          <div style={{ 
            padding: '2px 12px', 
            background: colors.brand.primary, 
            borderRadius: 12,
            fontSize: 12,
            fontWeight: 600,
            color: colors.background.primary
          }}>
            {selectedCount} seleccionado{selectedCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>
      <Checkbox.Group
        options={options}
        value={value}
        onChange={onChange as any}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '12px',
          width: '100%'
        }}
      />
    </Card>
  );
}
