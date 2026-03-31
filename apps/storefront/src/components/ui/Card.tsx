import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'glass' | 'solid' | 'outline';
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  variant = 'outline',
  hoverEffect = true
}) => {
  const baseStyles = "relative rounded-2xl overflow-hidden transition-all duration-500 bg-white/5 backdrop-blur-xl border border-walnut-800/10";
  
  const variants = {
    glass: "bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl",
    solid: "bg-cream-100 border border-walnut-800/10 shadow-xl",
    outline: "bg-transparent border border-walnut-800/10 hover:border-gold-500/40 shadow-lg",
  };

  return (
    <motion.div
      whileHover={hoverEffect ? { y: -10, boxShadow: "0 25px 40px -15px rgba(201, 168, 76, 0.15)" } : {}}
      className={cn(baseStyles, variants[variant as keyof typeof variants], className)}
    >
      <div className="relative z-10 p-8 h-full">
        {children}
      </div>
      
      {/* Subtle shine/gradient overlay for luxurious feel */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
    </motion.div>
  );
};
