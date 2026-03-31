import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'gold' | 'walnut' | 'charcoal' | 'outline' | 'success' | 'error';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'gold', 
  className = '' 
}) => {
  const variants = {
    gold: 'bg-gold-500 text-walnut-950 px-2 py-1',
    walnut: 'bg-walnut-800 text-gold-300 px-2 py-1',
    charcoal: 'bg-charcoal-800 text-cream-100 px-2 py-1',
    outline: 'border border-gold-500 text-gold-600 px-2 py-1',
    success: 'bg-green-100 text-green-800 border border-green-200 px-2 py-1',
    error: 'bg-red-100 text-red-800 border border-red-200 px-2 py-1',
  };

  return (
    <span className={cn(
      'inline-flex items-center text-[10px] font-bold uppercase tracking-widest rounded-sm',
      variants[variant as keyof typeof variants],
      className
    )}>
      {children}
    </span>
  );
};
