import { useEffect, useState } from 'react';

/**
 * Hook para detectar si el componente se ha hidratado en el cliente
 * Útil para evitar errores de hidratación con datos dinámicos
 */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}
