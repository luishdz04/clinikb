/**
 * Traducción al español del SDK de video de Stream.
 *
 * El SDK sólo trae inglés, así que se le pasa este mapa por
 * `translationsOverrides`. Las claves son literalmente las cadenas en inglés
 * que usa internamente: si en una versión futura cambia alguna, esa vuelve a
 * verse en inglés pero nada se rompe.
 *
 * Sólo se traduce lo que un paciente o un médico pueden llegar a ver. Las
 * cadenas de diagnóstico técnico (bitrate, jitter, códecs) se dejan como están.
 */
export const TRADUCCIONES_VIDEO = {
  // `en` es obligatorio en el tipo del SDK: es el idioma base y se deja vacío
  // para que use sus cadenas originales.
  en: {},
  es: {
    // Panel de dispositivos
    "Select a Camera": "Elige la cámara",
    "Select a Mic": "Elige el micrófono",
    "Select Speakers": "Elige la bocina",
    "Test speaker": "Probar bocina",
    "Stop test": "Detener prueba",
    Default: "Predeterminado",
    Mic: "Micrófono",
    Speakers: "Bocinas",
    Video: "Video",

    // Estados de cámara y micrófono
    "Camera on": "Cámara encendida",
    "Camera off": "Cámara apagada",
    "Microphone on": "Micrófono encendido",
    "Microphone off": "Micrófono apagado",
    "Turn off video": "Apagar la cámara",
    "Disable video": "Apagar la cámara",
    "Disable audio": "Apagar el micrófono",
    "Mute audio": "Silenciar el micrófono",
    "No camera found": "No se encontró ninguna cámara",
    "Camera is paused by your system": "Tu sistema pausó la cámara",
    "Microphone is paused by your system": "Tu sistema pausó el micrófono",

    // Avisos durante la consulta
    "You are muted. Unmute to speak.":
      "Tienes el micrófono apagado. Enciéndelo para que te escuchen.",
    "Audio is connecting...": "Conectando el audio...",
    "Video is connecting...": "Conectando el video...",
    "Video is disabled": "La cámara está apagada",
    "Video paused due to insufficient bandwidth":
      "Se pausó el video porque la conexión es lenta",
    "Video is playing in a popup": "El video se está viendo en otra ventana",

    // Permisos
    "Waiting for permission": "Esperando permiso",
    "Check your browser video permissions": "Revisa el permiso de cámara en tu navegador",
    "Check your browser mic permissions": "Revisa el permiso de micrófono en tu navegador",
    "Check your browser audio permissions": "Revisa el permiso de audio en tu navegador",
    "You have no permission to share your video": "No tienes permiso para compartir tu cámara",
    "You have no permission to share your audio": "No tienes permiso para compartir tu micrófono",
    "You can now speak.": "Ya puedes hablar.",
    "You can no longer speak.": "Ya no puedes hablar.",
    "You can now share your video.": "Ya puedes compartir tu cámara.",
    "You can no longer share your video.": "Ya no puedes compartir tu cámara.",

    // Salir
    Leave: "Salir",
    "Leave call": "Salir de la consulta",
    Cancel: "Cancelar",
    Dismiss: "Entendido",
  },
} as const;
