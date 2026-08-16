"use client";

import { useCallback, useEffect, useState } from "react";
import {
  App,
  Button,
  Card,
  Col,
  Descriptions,
  Flex,
  Form,
  Input,
  Result,
  Row,
  Tag,
  Typography,
  theme,
} from "antd";
import { LockOutlined, SaveOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/es";

dayjs.locale("es");

const { Title, Paragraph, Text } = Typography;

const LARGO_MINIMO = 8;

interface Perfil {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  specialty: string | null;
  role: string;
  status: string;
  created_at: string;
}

interface DatosForm {
  full_name: string;
  phone?: string;
  specialty?: string;
}

interface PasswordForm {
  actual: string;
  nueva: string;
  confirmar: string;
}

async function pedir<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Ocurrió un error");
  return json as T;
}

export default function PerfilPage() {
  const { token } = theme.useToken();
  const { message } = App.useApp();

  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [cambiando, setCambiando] = useState(false);

  const [formDatos] = Form.useForm<DatosForm>();
  const [formPassword] = Form.useForm<PasswordForm>();

  useEffect(() => {
    let vivo = true;
    pedir<{ perfil: Perfil }>("/api/admin/perfil")
      .then(({ perfil: p }) => {
        if (!vivo) return;
        setPerfil(p);
        formDatos.setFieldsValue({
          full_name: p.full_name,
          phone: p.phone ?? undefined,
          specialty: p.specialty ?? undefined,
        });
      })
      .catch((e: unknown) => {
        if (vivo) setError(e instanceof Error ? e.message : "Error al cargar");
      })
      .finally(() => {
        if (vivo) setCargando(false);
      });
    return () => {
      vivo = false;
    };
  }, [formDatos]);

  const guardarDatos = useCallback(
    async (valores: DatosForm) => {
      setGuardando(true);
      try {
        const { perfil: p } = await pedir<{ perfil: Perfil }>("/api/admin/perfil", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(valores),
        });
        setPerfil(p);

        // El encabezado del panel lee estos datos de localStorage; sin esto
        // seguiría mostrando el nombre viejo hasta el próximo inicio de sesión.
        const guardado = localStorage.getItem("doctor");
        if (guardado) {
          localStorage.setItem(
            "doctor",
            JSON.stringify({ ...JSON.parse(guardado), ...valores }),
          );
        }

        message.success("Perfil actualizado");
      } catch (e) {
        message.error(e instanceof Error ? e.message : "No se pudo guardar");
      } finally {
        setGuardando(false);
      }
    },
    [message],
  );

  const cambiarPassword = useCallback(
    async ({ actual, nueva }: PasswordForm) => {
      setCambiando(true);
      try {
        await pedir("/api/admin/perfil/password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ actual, nueva }),
        });
        formPassword.resetFields();
        message.success("Contraseña actualizada");
      } catch (e) {
        message.error(e instanceof Error ? e.message : "No se pudo cambiar");
      } finally {
        setCambiando(false);
      }
    },
    [formPassword, message],
  );

  if (error) {
    return (
      <Result
        status="warning"
        title="No se pudo cargar tu perfil"
        subTitle={error}
        extra={
          <Button type="primary" onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        }
      />
    );
  }

  return (
    <Flex vertical gap={token.marginLG}>
      <div>
        <Title level={2} style={{ marginTop: 0, marginBottom: token.marginXXS }}>
          Mi perfil
        </Title>
        <Paragraph type="secondary" style={{ marginBottom: 0 }}>
          Tus datos dentro de la clínica y el acceso a tu cuenta.
        </Paragraph>
      </div>

      <Card loading={cargando} title="Cuenta">
        {perfil && (
          <Descriptions
            bordered
            size="small"
            column={{ xs: 1, sm: 1, md: 2 }}
            items={[
              { key: "c", label: "Correo de acceso", children: perfil.email },
              {
                key: "r",
                label: "Rol",
                children: (
                  <Tag color={perfil.role === "admin" ? "gold" : "blue"}>
                    {perfil.role === "admin" ? "Administración" : "Doctor"}
                  </Tag>
                ),
              },
              {
                key: "e",
                label: "Estado",
                children: (
                  <Tag color={perfil.status === "active" ? "success" : "default"}>
                    {perfil.status === "active" ? "Activa" : "Inactiva"}
                  </Tag>
                ),
              },
              {
                key: "d",
                label: "Miembro desde",
                children: dayjs(perfil.created_at).format("D [de] MMMM [de] YYYY"),
              },
            ]}
          />
        )}
        <Paragraph type="secondary" style={{ marginTop: token.margin, marginBottom: 0 }}>
          El correo es tu usuario y la dirección a la que llegan las invitaciones de las
          consultas en línea. Para cambiarlo, pídelo a administración.
        </Paragraph>
      </Card>

      <Row gutter={[token.margin, token.margin]}>
        <Col xs={24} lg={12}>
          <Card loading={cargando} title="Tus datos" style={{ height: "100%" }}>
            <Form form={formDatos} layout="vertical" onFinish={guardarDatos} disabled={guardando}>
              <Form.Item
                name="full_name"
                label="Nombre completo"
                rules={[
                  { required: true, message: "Escribe tu nombre" },
                  { min: 3, message: "Demasiado corto" },
                  { max: 120, message: "Demasiado largo" },
                ]}
              >
                <Input placeholder="Dra. Nombre Apellido" />
              </Form.Item>

              <Form.Item
                name="specialty"
                label="Especialidad"
                rules={[{ max: 80, message: "Demasiado largo" }]}
              >
                <Input placeholder="Psicología, Medicina General…" />
              </Form.Item>

              <Form.Item
                name="phone"
                label="Teléfono"
                rules={[{ max: 30, message: "Demasiado largo" }]}
              >
                <Input placeholder="866 000 0000" />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={guardando}>
                  Guardar cambios
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card loading={cargando} title="Cambiar contraseña" style={{ height: "100%" }}>
            <Form
              form={formPassword}
              layout="vertical"
              onFinish={cambiarPassword}
              disabled={cambiando}
            >
              <Form.Item
                name="actual"
                label="Contraseña actual"
                rules={[{ required: true, message: "Escribe tu contraseña actual" }]}
              >
                <Input.Password prefix={<LockOutlined />} autoComplete="current-password" />
              </Form.Item>

              <Form.Item
                name="nueva"
                label="Nueva contraseña"
                rules={[
                  { required: true, message: "Escribe la nueva contraseña" },
                  { min: LARGO_MINIMO, message: `Mínimo ${LARGO_MINIMO} caracteres` },
                ]}
              >
                <Input.Password prefix={<LockOutlined />} autoComplete="new-password" />
              </Form.Item>

              <Form.Item
                name="confirmar"
                label="Repite la nueva contraseña"
                dependencies={["nueva"]}
                rules={[
                  { required: true, message: "Repite la contraseña" },
                  // Se compara aquí y no en el servidor: es un error de dedo,
                  // no una regla de seguridad, y avisar de inmediato es mejor.
                  ({ getFieldValue }) => ({
                    validator: (_, valor) =>
                      !valor || getFieldValue("nueva") === valor
                        ? Promise.resolve()
                        : Promise.reject(new Error("Las contraseñas no coinciden")),
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined />} autoComplete="new-password" />
              </Form.Item>

              <Form.Item style={{ marginBottom: token.marginXS }}>
                <Button type="primary" htmlType="submit" loading={cambiando}>
                  Cambiar contraseña
                </Button>
              </Form.Item>
            </Form>

            <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
              Si tienes la sesión abierta en otro dispositivo, seguirá activa hasta que
              venza. Ciérrala desde ahí si quieres sacarla de inmediato.
            </Text>
          </Card>
        </Col>
      </Row>
    </Flex>
  );
}
