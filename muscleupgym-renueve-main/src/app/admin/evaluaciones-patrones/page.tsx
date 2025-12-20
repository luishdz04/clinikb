'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Typography,
  App,
  Tooltip,
  Badge,
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  FilterOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { colors } from '@/theme';
import { useRouter } from 'next/navigation';
import type { ColumnType } from 'antd/es/table';

const { Title, Text } = Typography;

interface Evaluacion {
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
}

export default function EvaluacionesPatronesAdminPage() {
  const { message } = App.useApp();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  
  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroCompletado, setFiltroCompletado] = useState<string | null>(null);

  // Cargar evaluaciones
  const loadEvaluaciones = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
      });

      if (busqueda) params.append('busqueda', busqueda);
      if (filtroCompletado !== null) params.append('completado', filtroCompletado);

      const response = await fetch(`/api/patrones/admin/list?${params}`, {
        credentials: 'include',
      });
      const data = await response.json();

      if (data.success) {
        setEvaluaciones(data.evaluaciones);
        setTotal(data.total);
      } else {
        message.error(data.error || 'Error al cargar evaluaciones');
      }
    } catch (error) {
      message.error('Error al cargar evaluaciones');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvaluaciones();
  }, [page, filtroCompletado]);

  // Búsqueda con delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) {
        loadEvaluaciones();
      } else {
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [busqueda]);

  // Columnas de la tabla
  const columns: ColumnType<Evaluacion>[] = [
    {
      title: 'Estado',
      dataIndex: 'completado',
      key: 'completado',
      width: 100,
      render: (completado: boolean) =>
        completado ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Completada
          </Tag>
        ) : (
          <Tag icon={<ClockCircleOutlined />} color="warning">
            Incompleta
          </Tag>
        ),
      filters: [
        { text: 'Completadas', value: true },
        { text: 'Incompletas', value: false },
      ],
      filteredValue: filtroCompletado !== null ? [filtroCompletado === 'true'] : null,
    },
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
      render: (nombre: string) => (
        <Text strong style={{ color: colors.text.primary }}>
          {nombre}
        </Text>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email: string) => (
        <Text style={{ color: colors.text.secondary }}>{email}</Text>
      ),
    },
    {
      title: 'Teléfono',
      dataIndex: 'telefono',
      key: 'telefono',
      width: 130,
      render: (telefono: string | null) => (
        <Text style={{ color: colors.text.secondary }}>{telefono || '-'}</Text>
      ),
    },
    {
      title: 'Edad',
      dataIndex: 'edad',
      key: 'edad',
      width: 80,
      align: 'center',
      render: (edad: number | null) => (
        <Text style={{ color: colors.text.secondary }}>{edad || '-'}</Text>
      ),
    },
    {
      title: 'Progreso',
      dataIndex: 'paso_actual',
      key: 'paso_actual',
      width: 100,
      align: 'center',
      render: (paso: number, record: Evaluacion) =>
        record.completado ? (
          <Badge count="13/13" style={{ backgroundColor: colors.brand.primary }} />
        ) : (
          <Badge
            count={`${paso}/13`}
            style={{ backgroundColor: colors.state.warning }}
          />
        ),
    },
    {
      title: 'Fecha',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 110,
      render: (fecha: string) => (
        <Text style={{ color: colors.text.secondary }}>
          {new Date(fecha).toLocaleDateString('es-MX', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })}
        </Text>
      ),
    },
    {
      title: 'Completada',
      dataIndex: 'fecha_completado',
      key: 'fecha_completado',
      width: 110,
      render: (fecha: string | null) =>
        fecha ? (
          <Text style={{ color: colors.text.secondary }}>
            {new Date(fecha).toLocaleDateString('es-MX', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}
          </Text>
        ) : (
          <Text style={{ color: colors.text.muted }}>-</Text>
        ),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 100,
      align: 'center',
      render: (_: any, record: Evaluacion) => (
        <Tooltip title="Ver detalles">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => router.push(`/admin/evaluaciones-patrones/${record.id}`)}
            size="small"
          />
        </Tooltip>
      ),
    },
  ];

  // Estadísticas rápidas
  const completadas = evaluaciones.filter((e) => e.completado).length;
  const incompletas = evaluaciones.filter((e) => !e.completado).length;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, color: colors.text.primary }}>
          Evaluaciones de Patrones Alimentarios
        </Title>
        <Text style={{ color: colors.text.secondary }}>
          Administra y revisa las evaluaciones de los clientes
        </Text>
      </div>

      {/* Estadísticas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <Title level={3} style={{ color: colors.brand.primary, margin: 0 }}>
              {total}
            </Title>
            <Text style={{ color: colors.text.secondary }}>Total</Text>
          </div>
        </Card>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <Title level={3} style={{ color: colors.state.success, margin: 0 }}>
              {completadas}
            </Title>
            <Text style={{ color: colors.text.secondary }}>Completadas</Text>
          </div>
        </Card>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <Title level={3} style={{ color: colors.state.warning, margin: 0 }}>
              {incompletas}
            </Title>
            <Text style={{ color: colors.text.secondary }}>Incompletas</Text>
          </div>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card style={{ marginBottom: 24 }}>
        <Space size="middle" wrap style={{ width: '100%' }}>
          <Input
            placeholder="Buscar por nombre o email..."
            prefix={<SearchOutlined />}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />

          <Select
            placeholder="Filtrar por estado"
            style={{ width: 180 }}
            value={filtroCompletado}
            onChange={setFiltroCompletado}
            allowClear
            options={[
              { label: 'Completadas', value: 'true' },
              { label: 'Incompletas', value: 'false' },
            ]}
          />

          <Button icon={<ReloadOutlined />} onClick={loadEvaluaciones}>
            Actualizar
          </Button>
        </Space>
      </Card>

      {/* Tabla */}
      <Card>
        <Table
          columns={columns}
          dataSource={evaluaciones}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: false,
            showTotal: (total) => `Total: ${total} evaluaciones`,
            onChange: setPage,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
}
