'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Spin,
  Button,
  Descriptions,
  Tag,
  Space,
  Alert,
  Divider,
  Empty,
  Collapse,
} from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { colors } from '@/theme';
import { useRouter, useParams } from 'next/navigation';
import type { PatronesRespuestas } from '@/types/patrones';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

interface EvaluacionDetalle {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  edad: number | null;
  sexo: string | null;
  completado: boolean;
  paso_actual: number;
  created_at: string;
  fecha_completado: string | null;
  respuestas: PatronesRespuestas;
}

export default function EvaluacionDetalleAdminPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [evaluacion, setEvaluacion] = useState<EvaluacionDetalle | null>(null);

  useEffect(() => {
    const loadEvaluacion = async () => {
      try {
        const response = await fetch(`/api/patrones/admin/${params.id}`, {
          credentials: 'include',
        });
        const data = await response.json();

        if (data.success) {
          setEvaluacion(data.evaluacion);
        }
      } catch (error) {
        console.error('Error al cargar evaluación:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) loadEvaluacion();
  }, [params.id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!evaluacion) {
    return (
      <Card>
        <Empty description="Evaluación no encontrada" />
      </Card>
    );
  }

  const { respuestas } = evaluacion;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.back()}
          style={{ marginBottom: 16 }}
        >
          Volver
        </Button>
        <Title level={2} style={{ margin: 0, color: colors.text.primary }}>
          Detalle de Evaluación
        </Title>
        <Text style={{ color: colors.text.secondary }}>
          Información completa de la evaluación de patrones alimentarios
        </Text>
      </div>

      {/* Estado */}
      {evaluacion.completado ? (
        <Alert
          message="Evaluación Completada"
          description={`Finalizada el ${new Date(evaluacion.fecha_completado!).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}`}
          type="success"
          showIcon
          icon={<CheckCircleOutlined />}
          style={{ marginBottom: 24 }}
        />
      ) : (
        <Alert
          message="Evaluación Incompleta"
          description={`Progreso: ${evaluacion.paso_actual}/13 pasos completados`}
          type="warning"
          showIcon
          icon={<ClockCircleOutlined />}
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Datos del cliente */}
      <Card title="Información del Cliente" style={{ marginBottom: 24 }}>
        <Descriptions column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label="Nombre" labelStyle={{ color: colors.text.secondary }}>
            <Space>
              <UserOutlined style={{ color: colors.brand.primary }} />
              <Text strong style={{ color: colors.text.primary }}>
                {evaluacion.nombre}
              </Text>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Email" labelStyle={{ color: colors.text.secondary }}>
            <Space>
              <MailOutlined style={{ color: colors.brand.primary }} />
              <Text style={{ color: colors.text.primary }}>{evaluacion.email}</Text>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Teléfono" labelStyle={{ color: colors.text.secondary }}>
            <Space>
              <PhoneOutlined style={{ color: colors.brand.primary }} />
              <Text style={{ color: colors.text.primary }}>
                {evaluacion.telefono || '-'}
              </Text>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Edad" labelStyle={{ color: colors.text.secondary }}>
            <Text style={{ color: colors.text.primary }}>{evaluacion.edad || '-'} años</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Sexo" labelStyle={{ color: colors.text.secondary }}>
            <Text style={{ color: colors.text.primary }}>{evaluacion.sexo || '-'}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Fecha de inicio" labelStyle={{ color: colors.text.secondary }}>
            <Space>
              <CalendarOutlined style={{ color: colors.brand.primary }} />
              <Text style={{ color: colors.text.primary }}>
                {new Date(evaluacion.created_at).toLocaleDateString('es-MX')}
              </Text>
            </Space>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Respuestas */}
      <Card title="Respuestas del Cuestionario">
        <Collapse accordion>
          {/* Grupo 1 */}
          <Panel header="GRUPO 1: Proteína Animal con Más Contenido Graso" key="1">
            {renderGrupo1(respuestas.grupo1_proteinas_grasas)}
          </Panel>

          {/* Grupo 2 */}
          <Panel header="GRUPO 2: Proteína Animal Magra" key="2">
            {renderGrupo2(respuestas.grupo2_proteinas_magras)}
          </Panel>

          {/* Grupo 3 */}
          <Panel header="GRUPO 3: Fuentes de Grasa Saludable" key="3">
            {renderGrupo3(respuestas.grupo3_grasas_saludables)}
          </Panel>

          {/* Grupo 4 */}
          <Panel header="GRUPO 4: Carbohidratos Complejos y Cereales" key="4">
            {renderGrupo4(respuestas.grupo4_carbohidratos)}
          </Panel>

          {/* Grupo 5 */}
          <Panel header="GRUPO 5: Vegetales" key="5">
            {renderArray(respuestas.grupo5_vegetales, '🥬')}
          </Panel>

          {/* Grupo 6 */}
          <Panel header="GRUPO 6: Frutas" key="6">
            {renderArray(respuestas.grupo6_frutas, '🍎')}
          </Panel>

          {/* Aceites */}
          <Panel header="Aceites y Grasas para Cocinar" key="7">
            {renderArray(respuestas.aceites_coccion, '🫒')}
          </Panel>

          {/* Bebidas */}
          <Panel header="Bebidas Sin Calorías o Bajas en Calorías" key="8">
            {renderArray(respuestas.bebidas_sin_calorias, '💧')}
          </Panel>

          {/* Métodos cocción */}
          <Panel header="Métodos de Cocción Disponibles" key="9">
            {renderMetodosCoccion(respuestas.metodos_coccion)}
          </Panel>

          {/* Alergias */}
          <Panel header="Alergias e Intolerancias Alimentarias" key="10">
            {renderAlergias(respuestas.alergias_intolerancias)}
          </Panel>

          {/* Antojos */}
          <Panel header="Antojos y Alimentos de Preferencia" key="11">
            {renderAntojos(respuestas.antojos)}
          </Panel>

          {/* Frecuencia */}
          <Panel header="Frecuencia de Comidas al Día" key="12">
            <Text style={{ color: colors.text.primary }}>
              <strong>Patrón seleccionado:</strong> {respuestas.frecuencia_comidas || '-'}
            </Text>
            {respuestas.otra_frecuencia && (
              <>
                <Divider />
                <Text style={{ color: colors.text.secondary }}>
                  <strong>Detalles adicionales:</strong> {respuestas.otra_frecuencia}
                </Text>
              </>
            )}
          </Panel>

          {/* Menús */}
          <Panel header="Opciones Rápidas para Menús" key="13">
            <Text style={{ color: colors.text.primary }}>
              <strong>Preferencia:</strong> {respuestas.sugerencias_menus || '-'}
            </Text>
            {respuestas.opcion_rapida_menu && (
              <>
                <Divider />
                <Text style={{ color: colors.text.secondary }}>
                  <strong>Preferencias adicionales:</strong>
                  <br />
                  {respuestas.opcion_rapida_menu}
                </Text>
              </>
            )}
          </Panel>
        </Collapse>
      </Card>
    </div>
  );
}

// ============================================================================
// FUNCIONES HELPER PARA RENDERIZAR RESPUESTAS
// ============================================================================

function renderGrupo1(grupo: any) {
  if (!grupo) return <Text>Sin datos</Text>;
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      {renderSubgrupo('🥚 Huevos y Embutidos', grupo.huevos_embutidos)}
      {renderSubgrupo('🥩 Carnes de Res Grasas', grupo.carnes_res_grasas)}
      {renderSubgrupo('🐷 Carnes de Cerdo Grasas', grupo.carnes_cerdo_grasas)}
      {renderSubgrupo('🍗 Carnes de Pollo/Pavo Grasas', grupo.carnes_pollo_grasas)}
      {renderSubgrupo('🫀 Órganos Grasos', grupo.organos_grasos)}
      {renderSubgrupo('🧀 Quesos Grasos', grupo.quesos_grasos)}
      {renderSubgrupo('🥛 Lácteos Enteros', grupo.lacteos_enteros)}
      {renderSubgrupo('🐟 Pescados Grasos', grupo.pescados_grasos)}
      {renderSubgrupo('🦞 Mariscos Grasos', grupo.mariscos_grasos)}
    </Space>
  );
}

function renderGrupo2(grupo: any) {
  if (!grupo) return <Text>Sin datos</Text>;
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      {renderSubgrupo('🥩 Carnes de Res Magras', grupo.carnes_res_magras)}
      {renderSubgrupo('🐷 Carnes de Cerdo Magras', grupo.carnes_cerdo_magras)}
      {renderSubgrupo('🍗 Carnes de Pollo/Pavo Magras', grupo.carnes_pollo_magras)}
      {renderSubgrupo('🫀 Órganos Magros', grupo.organos_magros)}
      {renderSubgrupo('🐟 Pescados Magros', grupo.pescados_magros)}
      {renderSubgrupo('🦐 Mariscos Magros', grupo.mariscos_magros)}
      {renderSubgrupo('🧀 Quesos Magros', grupo.quesos_magros)}
      {renderSubgrupo('🥛 Lácteos Light', grupo.lacteos_light)}
      {renderSubgrupo('🥚 Huevos y Embutidos Light', grupo.huevos_embutidos_light)}
    </Space>
  );
}

function renderGrupo3(grupo: any) {
  if (!grupo) return <Text>Sin datos</Text>;
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      {renderSubgrupo('🥑 Grasas Naturales', grupo.grasas_naturales)}
      {renderSubgrupo('🥜 Frutos Secos y Semillas', grupo.frutos_secos_semillas)}
      {renderSubgrupo('🧈 Mantequillas Vegetales', grupo.mantequillas_vegetales)}
    </Space>
  );
}

function renderGrupo4(grupo: any) {
  if (!grupo) return <Text>Sin datos</Text>;
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      {renderSubgrupo('🌾 Cereales Integrales', grupo.cereales_integrales)}
      {renderSubgrupo('🍝 Pastas', grupo.pastas)}
      {renderSubgrupo('🥖 Tortillas y Panes', grupo.tortillas_panes)}
      {renderSubgrupo('🥔 Raíces y Tubérculos', grupo.raices_tuberculos)}
      {renderSubgrupo('🫘 Leguminosas', grupo.leguminosas)}
    </Space>
  );
}

function renderSubgrupo(titulo: string, items: string[] | undefined) {
  if (!items || items.length === 0) {
    return (
      <div>
        <Text strong style={{ color: colors.text.primary }}>
          {titulo}
        </Text>
        <br />
        <Text style={{ color: colors.text.muted }}>Ninguno seleccionado</Text>
      </div>
    );
  }

  return (
    <div>
      <Text strong style={{ color: colors.text.primary }}>
        {titulo}
      </Text>
      <br />
      <Space wrap size="small" style={{ marginTop: 8 }}>
        {items.map((item) => (
          <Tag key={item} color="blue">
            {item}
          </Tag>
        ))}
      </Space>
    </div>
  );
}

function renderArray(items: string[] | undefined, emoji: string) {
  if (!items || items.length === 0) {
    return <Text style={{ color: colors.text.muted }}>Ninguno seleccionado</Text>;
  }

  return (
    <Space wrap size="small">
      {items.map((item) => (
        <Tag key={item} color="green">
          {emoji} {item}
        </Tag>
      ))}
    </Space>
  );
}

function renderMetodosCoccion(metodos: any) {
  if (!metodos) return <Text>Sin datos</Text>;
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <div>
        <Text strong style={{ color: colors.text.primary }}>
          Métodos accesibles:
        </Text>
        <br />
        <Space wrap size="small" style={{ marginTop: 8 }}>
          {metodos.accesibles?.map((metodo: string) => (
            <Tag key={metodo} color="purple">
              {metodo}
            </Tag>
          )) || <Text style={{ color: colors.text.muted }}>Ninguno</Text>}
        </Space>
      </div>
      {metodos.otro && (
        <div>
          <Text strong style={{ color: colors.text.primary }}>
            Otro método:
          </Text>
          <br />
          <Text style={{ color: colors.text.secondary }}>{metodos.otro}</Text>
        </div>
      )}
    </Space>
  );
}

function renderAlergias(alergias: any) {
  if (!alergias) return <Text>Sin datos</Text>;
  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <Text strong style={{ color: colors.text.primary }}>
          🚫 Alergias Alimentarias:
        </Text>
        <br />
        <Space wrap size="small" style={{ marginTop: 8 }}>
          {alergias.alergias?.map((alergia: string) => (
            <Tag key={alergia} color="red">
              {alergia}
            </Tag>
          )) || <Text style={{ color: colors.text.muted }}>Ninguna</Text>}
        </Space>
        {alergias.otra_alergia && (
          <div style={{ marginTop: 8 }}>
            <Text style={{ color: colors.text.secondary }}>
              <strong>Otra:</strong> {alergias.otra_alergia}
            </Text>
          </div>
        )}
      </div>

      <div>
        <Text strong style={{ color: colors.text.primary }}>
          ⚠️ Intolerancias Digestivas:
        </Text>
        <br />
        <Space wrap size="small" style={{ marginTop: 8 }}>
          {alergias.intolerancias?.map((intolerancia: string) => (
            <Tag key={intolerancia} color="orange">
              {intolerancia}
            </Tag>
          )) || <Text style={{ color: colors.text.muted }}>Ninguna</Text>}
        </Space>
        {alergias.otra_intolerancia && (
          <div style={{ marginTop: 8 }}>
            <Text style={{ color: colors.text.secondary }}>
              <strong>Otra:</strong> {alergias.otra_intolerancia}
            </Text>
          </div>
        )}
      </div>
    </Space>
  );
}

function renderAntojos(antojos: any) {
  if (!antojos) return <Text>Sin datos</Text>;
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      {renderSubgrupo('🍫 Antojos Dulces', antojos.dulces)}
      {renderSubgrupo('🧂 Antojos Salados', antojos.salados)}
      {renderSubgrupo('🍔 Comida Rápida', antojos.comida_rapida)}
      {renderSubgrupo('🥤 Bebidas con Calorías', antojos.bebidas)}
      {renderSubgrupo('🌶️ Antojos Picantes', antojos.picantes)}
      {antojos.otros && (
        <div>
          <Text strong style={{ color: colors.text.primary }}>
            Otros antojos:
          </Text>
          <br />
          <Text style={{ color: colors.text.secondary }}>{antojos.otros}</Text>
        </div>
      )}
    </Space>
  );
}
