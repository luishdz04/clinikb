export type ServiceItem = {
  key: string;
  title: string;
  description: string;
  bullets?: string[];
};

export const psychologicalServices: ServiceItem[] = [
  {
    key: "terapia-individual",
    title: "Terapia individual",
    description:
      "Espacio 100% confidencial, libre de etiquetas y prejuicios, sin moverte de casa (requiere dispositivo y conexión a internet). Duración de 45 a 60 minutos.",
  },
  {
    key: "terapia-pareja",
    title: "Terapia de pareja",
    description:
      "Guía para resolver conflictos, atravesar crisis y recuperar una convivencia saludable.",
    bullets: [
      "Aceptación del otro",
      "Roles",
      "Problemas de comunicación",
      "Sexualidad",
      "Infidelidad",
      "Celos",
    ],
  },
  {
    key: "acompanamiento-crianza",
    title: "Acompañamiento en crianza",
    description:
      "Consulta para trabajar desafíos relacionados al cuidado y bienestar de tus hijos.",
    bullets: [
      "Comunicación efectiva",
      "Límites: cómo ponerlos y mantenerlos",
      "Aceptación a cambios",
      "Problemas de conducta",
      "Roles familiares",
      "Crianza monoparental",
    ],
  },
];

export const medicalServices: ServiceItem[] = [
  {
    key: "consulta-rutina",
    title: "Consulta médica de rutina",
    description: "Valoración integral y preventiva para toda la familia.",
  },
  {
    key: "seguimiento-cronicos",
    title: "Seguimiento de crónicos",
    description:
      "Control y acompañamiento para pacientes diabéticos e hipertensos.",
  },
];
