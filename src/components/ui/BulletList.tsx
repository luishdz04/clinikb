"use client";

import { Typography } from "antd";

const { Text } = Typography;

interface BulletListProps {
  items: readonly string[];
  /** Margen inferior del bloque. Por defecto pegado, para cerrar tarjetas. */
  marginBottom?: number | string;
}

/**
 * Lista con viñetas.
 *
 * El componente List quedó deprecado en antd v6; la vía oficial para texto
 * corrido es un <ul> envuelto en <Typography>, que lo estiliza nativamente
 * (mismo patrón que el demo `Typography/basic`).
 */
export default function BulletList({ items, marginBottom = 0 }: BulletListProps) {
  return (
    <Typography>
      <ul style={{ marginBottom }}>
        {items.map((item) => (
          <li key={item}>
            <Text type="secondary">{item}</Text>
          </li>
        ))}
      </ul>
    </Typography>
  );
}
