'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Typography,
  App,
  Tag,
  Switch,
  Modal,
} from 'antd';
import {
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { colors } from '@/theme';
import type { ColumnType } from 'antd/es/table';

const { Title, Text } = Typography;

interface Usuario {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  whatsapp: string | null;
  patrones_autorizado: boolean;
}

export default function PatronesAutorizacionesPage() {
  const { message, modal } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [busqueda, setBusqueda] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Cargar usuarios
  const loadUsuarios = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
      });

      if (busqueda) params.append('busqueda', busqueda);

      const response = await fetch(`/api/patrones/admin/autorizaciones/list?${params}`, {
        credentials: 'include',
      });
      const data = await response.json();

      if (data.success) {
        // Procesar usuarios para agregar nombre completo
        const usuariosConNombre = data.usuarios.map((u: any) => ({
          ...u,
          nombreCompleto: `${u.first_name || ''} ${u.last_name || ''}`.trim()
        }));
        setUsuarios(usuariosConNombre);
        setTotal(data.total);
      } else {
        message.error(data.error || 'Error al cargar usuarios');
      }
    } catch (error) {
      message.error('Error al cargar usuarios');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsuarios();
  }, [page]);

  // Búsqueda con delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) {
        loadUsuarios();
      } else {
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [busqueda]);

  // Cambiar autorización
  const handleToggleAutorizacion = async (userId: string, autorizado: boolean) => {
    setUpdatingId(userId);
    try {
      const response = await fetch('/api/patrones/admin/autorizaciones/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId, autorizado }),
      });

      const data = await response.json();

      if (data.success) {
        message.success(
          autorizado
            ? 'Usuario autorizado para realizar evaluación'
            : 'Autorización removida'
        );
        loadUsuarios();
      } else {
        message.error(data.error || 'Error al actualizar autorización');
      }
    } catch (error) {
      message.error('Error al actualizar autorización');
      console.error(error);
    } finally {
      setUpdatingId(null);
    }
  };

  // Columnas de la tabla
  const columns: ColumnType<Usuario>[] = [
    {
      title: 'Estado',
      key: 'estado',
      width: 120,
      render: (_, record) => (
        <Tag
          icon={
            record.patrones_autorizado ? (
              <CheckCircleOutlined />
            ) : (
              <CloseCircleOutlined />
            )
          }
          color={record.patrones_autorizado ? 'success' : 'default'}
        >
          {record.patrones_autorizado ? 'Autorizado' : 'No autorizado'}
        </Tag>
      ),
    },
    {
      title: 'Nombre',
      key: 'nombre',
      render: (_, record: any) => (
        <Text style={{ color: colors.text.primary }}>
          {record.nombreCompleto || 'Sin nombre'}
        </Text>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text) => <Text style={{ color: colors.text.secondary }}>{text}</Text>,
    },
    {
      title: 'WhatsApp',
      dataIndex: 'whatsapp',
      key: 'whatsapp',
      render: (text) => (
        <Text style={{ color: colors.text.secondary }}>{text || '-'}</Text>
      ),
    },
    {
      title: 'Autorizar',
      key: 'autorizar',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Switch
          checked={record.patrones_autorizado}
          loading={updatingId === record.id}
          onChange={(checked) =>
            handleToggleAutorizacion(record.id, checked)
          }
          checkedChildren="Sí"
          unCheckedChildren="No"
        />
      ),
    },
  ];

  // Estadísticas
  const autorizados = usuarios.filter((u) => u.patrones_autorizado).length;

  return (
    <div>
      <Title
        level={2}
        style={{ color: colors.text.primary, marginBottom: 8 }}
      >
        Autorizaciones - Evaluación Patrones
      </Title>
      <Text style={{ color: colors.text.secondary, marginBottom: 24, display: 'block' }}>
        Gestiona qué usuarios pueden acceder al cuestionario de patrones alimentarios
      </Text>

      {/* Estadísticas */}
      <Space size="large" style={{ marginBottom: 24 }}>
        <Card
          size="small"
          style={{ background: colors.background.secondary, border: 'none' }}
        >
          <Space>
            <CheckCircleOutlined style={{ fontSize: 20, color: colors.state.success }} />
            <div>
              <Text style={{ color: colors.text.muted, fontSize: 12 }}>
                Autorizados
              </Text>
              <div style={{ fontSize: 20, fontWeight: 'bold', color: colors.state.success }}>
                {autorizados}
              </div>
            </div>
          </Space>
        </Card>

        <Card
          size="small"
          style={{ background: colors.background.secondary, border: 'none' }}
        >
          <Space>
            <CloseCircleOutlined style={{ fontSize: 20, color: colors.text.muted }} />
            <div>
              <Text style={{ color: colors.text.muted, fontSize: 12 }}>
                No autorizados
              </Text>
              <div style={{ fontSize: 20, fontWeight: 'bold', color: colors.text.primary }}>
                {usuarios.length - autorizados}
              </div>
            </div>
          </Space>
        </Card>
      </Space>

      {/* Filtros */}
      <Card
        style={{
          background: colors.background.secondary,
          border: 'none',
          marginBottom: 16,
        }}
      >
        <Space>
          <Input
            placeholder="Buscar por nombre o email..."
            prefix={<SearchOutlined />}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={loadUsuarios}
            loading={loading}
          >
            Actualizar
          </Button>
        </Space>
      </Card>

      {/* Tabla */}
      <Card
        style={{
          background: colors.background.secondary,
          border: 'none',
        }}
      >
        <Table
          columns={columns}
          dataSource={usuarios}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            onChange: setPage,
            showTotal: (total) => `Total: ${total} usuarios`,
          }}
        />
      </Card>
    </div>
  );
}
