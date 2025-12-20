'use client';
import { useState, useEffect } from 'react';

interface GymHours {
  open: string | null;
  close: string | null;
  closed?: boolean;
}

interface GymSettings {
  gym_name: string;
  gym_address: string;
  gym_phone: string;
  gym_email: string;
  gym_logo_url: string | null;
  gym_facebook_url: string | null;
  gym_maps_url: string | null;
  gym_hours: Record<string, GymHours>;
  max_capacity: string;
}

/**
 * Hook para obtener la configuración del gimnasio desde Supabase
 */
export function useGymSettings() {
  const [settings, setSettings] = useState<GymSettings>({
    gym_name: 'Muscle Up GYM',
    gym_address: 'Francisco I. Madero 708, Colonia Lindavista, San Buenaventura, Coahuila',
    gym_phone: '8661127905',
    gym_email: 'administracion@muscleupgym.fitness',
    gym_logo_url: null,
    gym_facebook_url: null,
    gym_maps_url: null,
    gym_hours: {
      monday: { open: '06:00', close: '22:00' },
      tuesday: { open: '06:00', close: '22:00' },
      wednesday: { open: '06:00', close: '22:00' },
      thursday: { open: '06:00', close: '22:00' },
      friday: { open: '06:00', close: '22:00' },
      saturday: { open: '09:00', close: '17:00' },
      sunday: { open: null, close: null, closed: true }
    },
    max_capacity: '100'
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/gym-settings');
        if (response.ok) {
          const data = await response.json();
          if (data) {
            setSettings(data);
          }
        }
      } catch (error) {
        console.error('Error fetching gym settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const getPhoneLink = () => `tel:${settings.gym_phone.replace(/\s/g, '')}`;
  
  const getAddressParts = () => {
    const parts = settings.gym_address.split(',').map(p => p.trim());
    return {
      street: parts[0] || '',
      city: parts[2] || 'San Buenaventura',
      state: parts[3] || 'Coahuila',
      zip: '25508'
    };
  };

  return { settings, loading, getPhoneLink, getAddressParts };
}
