// ============================================================================
// COMPONENTES DE PASOS 4-13 PARA EVALUACIÓN DE PATRONES
// ============================================================================

'use client';

import { Typography, Space, Checkbox, Radio, Input, Select, Divider } from 'antd';
import { colors } from '@/theme';
import type { PatronesRespuestas } from '@/types/patrones';
import * as FormData from '@/lib/patrones/formData';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

// ============================================================================
// PASO 4: CARBOHIDRATOS
// ============================================================================

export function Paso4({
  respuestas,
  setRespuestas,
}: {
  respuestas: PatronesRespuestas;
  setRespuestas: (r: PatronesRespuestas) => void;
}) {
  const updateGroup4 = (key: string, values: string[]) => {
    setRespuestas({
      ...respuestas,
      grupo4_carbohidratos: {
        ...respuestas.grupo4_carbohidratos!,
        [key]: values,
      },
    });
  };

  return (
    <div>
      <Title level={3} style={{ color: colors.brand.primary }}>
        GRUPO 4: Carbohidratos Complejos y Cereales
      </Title>
      <Paragraph style={{ color: colors.text.secondary }}>
        Selecciona <strong>todos</strong> los alimentos que consumes regularmente (mínimo 3 en total).
      </Paragraph>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <CheckboxGroup
          title="🌾 Cereales Integrales"
          options={FormData.CEREALES_INTEGRALES}
          value={respuestas.grupo4_carbohidratos?.cereales_integrales || []}
          onChange={(v) => updateGroup4('cereales_integrales', v)}
        />

        <CheckboxGroup
          title="🍝 Pastas"
          options={FormData.PASTAS}
          value={respuestas.grupo4_carbohidratos?.pastas || []}
          onChange={(v) => updateGroup4('pastas', v)}
        />

        <CheckboxGroup
          title="🥖 Tortillas y Panes"
          options={FormData.TORTILLAS_PANES}
          value={respuestas.grupo4_carbohidratos?.tortillas_panes || []}
          onChange={(v) => updateGroup4('tortillas_panes', v)}
        />

        <CheckboxGroup
          title="🥔 Raíces y Tubérculos"
          options={FormData.RAICES_TUBERCULOS}
          value={respuestas.grupo4_carbohidratos?.raices_tuberculos || []}
          onChange={(v) => updateGroup4('raices_tuberculos', v)}
        />

        <CheckboxGroup
          title="🫘 Leguminosas"
          options={FormData.LEGUMINOSAS}
          value={respuestas.grupo4_carbohidratos?.leguminosas || []}
          onChange={(v) => updateGroup4('leguminosas', v)}
        />
      </Space>
    </div>
  );
}

// ============================================================================
// PASO 5: VEGETALES
// ============================================================================

export function Paso5({
  respuestas,
  setRespuestas,
}: {
  respuestas: PatronesRespuestas;
  setRespuestas: (r: PatronesRespuestas) => void;
}) {
  return (
    <div>
      <Title level={3} style={{ color: colors.brand.primary }}>
        GRUPO 5: Vegetales
      </Title>
      <Paragraph style={{ color: colors.text.secondary }}>
        Selecciona <strong>todos</strong> los vegetales que consumes regularmente (mínimo 5).
      </Paragraph>

      <Checkbox.Group
        options={FormData.VEGETALES}
        value={respuestas.grupo5_vegetales}
        onChange={(values) =>
          setRespuestas({ ...respuestas, grupo5_vegetales: values as string[] })
        }
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '8px',
        }}
      />
    </div>
  );
}

// ============================================================================
// PASO 6: FRUTAS
// ============================================================================

export function Paso6({
  respuestas,
  setRespuestas,
}: {
  respuestas: PatronesRespuestas;
  setRespuestas: (r: PatronesRespuestas) => void;
}) {
  return (
    <div>
      <Title level={3} style={{ color: colors.brand.primary }}>
        GRUPO 6: Frutas
      </Title>
      <Paragraph style={{ color: colors.text.secondary }}>
        Selecciona <strong>todas</strong> las frutas que consumes regularmente (mínimo 3).
      </Paragraph>

      <Checkbox.Group
        options={FormData.FRUTAS}
        value={respuestas.grupo6_frutas}
        onChange={(values) =>
          setRespuestas({ ...respuestas, grupo6_frutas: values as string[] })
        }
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '8px',
        }}
      />
    </div>
  );
}

// ============================================================================
// PASO 7: ACEITES DE COCCIÓN
// ============================================================================

export function Paso7({
  respuestas,
  setRespuestas,
}: {
  respuestas: PatronesRespuestas;
  setRespuestas: (r: PatronesRespuestas) => void;
}) {
  return (
    <div>
      <Title level={3} style={{ color: colors.brand.primary }}>
        Aceites y Grasas para Cocinar
      </Title>
      <Paragraph style={{ color: colors.text.secondary }}>
        Selecciona <strong>todos</strong> los aceites o grasas que usas para cocinar (mínimo 1).
      </Paragraph>

      <Checkbox.Group
        options={FormData.ACEITES_COCCION}
        value={respuestas.aceites_coccion}
        onChange={(values) =>
          setRespuestas({ ...respuestas, aceites_coccion: values as string[] })
        }
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '8px',
        }}
      />
    </div>
  );
}

// ============================================================================
// PASO 8: BEBIDAS SIN CALORÍAS
// ============================================================================

export function Paso8({
  respuestas,
  setRespuestas,
}: {
  respuestas: PatronesRespuestas;
  setRespuestas: (r: PatronesRespuestas) => void;
}) {
  return (
    <div>
      <Title level={3} style={{ color: colors.brand.primary }}>
        Bebidas Sin Calorías o Bajas en Calorías
      </Title>
      <Paragraph style={{ color: colors.text.secondary }}>
        Selecciona <strong>todas</strong> las bebidas que consumes regularmente (mínimo 1).
      </Paragraph>

      <Checkbox.Group
        options={FormData.BEBIDAS_SIN_CALORIAS}
        value={respuestas.bebidas_sin_calorias}
        onChange={(values) =>
          setRespuestas({ ...respuestas, bebidas_sin_calorias: values as string[] })
        }
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '8px',
        }}
      />
    </div>
  );
}

// ============================================================================
// PASO 9: MÉTODOS DE COCCIÓN
// ============================================================================

export function Paso9({
  respuestas,
  setRespuestas,
}: {
  respuestas: PatronesRespuestas;
  setRespuestas: (r: PatronesRespuestas) => void;
}) {
  return (
    <div>
      <Title level={3} style={{ color: colors.brand.primary }}>
        Métodos de Cocción Disponibles
      </Title>
      <Paragraph style={{ color: colors.text.secondary }}>
        Selecciona <strong>todos</strong> los métodos de cocción que tienes accesibles en casa (mínimo 1).
      </Paragraph>

      <Checkbox.Group
        options={FormData.METODOS_COCCION}
        value={respuestas.metodos_coccion?.accesibles || []}
        onChange={(values) =>
          setRespuestas({
            ...respuestas,
            metodos_coccion: {
              ...respuestas.metodos_coccion!,
              accesibles: values as string[],
            },
          })
        }
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '8px',
        }}
      />

      <Divider />

      <div>
        <Title level={5} style={{ color: colors.text.primary }}>
          ¿Algún otro método de cocción?
        </Title>
        <TextArea
          placeholder="Especifica si usas algún otro método..."
          value={respuestas.metodos_coccion?.otro || ''}
          onChange={(e) =>
            setRespuestas({
              ...respuestas,
              metodos_coccion: {
                ...respuestas.metodos_coccion!,
                otro: e.target.value,
              },
            })
          }
          rows={2}
        />
      </div>
    </div>
  );
}

// ============================================================================
// PASO 10: ALERGIAS E INTOLERANCIAS
// ============================================================================

export function Paso10({
  respuestas,
  setRespuestas,
}: {
  respuestas: PatronesRespuestas;
  setRespuestas: (r: PatronesRespuestas) => void;
}) {
  return (
    <div>
      <Title level={3} style={{ color: colors.brand.primary }}>
        Alergias e Intolerancias Alimentarias
      </Title>
      <Paragraph style={{ color: colors.text.secondary }}>
        Selecciona <strong>todas</strong> las alergias e intolerancias que tengas (o "Ninguna").
      </Paragraph>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={5} style={{ color: colors.text.primary }}>
            🚫 Alergias Alimentarias
          </Title>
          <Checkbox.Group
            options={FormData.ALERGIAS_ALIMENTARIAS}
            value={respuestas.alergias_intolerancias?.alergias || []}
            onChange={(values) =>
              setRespuestas({
                ...respuestas,
                alergias_intolerancias: {
                  ...respuestas.alergias_intolerancias!,
                  alergias: values as string[],
                },
              })
            }
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '8px',
            }}
          />
          <Input
            placeholder="Otra alergia (especificar)..."
            value={respuestas.alergias_intolerancias?.otra_alergia || ''}
            onChange={(e) =>
              setRespuestas({
                ...respuestas,
                alergias_intolerancias: {
                  ...respuestas.alergias_intolerancias!,
                  otra_alergia: e.target.value,
                },
              })
            }
            style={{ marginTop: 12 }}
          />
        </div>

        <Divider />

        <div>
          <Title level={5} style={{ color: colors.text.primary }}>
            ⚠️ Intolerancias Digestivas
          </Title>
          <Checkbox.Group
            options={FormData.INTOLERANCIAS_DIGESTIVAS}
            value={respuestas.alergias_intolerancias?.intolerancias || []}
            onChange={(values) =>
              setRespuestas({
                ...respuestas,
                alergias_intolerancias: {
                  ...respuestas.alergias_intolerancias!,
                  intolerancias: values as string[],
                },
              })
            }
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '8px',
            }}
          />
          <Input
            placeholder="Otra intolerancia (especificar)..."
            value={respuestas.alergias_intolerancias?.otra_intolerancia || ''}
            onChange={(e) =>
              setRespuestas({
                ...respuestas,
                alergias_intolerancias: {
                  ...respuestas.alergias_intolerancias!,
                  otra_intolerancia: e.target.value,
                },
              })
            }
            style={{ marginTop: 12 }}
          />
        </div>
      </Space>
    </div>
  );
}

// ============================================================================
// PASO 11: ANTOJOS
// ============================================================================

export function Paso11({
  respuestas,
  setRespuestas,
}: {
  respuestas: PatronesRespuestas;
  setRespuestas: (r: PatronesRespuestas) => void;
}) {
  return (
    <div>
      <Title level={3} style={{ color: colors.brand.primary }}>
        Antojos y Alimentos de Preferencia
      </Title>
      <Paragraph style={{ color: colors.text.secondary }}>
        Selecciona <strong>todos</strong> los antojos que tengas regularmente (mínimo 1 o "Ninguno").
      </Paragraph>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <CheckboxGroup
          title="🍫 Antojos Dulces"
          options={FormData.ANTOJOS_DULCES}
          value={respuestas.antojos?.dulces || []}
          onChange={(v) =>
            setRespuestas({
              ...respuestas,
              antojos: { ...respuestas.antojos!, dulces: v },
            })
          }
        />

        <CheckboxGroup
          title="🧂 Antojos Salados"
          options={FormData.ANTOJOS_SALADOS}
          value={respuestas.antojos?.salados || []}
          onChange={(v) =>
            setRespuestas({
              ...respuestas,
              antojos: { ...respuestas.antojos!, salados: v },
            })
          }
        />

        <CheckboxGroup
          title="🍔 Comida Rápida"
          options={FormData.ANTOJOS_COMIDA_RAPIDA}
          value={respuestas.antojos?.comida_rapida || []}
          onChange={(v) =>
            setRespuestas({
              ...respuestas,
              antojos: { ...respuestas.antojos!, comida_rapida: v },
            })
          }
        />

        <CheckboxGroup
          title="🥤 Bebidas con Calorías"
          options={FormData.ANTOJOS_BEBIDAS}
          value={respuestas.antojos?.bebidas || []}
          onChange={(v) =>
            setRespuestas({
              ...respuestas,
              antojos: { ...respuestas.antojos!, bebidas: v },
            })
          }
        />

        <CheckboxGroup
          title="🌶️ Antojos Picantes"
          options={FormData.ANTOJOS_PICANTES}
          value={respuestas.antojos?.picantes || []}
          onChange={(v) =>
            setRespuestas({
              ...respuestas,
              antojos: { ...respuestas.antojos!, picantes: v },
            })
          }
        />

        <Divider />

        <div>
          <Title level={5} style={{ color: colors.text.primary }}>
            ¿Algún otro antojo?
          </Title>
          <TextArea
            placeholder="Especifica otros antojos o alimentos que te gustaría incluir..."
            value={respuestas.antojos?.otros || ''}
            onChange={(e) =>
              setRespuestas({
                ...respuestas,
                antojos: { ...respuestas.antojos!, otros: e.target.value },
              })
            }
            rows={2}
          />
        </div>
      </Space>
    </div>
  );
}

// ============================================================================
// PASO 12: FRECUENCIA DE COMIDAS
// ============================================================================

export function Paso12({
  respuestas,
  setRespuestas,
}: {
  respuestas: PatronesRespuestas;
  setRespuestas: (r: PatronesRespuestas) => void;
}) {
  return (
    <div>
      <Title level={3} style={{ color: colors.brand.primary }}>
        Frecuencia de Comidas al Día
      </Title>
      <Paragraph style={{ color: colors.text.secondary }}>
        Selecciona <strong>una opción</strong> que describa tu patrón de comidas diario.
      </Paragraph>

      <Radio.Group
        value={respuestas.frecuencia_comidas}
        onChange={(e) =>
          setRespuestas({
            ...respuestas,
            frecuencia_comidas: e.target.value,
          })
        }
        style={{ width: '100%' }}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {FormData.FRECUENCIA_COMIDAS.map((opcion) => (
            <Radio key={opcion} value={opcion} style={{ color: colors.text.primary }}>
              {opcion}
            </Radio>
          ))}
        </Space>
      </Radio.Group>

      {respuestas.frecuencia_comidas === 'Otro (especificar)' && (
        <div style={{ marginTop: 24 }}>
          <Title level={5} style={{ color: colors.text.primary }}>
            Especifica tu frecuencia de comidas:
          </Title>
          <TextArea
            placeholder="Describe tu patrón de comidas diario..."
            value={respuestas.otra_frecuencia}
            onChange={(e) =>
              setRespuestas({
                ...respuestas,
                otra_frecuencia: e.target.value,
              })
            }
            rows={3}
          />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// PASO 13: SUGERENCIAS DE MENÚS
// ============================================================================

export function Paso13({
  respuestas,
  setRespuestas,
}: {
  respuestas: PatronesRespuestas;
  setRespuestas: (r: PatronesRespuestas) => void;
}) {
  return (
    <div>
      <Title level={3} style={{ color: colors.brand.primary }}>
        Opciones Rápidas para tus Menús
      </Title>
      <Paragraph style={{ color: colors.text.secondary }}>
        Selecciona <strong>una opción</strong> que mejor describa cómo quieres que armemos tus menús.
      </Paragraph>

      <Select
        size="large"
        style={{ width: '100%', marginTop: 16 }}
        placeholder="Selecciona una opción..."
        value={respuestas.sugerencias_menus || undefined}
        onChange={(value) =>
          setRespuestas({
            ...respuestas,
            sugerencias_menus: value,
          })
        }
        options={FormData.OPCIONES_RAPIDAS_MENU.map((opcion) => ({
          label: opcion,
          value: opcion,
          disabled: opcion === 'Seleccionar...',
        }))}
      />

      <Divider />

      <div>
        <Title level={5} style={{ color: colors.text.primary }}>
          ¿Alguna preferencia adicional para tus menús?
        </Title>
        <Paragraph style={{ color: colors.text.secondary }}>
          Comparte cualquier detalle adicional que quieras que consideremos al armar tus menús (horarios,
          preferencias de preparación, objetivos específicos, etc.)
        </Paragraph>
        <TextArea
          placeholder="Ejemplo: Prefiero desayunos rápidos porque salgo temprano al trabajo..."
          value={respuestas.opcion_rapida_menu}
          onChange={(e) =>
            setRespuestas({
              ...respuestas,
              opcion_rapida_menu: e.target.value,
            })
          }
          rows={4}
        />
      </div>
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
  return (
    <div>
      <Title level={5} style={{ color: colors.text.primary, marginBottom: 12 }}>
        {title}
      </Title>
      <Checkbox.Group
        options={options}
        value={value}
        onChange={onChange as any}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '8px',
        }}
      />
    </div>
  );
}
