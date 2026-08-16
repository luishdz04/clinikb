/**
 * Datos de marca para los correos.
 *
 * Los hex están duplicados de `src/theme/themeConfig.ts` a propósito: los
 * clientes de correo no soportan variables CSS ni hojas externas, así que
 * todo termina en línea. Si cambia el tema, hay que cambiarlos también aquí
 * —es el único lugar de los correos donde viven—.
 */
export const COLORES = {
  marca: "#55c5c4",
  marcaOscura: "#367c84",
  /** Para superficies con texto blanco: sobre `marca` el blanco falla WCAG AA. */
  marcaProfunda: "#2b6068",
  oro: "#dfc79c",
  oroOscuro: "#845c24",
  cafe: "#5b5035",
  tinta: "#060807",
  blanco: "#ffffff",
} as const;

/**
 * PNG con transparencia servido desde Supabase Storage.
 *
 * Va absoluto y en un bucket público porque los clientes de correo no cargan
 * imágenes relativas ni nada que exija autenticación.
 */
export const LOGO_URL =
  "https://oaixlgncslynibdlolyv.supabase.co/storage/v1/object/public/logo/clinikb.png";

export const CLINICA = {
  nombre: "CliniKB",
  direccion: "Juárez 145, San Buenaventura, Coahuila, México",
  telefono: "866 159 7283",
  correo: "administracion@clinikb.com.mx",
  sitio: "https://clinikb.com.mx",
} as const;

export const EQUIPO = [
  {
    area: "Atención Médica",
    nombre: "Dr. Baldo Daniel Martínez González",
    detalle: "Especialista en Medicina Familiar",
  },
  {
    area: "Atención Psicológica",
    nombre: "Dra. Cynthia Kristell de Luna Hernández",
    detalle: "Doctora en Psicología",
  },
] as const;

/**
 * Declara el correo como de esquema claro, y sólo claro.
 *
 * Se intentó soportar modo oscuro y se abandonó a conciencia. El balance no
 * daba: Gmail y Outlook —donde está casi todo el mundo— ignoran
 * `prefers-color-scheme` y aplican su propia inversión, así que el esfuerzo
 * sólo servía para Apple Mail. A cambio costaba una paleta paralela que había
 * que mantener sincronizada en cada plantilla nueva, y donde un olvido dejaba
 * texto claro sobre fondo claro sin que se notara en las pruebas normales.
 *
 * Declarándolo `light`, Apple Mail respeta el diseño y no lo invierte. Gmail
 * y Outlook harán lo suyo de todos modos, pero su inversión automática se
 * parece a la del resto de correos de esa bandeja, que es lo que la persona
 * espera ver.
 */
export const CSS_ESQUEMA = ":root{color-scheme:light;supported-color-schemes:light;}";

/**
 * Config de Tailwind para los correos.
 *
 * `pixelBasedPreset` es obligatorio: Tailwind usa `rem` por defecto y buena
 * parte de los clientes de correo no lo interpreta.
 */
export const configTailwind = {
  theme: {
    extend: {
      colors: {
        marca: COLORES.marca,
        "marca-oscura": COLORES.marcaOscura,
        "marca-profunda": COLORES.marcaProfunda,
        oro: COLORES.oro,
        "oro-oscuro": COLORES.oroOscuro,
        tinta: COLORES.tinta,
      },
    },
  },
};
