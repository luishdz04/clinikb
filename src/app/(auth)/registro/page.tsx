"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  Checkbox,
  Radio,
  Button,
  Steps,
  Typography,
  Card,
  App,
  Flex,
  Row,
  Col,
  Divider,
  Empty,
  theme,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MedicineBoxOutlined,
  CheckOutlined,
  TeamOutlined,
  HeartOutlined,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { calcularEdad, type PatientFormData } from "@/types/patient";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { VerificationCodeStep } from "@/components/auth/VerificationCodeStep";
import { colors } from "@/theme/themeConfig";
import dayjs from "dayjs";

const { Title, Text } = Typography;

/** Valor que despliega el campo libre "¿cuál?" en los selects que lo admiten. */
const OTRO = "Otro";

const OPCIONES_GENERO = [
  "Masculino",
  "Femenino",
  "No binario",
  OTRO,
  "Prefiero no decir",
].map((v) => ({ value: v, label: v }));

const OPCIONES_RELIGION = [
  "Católica",
  "Cristiana / Evangélica",
  "Testigo de Jehová",
  "Adventista",
  "Mormona",
  "Judía",
  "Musulmana",
  "Budista",
  "Ninguna",
  OTRO,
  "Prefiero no decir",
].map((v) => ({ value: v, label: v }));

const OPCIONES_ESTADO_CIVIL = [
  "Soltero(a)",
  "Casado(a)",
  "Unión libre",
  "Separado(a)",
  "Divorciado(a)",
  "Viudo(a)",
].map((v) => ({ value: v, label: v }));

const OPCIONES_ESTUDIOS = [
  "Sin estudios",
  "Primaria",
  "Secundaria",
  "Bachillerato",
  "Carrera técnica",
  "Licenciatura",
  "Maestría",
  "Doctorado",
].map((v) => ({ value: v, label: v }));

const OPCIONES_PARENTESCO = [
  "Madre",
  "Padre",
  "Hermano(a)",
  "Hijo(a)",
  "Esposo(a) / Pareja",
  "Abuelo(a)",
  "Tío(a)",
  "Primo(a)",
  "Otro",
].map((v) => ({ value: v, label: v }));

const OPCIONES_REFERENCIA = ["Google", "Facebook", "Instagram", "Recomendación", "Otro"].map(
  (v) => ({ value: v, label: v }),
);

export default function RegisterPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const { token } = theme.useToken();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<PatientFormData>>({});

  // Cuando esto tiene valor, el formulario se reemplaza por la captura del
  // código. Pasa al terminar el alta, y también si el correo ya existía sin
  // confirmar: en ese caso no se rehace el registro, solo se verifica.
  const [verificando, setVerificando] = useState<{ email: string; aviso?: string } | null>(null);

  // Consulta del correo al salir del campo.
  const [revisandoCorreo, setRevisandoCorreo] = useState(false);
  /** Último correo ya consultado, para no repetir la petición en cada blur. */
  const correoRevisado = useRef("");

  // La edad se muestra derivada de la fecha de nacimiento: no se captura ni se
  // guarda, así nunca queda desactualizada respecto a la fecha real.
  const fechaNacimiento = Form.useWatch("date_of_birth", form);
  const edad = calcularEdad(fechaNacimiento ? dayjs(fechaNacimiento).format("YYYY-MM-DD") : undefined);

  // Cuando se elige "Otro" se pide el detalle en un campo aparte.
  const genero = Form.useWatch("gender", form);
  const religion = Form.useWatch("religion", form);

  // Declaración obligatoria del paso de familia.
  const estructuraFamiliar = Form.useWatch("family_structure_status", form);

  const steps = [
    { title: "Datos Personales", icon: <UserOutlined /> },
    { title: "Contacto", icon: <PhoneOutlined /> },
    { title: "Familia", icon: <TeamOutlined /> },
    { title: "Salud y Objetivos", icon: <HeartOutlined /> },
    { title: "Tipo de Atención", icon: <MedicineBoxOutlined /> },
  ];

  const handleNext = async () => {
    try {
      const values = await form.validateFields();
      setFormData({ ...formData, ...values });

      // Red de seguridad: normalmente esto ya se resolvió en el onBlur del
      // campo, pero si alguien llega aquí sin haberlo disparado (autocompletar,
      // Enter directo), se revisa antes de dejarlo avanzar.
      if (currentStep === 0 && values.email) {
        if (await atenderCorreoConocido(values.email.trim())) return;
      }

      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit({ ...formData, ...values });
      }
    } catch (error) {
      console.error("Validation error:", error);
    }
  };

  /** Devuelve 'libre' | 'pendiente' | 'registrado'. Ante fallo, deja pasar. */
  const revisarCorreo = async (email: string): Promise<string> => {
    try {
      const res = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      return data.estado ?? "libre";
    } catch {
      return "libre";
    }
  };

  /**
   * Reacciona a un correo ya conocido. Devuelve true si se hizo cargo de la
   * situación (y por tanto no hay que dejar avanzar el formulario).
   */
  const atenderCorreoConocido = async (email: string): Promise<boolean> => {
    const estado = await revisarCorreo(email);

    if (estado === "registrado") {
      form.setFields([
        { name: "email", errors: ["Este correo ya está registrado. Inicia sesión."] },
      ]);
      return true;
    }

    if (estado === "pendiente") {
      setVerificando({
        email,
        aviso: "Ya tenías un registro sin confirmar. Te enviamos un código nuevo.",
      });
      // Se pide un código nuevo aparte: el alta no se rehace.
      fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }).catch(() => {});
      return true;
    }

    return false;
  };

  /**
   * Revisión al salir del campo de correo, para no hacer llenar el formulario
   * entero antes de avisar. Se recuerda el último correo consultado para no
   * repetir la petición cada vez que el campo pierde el foco.
   */
  const handleEmailBlur = async (valor: string) => {
    const email = valor.trim();
    if (!email || email === correoRevisado.current) return;
    // Sin un correo con forma válida no tiene sentido consultar.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;

    correoRevisado.current = email;
    setRevisandoCorreo(true);
    try {
      await atenderCorreoConocido(email);
    } finally {
      setRevisandoCorreo(false);
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (data: Partial<PatientFormData>) => {
    setIsSubmitting(true);

    try {
      // Si eligió "Otro", se guarda lo que escribió, no la palabra "Otro":
      // en la ficha clínica interesa el dato real, no la categoría del select.
      // Los campos auxiliares `*_other` no se envían.
      const { gender_other, religion_other, ...resto } = data;
      const resolverOtro = (valor?: string, detalle?: string) =>
        valor === OTRO ? detalle?.trim() || undefined : valor;

      const submitData = {
        ...resto,
        gender: resolverOtro(data.gender, gender_other),
        religion: resolverOtro(data.religion, religion_other),
        date_of_birth: data.date_of_birth
          ? dayjs(data.date_of_birth).format("YYYY-MM-DD")
          : "",
        // Sólo se mandan integrantes si declaró que iba a registrarlos: si
        // cambió de opción después de capturar algunos, Form.List conserva los
        // valores y se colarían sin querer.
        family_members:
          data.family_structure_status === "registrada"
            ? (data.family_members ?? []).filter(
                (m) => m?.full_name?.trim() && m?.relationship?.trim(),
              )
            : [],
        // El motivo sólo aplica cuando no registró integrantes.
        family_structure_reason:
          data.family_structure_status === "registrada"
            ? undefined
            : data.family_structure_reason,
      };

      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      // El correo ya existía sin confirmar: no es un error, es que le falta
      // terminar. Se le manda un código nuevo y se salta a la verificación.
      if (result.pendingVerification) {
        setVerificando({
          email: result.email ?? data.email ?? "",
          aviso:
            result.message ??
            result.error ??
            "Ya tenías un registro sin confirmar. Te enviamos un código nuevo.",
        });
        return;
      }

      if (!response.ok) {
        throw new Error(result.error || "Error en el registro");
      }

      setVerificando({ email: result.email ?? data.email ?? "" });
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Error al registrar");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Flex
      justify="center"
      style={{
        minHeight: "100vh",
        padding: `${token.sizeXXL}px ${token.padding}px`,
        backgroundImage: `linear-gradient(to bottom right, ${colors.primary}1a, ${colors.white} 50%, ${colors.gold}1a)`,
      }}
    >
      <div style={{ width: "100%", maxWidth: 860 }}>
        <Flex vertical align="center" style={{ marginBottom: token.marginXL }}>
          <Link href="/" aria-label="Ir al inicio">
            <Image
              src="/images/logo/clinikb.png"
              alt="CliniKB"
              width={80}
              height={80}
              priority
              style={{ borderRadius: "50%" }}
            />
          </Link>
          <Title level={2} style={{ marginTop: token.margin, marginBottom: token.marginXXS }}>
            Registro de Paciente
          </Title>
          <Text type="secondary">Completa tu registro para acceder a nuestros servicios</Text>
        </Flex>

        {verificando ? (
          <Card style={{ boxShadow: token.boxShadowSecondary }}>
            <VerificationCodeStep
              email={verificando.email}
              aviso={verificando.aviso}
              onVerified={() => router.push("/registro/exito")}
            />
          </Card>
        ) : (
        <Card style={{ boxShadow: token.boxShadowSecondary }}>
          <Steps
            current={currentStep}
            items={steps}
            responsive
            size="small"
            style={{ marginBottom: token.marginXL }}
          />

          <Form form={form} layout="vertical" initialValues={formData} onFinish={handleNext}>
            {/* Paso 0: Datos Personales */}
            {currentStep === 0 && (
              <>
                <Form.Item
                  label="Nombre Completo"
                  name="full_name"
                  rules={[{ required: true, message: "Ingresa tu nombre completo" }]}
                >
                  <Input size="large" placeholder="Juan Pérez García" />
                </Form.Item>

                <Form.Item
                  label="Correo Electrónico"
                  name="email"
                  rules={[
                    { required: true, message: "Ingresa tu correo" },
                    { type: "email", message: "Correo inválido" },
                  ]}
                  hasFeedback={revisandoCorreo}
                  validateStatus={revisandoCorreo ? "validating" : undefined}
                  help={revisandoCorreo ? "Revisando el correo..." : undefined}
                >
                  <Input
                    size="large"
                    placeholder="tu@email.com"
                    autoComplete="email"
                    onBlur={(e) => handleEmailBlur(e.target.value)}
                  />
                </Form.Item>

                <Row gutter={token.margin}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Contraseña"
                      name="password"
                      rules={[
                        { required: true, message: "Ingresa una contraseña" },
                        { min: 6, message: "Mínimo 6 caracteres" },
                      ]}
                    >
                      <Input.Password size="large" placeholder="Al menos 6 caracteres" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Confirmar Contraseña"
                      name="confirmPassword"
                      dependencies={["password"]}
                      rules={[
                        { required: true, message: "Confirma tu contraseña" },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue("password") === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error("Las contraseñas no coinciden"));
                          },
                        }),
                      ]}
                    >
                      <Input.Password size="large" placeholder="Repite tu contraseña" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label="Teléfono / WhatsApp"
                  name="phone"
                  rules={[{ required: true, message: "Ingresa tu teléfono" }]}
                >
                  <PhoneInput placeholder="866 123 4567" />
                </Form.Item>

                <Row gutter={token.margin}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Fecha de Nacimiento"
                      name="date_of_birth"
                      rules={[{ required: true, message: "Selecciona tu fecha de nacimiento" }]}
                    >
                      <DatePicker
                        size="large"
                        style={{ width: "100%" }}
                        placeholder="DD/MM/AAAA"
                        format="DD/MM/YYYY"
                        maxDate={dayjs()}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Edad"
                      tooltip="Se calcula sola a partir de tu fecha de nacimiento."
                    >
                      <Input
                        size="large"
                        readOnly
                        value={edad !== undefined ? `${edad} años` : ""}
                        placeholder="Se calcula automáticamente"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={token.margin}>
                  <Col xs={24} md={12}>
                    <Form.Item label="Género" name="gender">
                      <Select size="large" placeholder="Selecciona" options={OPCIONES_GENERO} />
                    </Form.Item>
                  </Col>
                  {genero === OTRO && (
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="¿Cuál?"
                        name="gender_other"
                        rules={[{ required: true, message: "Especifica tu género" }]}
                      >
                        <Input size="large" placeholder="Escríbelo con tus palabras" />
                      </Form.Item>
                    </Col>
                  )}
                  <Col xs={24} md={12}>
                    <Form.Item label="Estado Civil" name="marital_status">
                      <Select
                        size="large"
                        placeholder="Selecciona"
                        options={OPCIONES_ESTADO_CIVIL}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={token.margin}>
                  <Col xs={24} md={12}>
                    <Form.Item label="Grado de Estudios" name="education_level">
                      <Select size="large" placeholder="Selecciona" options={OPCIONES_ESTUDIOS} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label="Religión" name="religion">
                      <Select size="large" placeholder="Selecciona" options={OPCIONES_RELIGION} />
                    </Form.Item>
                  </Col>
                  {religion === OTRO && (
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="¿Cuál?"
                        name="religion_other"
                        rules={[{ required: true, message: "Especifica tu religión" }]}
                      >
                        <Input size="large" placeholder="Escribe cuál" />
                      </Form.Item>
                    </Col>
                  )}
                </Row>
              </>
            )}

            {/* Paso 1: Contacto */}
            {currentStep === 1 && (
              <>
                <Form.Item label="Dirección" name="address">
                  <Input size="large" placeholder="Calle y número" />
                </Form.Item>

                <Row gutter={token.margin}>
                  <Col xs={24} md={12}>
                    <Form.Item label="Ciudad" name="city">
                      <Input size="large" placeholder="Ciudad" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label="Estado" name="state">
                      <Input size="large" placeholder="Estado" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item label="Código Postal" name="postal_code">
                  <Input size="large" placeholder="26000" />
                </Form.Item>

                {/* v6: la posición del título es `titlePlacement`; `orientation` pasó a ser horizontal/vertical. */}
                <Divider titlePlacement="start" style={{ marginTop: token.marginLG }}>
                  Contacto de Emergencia
                </Divider>

                <Row gutter={token.margin}>
                  <Col xs={24} md={12}>
                    <Form.Item label="Nombre" name="emergency_contact_name">
                      <Input size="large" placeholder="Nombre del contacto" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label="Teléfono" name="emergency_contact_phone">
                      <PhoneInput placeholder="866 123 4567" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item label="¿Cómo nos conociste?" name="referral_source">
                  <Select size="large" placeholder="Selecciona" options={OPCIONES_REFERENCIA} />
                </Form.Item>
              </>
            )}

            {/* Paso 2: Estructura Familiar */}
            {currentStep === 2 && (
              <>
                <Form.Item
                  label="¿Deseas registrar tu estructura familiar?"
                  name="family_structure_status"
                  rules={[{ required: true, message: "Elige una opción para continuar" }]}
                >
                  <Radio.Group>
                    <Flex vertical gap={token.marginXS}>
                      <Radio value="registrada">Sí, voy a registrar a mis familiares</Radio>
                      <Radio value="sin_familiares">No tengo familiares que registrar</Radio>
                      <Radio value="no_desea_compartir">Prefiero no compartir esta información</Radio>
                    </Flex>
                  </Radio.Group>
                </Form.Item>

                {estructuraFamiliar && estructuraFamiliar !== "registrada" && (
                  <Form.Item
                    label="¿Quieres contarnos por qué? (opcional)"
                    name="family_structure_reason"
                  >
                    <Input.TextArea
                      rows={3}
                      maxLength={500}
                      showCount
                      placeholder="Cualquier detalle que quieras compartir."
                    />
                  </Form.Item>
                )}

                {estructuraFamiliar === "registrada" && (
                <Form.List
                  name="family_members"
                  rules={[
                    {
                      // Si dijo que sí, tiene que haber al menos un integrante:
                      // de otro modo quedaría marcado como "registrada" y vacío.
                      validator: async (_, integrantes) => {
                        if (!integrantes || integrantes.length === 0) {
                          return Promise.reject(
                            new Error("Agrega al menos un integrante o cambia la opción de arriba"),
                          );
                        }
                      },
                    },
                  ]}
                >
                  {(fields, { add, remove }, { errors }) => (
                    <Flex vertical gap={token.margin} style={{ marginTop: token.margin }}>
                      {fields.length === 0 && (
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description="Aún no has agregado integrantes"
                        />
                      )}

                      {fields.map(({ key, name, ...restField }, index) => (
                        <Card
                          key={key}
                          size="small"
                          title={`Integrante ${index + 1}`}
                          extra={
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => remove(name)}
                              aria-label={`Quitar integrante ${index + 1}`}
                            />
                          }
                        >
                          <Row gutter={token.margin}>
                            <Col xs={24} md={12}>
                              <Form.Item
                                {...restField}
                                label="Nombre completo"
                                name={[name, "full_name"]}
                                rules={[{ required: true, message: "Ingresa el nombre" }]}
                                style={{ marginBottom: token.marginSM }}
                              >
                                <Input placeholder="María Pérez García" />
                              </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                              <Form.Item
                                {...restField}
                                label="Parentesco"
                                name={[name, "relationship"]}
                                rules={[{ required: true, message: "Indica el parentesco" }]}
                                style={{ marginBottom: token.marginSM }}
                              >
                                <Select
                                  placeholder="Selecciona"
                                  options={OPCIONES_PARENTESCO}
                                  showSearch
                                />
                              </Form.Item>
                            </Col>
                            <Col xs={24} md={8}>
                              <Form.Item
                                {...restField}
                                label="Edad"
                                name={[name, "age"]}
                                style={{ marginBottom: 0 }}
                              >
                                <InputNumber
                                  min={0}
                                  max={130}
                                  style={{ width: "100%" }}
                                  placeholder="Años"
                                />
                              </Form.Item>
                            </Col>
                            <Col xs={24} md={16}>
                              <Form.Item
                                {...restField}
                                label="Ocupación"
                                name={[name, "occupation"]}
                                style={{ marginBottom: 0 }}
                              >
                                <Input placeholder="Docente, comerciante, estudiante..." />
                              </Form.Item>
                            </Col>
                          </Row>
                        </Card>
                      ))}

                      <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                        Agregar integrante
                      </Button>

                      <Form.ErrorList errors={errors} />
                    </Flex>
                  )}
                </Form.List>
                )}
              </>
            )}

            {/* Paso 3: Salud y Objetivos */}
            {currentStep === 3 && (
              <>
                <Form.Item
                  label="Enfermedades Recurrentes"
                  name="recurrent_illnesses"
                  tooltip="Padecimientos que se te presentan con frecuencia o de forma crónica."
                >
                  <Input.TextArea
                    rows={4}
                    maxLength={1000}
                    showCount
                    placeholder="Diabetes, hipertensión, migrañas, alergias... Si no aplica, escribe «Ninguna»."
                  />
                </Form.Item>

                <Form.Item
                  label="Objetivos que deseo lograr en consulta"
                  name="consultation_goals"
                  tooltip="Qué esperas obtener del acompañamiento."
                >
                  <Input.TextArea
                    rows={5}
                    maxLength={1500}
                    showCount
                    placeholder="Describe con tus palabras qué te gustaría trabajar o mejorar."
                  />
                </Form.Item>
              </>
            )}

            {/* Paso 4: Tipo de Atención */}
            {currentStep === 4 && (
              <>
                <Form.Item
                  label="Tipo de Atención Requerida"
                  name="attention_type"
                  rules={[{ required: true, message: "Selecciona el tipo de atención" }]}
                >
                  <Select
                    size="large"
                    placeholder="Selecciona el servicio"
                    optionLabelProp="label"
                    options={[
                      {
                        value: "Psicológica",
                        label: "Atención Psicológica",
                        desc: "Dra. Cynthia Kristell de Luna Hernández",
                      },
                      {
                        value: "Médica",
                        label: "Atención Médica Familiar",
                        desc: "Dr. Baldo Daniel Martínez González",
                      },
                    ]}
                    optionRender={({ data }) => (
                      <Flex vertical>
                        <Text strong>{data.label}</Text>
                        <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                          {data.desc}
                        </Text>
                      </Flex>
                    )}
                  />
                </Form.Item>

                <Form.Item
                  name="terms_accepted"
                  valuePropName="checked"
                  rules={[
                    {
                      validator: (_, value) =>
                        value
                          ? Promise.resolve()
                          : Promise.reject(new Error("Debes aceptar los términos")),
                    },
                  ]}
                >
                  {/*
                   * Los enlaces van sin Typography.Link a propósito: dentro del
                   * Checkbox ya hay un <label>, y anidar <a> dentro de <a>
                   * rompería la hidratación.
                   */}
                  <Checkbox>
                    Acepto los{" "}
                    <Link href="/terminos" style={{ color: token.colorLink }}>
                      Términos y Condiciones
                    </Link>{" "}
                    y la{" "}
                    <Link href="/privacidad" style={{ color: token.colorLink }}>
                      Política de Privacidad
                    </Link>
                  </Checkbox>
                </Form.Item>
              </>
            )}

            <Flex justify="space-between" style={{ marginTop: token.marginXL }}>
              {currentStep > 0 ? (
                <Button size="large" onClick={handlePrev}>
                  Anterior
                </Button>
              ) : (
                <span />
              )}
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                loading={isSubmitting}
                icon={currentStep === steps.length - 1 ? <CheckOutlined /> : null}
              >
                {currentStep === steps.length - 1 ? "Registrarse" : "Siguiente"}
              </Button>
            </Flex>
          </Form>
        </Card>
        )}

        <Flex justify="center" style={{ marginTop: token.marginLG }}>
          <Text type="secondary">
            ¿Ya tienes cuenta?{" "}
            <Link
              href="/login"
              style={{ color: token.colorLink, fontWeight: token.fontWeightStrong }}
            >
              Inicia Sesión
            </Link>
          </Text>
        </Flex>
      </div>
    </Flex>
  );
}
