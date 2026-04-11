import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

export const WhatsAppFAB = () => {
  const { settings } = useSettings();
  
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
      className="fixed bottom-6 right-6 z-[100] w-[52px] h-[52px] bg-[#c9a46a] text-white rounded-full flex items-center justify-center transition-transform hover:scale-105"
    >
      <MessageCircle size={24} fill="white" />
      <span className="absolute -top-1 -right-1 bg-[#ff3b30] text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
        1
      </span>
    </motion.a>
  );
};
