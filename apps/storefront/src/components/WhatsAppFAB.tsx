import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

export const WhatsAppFAB = () => {
  const { settings } = useSettings();
  
  // Clean phone number for WhatsApp API (strip everything except digits)
  const fallbackNumber = '27830000000';
  const whatsappNumber = settings.business_phone 
    ? settings.business_phone.replace(/\D/g, '') 
    : fallbackNumber;

  const bizName = settings.business_name || 'Space2Standard';
  const message = `Hello ${bizName}, I have a question about your bespoke carpentry services.`;
  const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-8 right-8 z-[100] w-16 h-16 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-[#20ba59] transition-colors"
    >
      <MessageCircle size={32} fill="currentColor" />
      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full animate-bounce">
        1
      </span>
    </motion.a>
  );
};
