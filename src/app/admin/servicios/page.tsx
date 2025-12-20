"use client";

import { useState, useEffect } from "react";
import { Typography, Card, Button, Table, Tag, Modal, Form, Input, Select, InputNumber, App, Space } from "antd";
import { SettingOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { Service } from "@/types/appointments";

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

export default function ServiciosPage() {
  const { message, modal } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/services');
      const data = await response.json();
      setServices(data.services || []);
    } catch (error) {
      console.error("Error loading services:", error);
      message.error("Error al cargar servicios");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingService(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    form.setFieldsValue({
      key: service.key,
      title: service.title,
      category: service.category,
      duration_minutes: service.duration_minutes,
      description: service.description,
      active: service.active,
    });
    setModalVisible(true);
  };

  const handleDelete = (service: Service) => {
    modal.confirm({
      title: "Desactivar Servicio",
      content: `¿Estás seguro de desactivar "${service.title}"? No se eliminará, solo se ocultará.`,
      okText: "Desactivar",
      okType: "danger",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          const response = await fetch(`/api/services?id=${service.id}`, {
            method: 'DELETE',
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error || 'Error al desactivar');
          }

          message.success('Servicio desactivado exitosamente');
          fetchServices();
        } catch (error: any) {
          message.error(error.message || 'Error al desactivar servicio');
        }
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const url = '/api/services';
      const method = editingService ? 'PUT' : 'POST';
      const body = editingService
        ? { id: editingService.id, ...values }
        : values;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al guardar');
      }

      message.success(result.message);
      setModalVisible(false);
      fetchServices();
    } catch (error: any) {
      if (error.errorFields) {
        return; // Errores de validación
      }
      message.error(error.message || 'Error al guardar servicio');
    }
  };

  const columns: ColumnsType<Service> = [
    {
      title: 'Servicio',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <div className="font-semibold text-[#367c84]">{text}</div>
          <div className="text-xs text-gray-500">{record.key}</div>
        </div>
      ),
    },
    {
      title: 'Categoría',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => (
        <Tag color={category === 'Psicológica' ? 'blue' : 'green'}>
          {category}
        </Tag>
      ),
      filters: [
        { text: 'Psicológica', value: 'Psicológica' },
        { text: 'Médica', value: 'Médica' },
      ],
      onFilter: (value, record) => record.category === value,
    },
    {
      title: 'Duración',
      dataIndex: 'duration_minutes',
      key: 'duration_minutes',
      render: (minutes: number) => `${minutes} min`,
      width: 120,
    },
    {
      title: 'Estado',
      dataIndex: 'active',
      key: 'active',
      render: (active: boolean) => (
        <Tag color={active ? 'success' : 'default'}>
          {active ? 'Activo' : 'Inactivo'}
        </Tag>
      ),
      filters: [
        { text: 'Activo', value: true },
        { text: 'Inactivo', value: false },
      ],
      onFilter: (value, record) => record.active === value,
      width: 100,
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          />
          {record.active && (
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
              size="small"
            />
          )}
        </Space>
      ),
      width: 120,
    },
  ];

  return (
    <div>
      <div className="mb-6 flex justify-between items-start">
        <div>
          <Title level={2} className="!text-[#367c84] !mb-2">
            <SettingOutlined className="mr-2" />
            Gestión de Servicios
          </Title>
          <Paragraph className="text-gray-600">
            Administra el catálogo de servicios disponibles
          </Paragraph>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
          size="large"
          style={{ backgroundColor: '#55c5c4', borderColor: '#55c5c4' }}
        >
          Nuevo Servicio
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={services}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Modal de Crear/Editar */}
      <Modal
        title={editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="Guardar"
        cancelText="Cancelar"
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ active: true, duration_minutes: 60 }}
        >
          <Form.Item
            name="title"
            label="Nombre del Servicio"
            rules={[{ required: true, message: 'Campo requerido' }]}
          >
            <Input placeholder="Ej: Terapia Familiar" />
          </Form.Item>

          <Form.Item
            name="key"
            label="Identificador (URL-friendly)"
            rules={[{ required: true, message: 'Campo requerido' }]}
            help="Sin espacios, solo letras minúsculas y guiones"
          >
            <Input
              placeholder="Ej: terapia-familiar"
              disabled={!!editingService}
            />
          </Form.Item>

          <Form.Item
            name="category"
            label="Categoría"
            rules={[{ required: true, message: 'Campo requerido' }]}
          >
            <Select>
              <Select.Option value="Psicológica">Psicológica</Select.Option>
              <Select.Option value="Médica">Médica</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="duration_minutes"
            label="Duración (minutos)"
            rules={[{ required: true, message: 'Campo requerido' }]}
          >
            <InputNumber min={15} max={240} step={15} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="description"
            label="Descripción"
          >
            <TextArea rows={4} placeholder="Describe el servicio..." />
          </Form.Item>

          {editingService && (
            <Form.Item
              name="active"
              label="Estado"
              rules={[{ required: true }]}
            >
              <Select>
                <Select.Option value={true}>Activo</Select.Option>
                <Select.Option value={false}>Inactivo</Select.Option>
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}
