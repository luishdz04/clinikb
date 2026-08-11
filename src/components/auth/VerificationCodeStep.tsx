"use client";

import { useEffect, useState } from "react";
import { Alert, Button, Flex, Input, Typography, theme } from "antd";
import { MailOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

/** Supabase limita el reenvío a 1 por minuto (Auth > Rate Limits). */
const SEGUNDOS_ENTRE_REENVIOS = 60;

/**
 * Cuántos dígitos trae el código.
 *
 * Tiene que coincidir con Supabase Dashboard -> Authentication -> Providers ->
 * Email -> Email OTP Length. Si no coinciden, la caja no deja escribir el
 * código completo y la verificación se vuelve imposible.
 */
const LARGO_DEL_CODIGO = 8;

interface VerificationCodeStepProps {
  email: string;
  /** Mensaje inicial, p. ej. cuando se detectó un registro sin confirmar. */
  aviso?: string;
  onVerified: () => void;
}

/**
 * Captura del código que Auth envió por correo.
 *
 * El código no se valida aquí: se manda a /api/auth/verify-code, que llama a
 * `verifyOtp` de Supabase. Este componente solo maneja la interacción.
 */
export function VerificationCodeStep({ email, aviso, onVerified }: VerificationCodeStepProps) {
  const { token } = theme.useToken();
  const [codigo, setCodigo] = useState("");
  const [verificando, setVerificando] = useState(false);
  const [reenviando, setReenviando] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState(aviso ?? "");
  const [esperaReenvio, setEsperaReenvio] = useState(SEGUNDOS_ENTRE_REENVIOS);

  // Cuenta regresiva del botón de reenviar.
  useEffect(() => {
    if (esperaReenvio <= 0) return;
    const t = setTimeout(() => setEsperaReenvio((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [esperaReenvio]);

  const verificar = async (valor: string) => {
    setVerificando(true);
    setError("");
    setInfo("");

    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token: valor }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "No se pudo verificar el código");
        setCodigo("");
        return;
      }

      onVerified();
    } catch {
      setError("No se pudo conectar. Intenta de nuevo.");
    } finally {
      setVerificando(false);
    }
  };

  const reenviar = async () => {
    setReenviando(true);
    setError("");
    setInfo("");

    try {
      const res = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "No se pudo reenviar el código");
        // Aunque falle por rate limit, se reinicia la espera para que no
        // siga insistiendo contra el límite.
        setEsperaReenvio(SEGUNDOS_ENTRE_REENVIOS);
        return;
      }

      setInfo(data.message || "Te enviamos un código nuevo.");
      setEsperaReenvio(SEGUNDOS_ENTRE_REENVIOS);
    } catch {
      setError("No se pudo conectar. Intenta de nuevo.");
    } finally {
      setReenviando(false);
    }
  };

  return (
    <Flex vertical align="center" gap={token.margin}>
      <MailOutlined style={{ fontSize: 48, color: token.colorPrimary }} />

      <Flex vertical align="center" gap={token.marginXXS}>
        <Title level={4} style={{ margin: 0 }}>
          Confirma tu correo
        </Title>
        <Text type="secondary" style={{ textAlign: "center" }}>
          Enviamos un código de {LARGO_DEL_CODIGO} dígitos a <Text strong>{email}</Text>
        </Text>
      </Flex>

      {info && <Alert title={info} type="info" showIcon style={{ width: "100%" }} />}
      {error && <Alert title={error} type="error" showIcon style={{ width: "100%" }} />}

      <Input.OTP
        length={LARGO_DEL_CODIGO}
        value={codigo}
        onChange={(valor) => {
          setCodigo(valor);
          // Se envía solo al completar el código: evita un botón de más.
          if (valor.length === LARGO_DEL_CODIGO) verificar(valor);
        }}
        disabled={verificando}
        size="large"
        autoFocus
      />

      <Button
        type="primary"
        size="large"
        block
        loading={verificando}
        disabled={codigo.length !== LARGO_DEL_CODIGO}
        onClick={() => verificar(codigo)}
      >
        Verificar y completar registro
      </Button>

      <Flex vertical align="center" gap={token.marginXXS}>
        <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
          ¿No te llegó? Revisa tu carpeta de spam.
        </Text>
        <Button
          type="link"
          onClick={reenviar}
          loading={reenviando}
          disabled={esperaReenvio > 0}
        >
          {esperaReenvio > 0 ? `Reenviar código en ${esperaReenvio}s` : "Reenviar código"}
        </Button>
      </Flex>
    </Flex>
  );
}
