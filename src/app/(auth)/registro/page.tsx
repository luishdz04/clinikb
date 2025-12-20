"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Form, Input, DatePicker, Select, Checkbox, Button, Steps, Typography, Card, App } from "antd";
import { UserOutlined, PhoneOutlined, MedicineBoxOutlined, CheckOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import type { PatientFormData } from "@/types/patient";
import { PhoneInput } from "@/components/ui/PhoneInput";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;

export default function RegisterPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<PatientFormData>>({});

  const steps = [
    { title: "Datos Personales", icon: <UserOutlined /> },
    { title: "Contacto", icon: <PhoneOutlined /> },
    { title: "Tipo de Atención", icon: <MedicineBoxOutlined /> },
  ];

  const handleNext = async () => {
    try {
      const values = await form.validateFields();
      setFormData({ ...formData, ...values });
      
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit({ ...formData, ...values });
      }
    } catch (error) {
      console.error("Validation error:", error);
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (data: Partial<PatientFormData>) => {
    setIsSubmitting(true);

    try {
      // Convertir fecha a formato YYYY-MM-DD
      const submitData = {
        ...data,
        date_of_birth: data.date_of_birth
          ? dayjs(data.date_of_birth).format("YYYY-MM-DD")
          : "",
      };

      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error en el registro");
      }

      // Redirigir a página de éxito sin mostrar mensaje
      router.push("/registro/exito");
    } catch (error: any) {
      message.error(error.message || "Error al registrar");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#55c5c4]/10 via-white to-[#dfc79c]/10 py-12">
      <div className="mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link href="/">
            <Image
              src="/images/logo/clinikb.png"
              alt="CliniKB"
              width={80}
              height={80}
              className="mx-auto mb-4"
            />
          </Link>
          <Title level={2} className="!mb-2">Registro de Paciente</Title>
          <Text className="text-gray-600">
            Completa tu registro para acceder a nuestros servicios
          </Text>
        </div>

        <Card className="shadow-lg">
          <Steps current={currentStep} items={steps} className="mb-8" />

          <Form
            form={form}
            layout="vertical"
            initialValues={formData}
            onFinish={handleNext}
          >
            {/* Step 0: Datos Personales */}
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
                >
                  <Input size="large" placeholder="tu@email.com" />
                </Form.Item>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                <Form.Item
                  label="Teléfono / WhatsApp"
                  name="phone"
                  rules={[{ required: true, message: "Ingresa tu teléfono" }]}
                >
                  <PhoneInput placeholder="866 123 4567" />
                </Form.Item>

                <Form.Item
                  label="Fecha de Nacimiento"
                  name="date_of_birth"
                  rules={[{ required: true, message: "Selecciona tu fecha de nacimiento" }]}
                >
                  <DatePicker
                    size="large"
                    className="w-full"
                    placeholder="DD/MM/AAAA"
                    format="DD/MM/YYYY"
                  />
                </Form.Item>

                <Form.Item label="Género" name="gender">
                  <Select size="large" placeholder="Selecciona">
                    <Option value="Masculino">Masculino</Option>
                    <Option value="Femenino">Femenino</Option>
                    <Option value="Otro">Otro</Option>
                    <Option value="Prefiero no decir">Prefiero no decir</Option>
                  </Select>
                </Form.Item>
              </>
            )}

            {/* Step 1: Contacto */}
            {currentStep === 1 && (
              <>
                <Form.Item label="Dirección" name="address">
                  <Input size="large" placeholder="Calle y número" />
                </Form.Item>

                <div className="grid grid-cols-2 gap-4">
                  <Form.Item label="Ciudad" name="city">
                    <Input size="large" placeholder="Ciudad" />
                  </Form.Item>

                  <Form.Item label="Estado" name="state">
                    <Input size="large" placeholder="Estado" />
                  </Form.Item>
                </div>

                <Form.Item label="Código Postal" name="postal_code">
                  <Input size="large" placeholder="26000" />
                </Form.Item>

                <Title level={5} className="!mt-6 !mb-4">
                  Contacto de Emergencia
                </Title>

                <Form.Item label="Nombre" name="emergency_contact_name">
                  <Input size="large" placeholder="Nombre del contacto" />
                </Form.Item>

                <Form.Item label="Teléfono" name="emergency_contact_phone">
                  <PhoneInput placeholder="866 123 4567" />
                </Form.Item>

                <Form.Item label="¿Cómo nos conociste?" name="referral_source">
                  <Select size="large" placeholder="Selecciona">
                    <Option value="Google">Google</Option>
                    <Option value="Facebook">Facebook</Option>
                    <Option value="Instagram">Instagram</Option>
                    <Option value="Recomendación">Recomendación</Option>
                    <Option value="Otro">Otro</Option>
                  </Select>
                </Form.Item>
              </>
            )}

            {/* Step 2: Tipo de Atención */}
            {currentStep === 2 && (
              <>
                <Form.Item
                  label="Tipo de Atención Requerida"
                  name="attention_type"
                  rules={[{ required: true, message: "Selecciona el tipo de atención" }]}
                >
                  <Select size="large" placeholder="Selecciona el servicio">
                    <Option value="Psicológica">
                      <div>
                        <strong>Atención Psicológica</strong>
                        <br />
                        <Text type="secondary" className="text-sm">
                          Dra. Cynthia Kristell de Luna Hernández
                        </Text>
                      </div>
                    </Option>
                    <Option value="Médica">
                      <div>
                        <strong>Atención Médica Familiar</strong>
                        <br />
                        <Text type="secondary" className="text-sm">
                          Dr. Baldo Daniel Martínez González
                        </Text>
                      </div>
                    </Option>
                  </Select>
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
                  <Checkbox>
                    Acepto los{" "}
                    <Link href="/terminos" className="text-[#55c5c4]">
                      Términos y Condiciones
                    </Link>{" "}
                    y la{" "}
                    <Link href="/privacidad" className="text-[#55c5c4]">
                      Política de Privacidad
                    </Link>
                  </Checkbox>
                </Form.Item>
              </>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between">
              {currentStep > 0 && (
                <Button size="large" onClick={handlePrev}>
                  Anterior
                </Button>
              )}
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                loading={isSubmitting}
                icon={currentStep === steps.length - 1 ? <CheckOutlined /> : null}
                className="ml-auto"
              >
                {currentStep === steps.length - 1 ? "Registrarse" : "Siguiente"}
              </Button>
            </div>
          </Form>
        </Card>

        <div className="mt-6 text-center">
          <Text className="text-gray-600">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-[#55c5c4] font-semibold">
              Inicia Sesión
            </Link>
          </Text>
        </div>
      </div>
    </div>
  );
}
