"use client";

import { useState, useEffect } from "react";
import { Typography, Card, Row, Col, Statistic, Table, Tag, Button, Modal, Input, Space, App } from "antd";
import { UserOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, EyeOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

interface Patient {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  attention_type: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  city?: string;
  state?: string;
}

export default function AdminDashboard() {
  const { message, modal } = App.useApp();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [detailsModal, setDetailsModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/admin/patients');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al cargar pacientes');
      }

      const data = result.patients;
      setPatients(data || []);

      // Calcular estadísticas
      const pending = data?.filter((p: Patient) => p.status === "pending").length || 0;
      const approved = data?.filter((p: Patient) => p.status === "approved").length || 0;
      const rejected = data?.filter((p: Patient) => p.status === "rejected").length || 0;

      setStats({
        pending,
        approved,
        rejected,
        total: data?.length || 0,
      });
    } catch (error) {
      console.error("Error fetching patients:", error);
      message.error("Error al cargar pacientes");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (patient: Patient) => {
    modal.confirm({
      title: "Aprobar Paciente",
      content: `¿Confirmas aprobar a ${patient.full_name}? Se enviará un email de confirmación.`,
      okText: "Aprobar",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          setActionLoading(true);
          const doctor = JSON.parse(localStorage.getItem("doctor") || "{}");

          const response = await fetch("/api/admin/approve-patient", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              patientId: patient.id,
              doctorId: doctor.id,
            }),
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error || "Error al aprobar");
          }

          message.success("Paciente aprobado exitosamente");
          fetchPatients();
        } catch (error: any) {
          message.error(error.message || "Error al aprobar paciente");
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const handleReject = (patient: Patient) => {
    setSelectedPatient(patient);
    setRejectModal(true);
    setRejectionReason("");
  };

  const confirmReject = async () => {
    if (!selectedPatient || !rejectionReason.trim()) {
      message.warning("Ingresa el motivo del rechazo");
      return;
    }

    try {
      setActionLoading(true);
      const doctor = JSON.parse(localStorage.getItem("doctor") || "{}");

      const response = await fetch("/api/admin/reject-patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: selectedPatient.id,
          doctorId: doctor.id,
          rejectionReason,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al rechazar");
      }

      message.success("Paciente rechazado");
      setRejectModal(false);
      fetchPatients();
    } catch (error: any) {
      message.error(error.message || "Error al rechazar paciente");
    } finally {
      setActionLoading(false);
    }
  };

  const columns: ColumnsType<Patient> = [
    {
      title: "Nombre",
      dataIndex: "full_name",
      key: "full_name",
      sorter: (a, b) => a.full_name.localeCompare(b.full_name),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Teléfono",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Tipo de Atención",
      dataIndex: "attention_type",
      key: "attention_type",
      render: (type: string) => (
        <Tag color={type === "Psicológica" ? "blue" : "green"}>{type}</Tag>
      ),
    },
    {
      title: "Estado",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Pendiente", value: "pending" },
        { text: "Aprobado", value: "approved" },
        { text: "Rechazado", value: "rejected" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: string) => {
        const config = {
          pending: { color: "gold", icon: <ClockCircleOutlined />, text: "Pendiente" },
          approved: { color: "success", icon: <CheckCircleOutlined />, text: "Aprobado" },
          rejected: { color: "error", icon: <CloseCircleOutlined />, text: "Rechazado" },
        };
        const { color, icon, text } = config[status as keyof typeof config];
        return <Tag color={color} icon={icon}>{text}</Tag>;
      },
    },
    {
      title: "Fecha Registro",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => new Date(date).toLocaleDateString("es-MX"),
      sorter: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedPatient(record);
              setDetailsModal(true);
            }}
          >
            Ver
          </Button>
          {record.status === "pending" && (
            <>
              <Button
                size="small"
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => handleApprove(record)}
                loading={actionLoading}
              >
                Aprobar
              </Button>
              <Button
                size="small"
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => handleReject(record)}
                loading={actionLoading}
              >
                Rechazar
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2} className="!text-[#367c84] !mb-6">
        Panel de Administración
      </Title>

      <Paragraph className="text-gray-600 !mb-8">
        Gestiona las solicitudes de pacientes y el estado de las cuentas
      </Paragraph>

      {/* Estadísticas */}
      <Row gutter={[16, 16]} className="mb-8">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Pacientes"
              value={stats.total}
              prefix={<UserOutlined />}
              styles={{ content: { color: "#367c84" } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pendientes"
              value={stats.pending}
              prefix={<ClockCircleOutlined />}
              styles={{ content: { color: "#faad14" } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Aprobados"
              value={stats.approved}
              prefix={<CheckCircleOutlined />}
              styles={{ content: { color: "#52c41a" } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Rechazados"
              value={stats.rejected}
              prefix={<CloseCircleOutlined />}
              styles={{ content: { color: "#ff4d4f" } }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabla de Pacientes */}
      <Card title="Lista de Pacientes" extra={<Button onClick={fetchPatients}>Actualizar</Button>}>
        <Table
          columns={columns}
          dataSource={patients}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Modal de Detalles */}
      <Modal
        title="Detalles del Paciente"
        open={detailsModal}
        onCancel={() => setDetailsModal(false)}
        footer={[
          <Button key="close" onClick={() => setDetailsModal(false)}>
            Cerrar
          </Button>,
        ]}
        width={600}
      >
        {selectedPatient && (
          <div className="space-y-3">
            <div>
              <Text strong>Nombre Completo:</Text>
              <br />
              <Text>{selectedPatient.full_name}</Text>
            </div>
            <div>
              <Text strong>Email:</Text>
              <br />
              <Text>{selectedPatient.email}</Text>
            </div>
            <div>
              <Text strong>Teléfono:</Text>
              <br />
              <Text>{selectedPatient.phone}</Text>
            </div>
            <div>
              <Text strong>Fecha de Nacimiento:</Text>
              <br />
              <Text>{new Date(selectedPatient.date_of_birth).toLocaleDateString("es-MX")}</Text>
            </div>
            <div>
              <Text strong>Tipo de Atención:</Text>
              <br />
              <Tag color={selectedPatient.attention_type === "Psicológica" ? "blue" : "green"}>
                {selectedPatient.attention_type}
              </Tag>
            </div>
            {selectedPatient.city && (
              <div>
                <Text strong>Ubicación:</Text>
                <br />
                <Text>{`${selectedPatient.city}, ${selectedPatient.state}`}</Text>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal de Rechazo */}
      <Modal
        title="Rechazar Paciente"
        open={rejectModal}
        onOk={confirmReject}
        onCancel={() => setRejectModal(false)}
        okText="Rechazar"
        cancelText="Cancelar"
        okButtonProps={{ danger: true, loading: actionLoading }}
      >
        <div className="space-y-4">
          <Text>
            ¿Estás seguro de rechazar a <strong>{selectedPatient?.full_name}</strong>?
          </Text>
          <div>
            <Text strong>Motivo del rechazo:</Text>
            <TextArea
              rows={4}
              placeholder="Ingresa el motivo..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="mt-2"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
