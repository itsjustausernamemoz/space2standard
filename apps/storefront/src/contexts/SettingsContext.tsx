import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface SettingsData {
  business_name: string;
  business_logo_url: string;
  business_address: string;
  business_phone: string;
  business_email: string;
  business_url: string;
  vat_rate: string;
  footer_tagline: string;
  footer_copyright: string;
}

interface SettingsContextType {
  settings: SettingsData;
  loading: boolean;
}

const defaultSettings: SettingsData = {
  business_name: 'Space2Standard',
  business_logo_url: '',
  business_address: 'Namibia',
  business_phone: '',
  business_email: 'hello@space2standard.com',
  business_url: '',
  vat_rate: '15',
  footer_tagline: 'A premium Namibian artisan brand crafting bespoke furniture and architectural installations. Blending traditional craftsmanship with modern precision to perfection.',
  footer_copyright: 'Space2Standard Artisan Business. Crafted for life in Namibia.',
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  loading: true,
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data, error } = await supabase.from('settings').select('*');
        if (error) throw error;
        
        if (data) {
          const fetchedSettings = data.reduce((acc, row) => ({
            ...acc,
            [row.key]: row.value
          }), {} as Partial<SettingsData>);

          setSettings(prev => ({
            ...prev,
            ...fetchedSettings
          }));
        }
      } catch (err) {
        console.error('Failed to load system settings:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
        {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
