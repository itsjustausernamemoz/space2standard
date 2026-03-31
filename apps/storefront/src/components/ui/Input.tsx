import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label: string;
  isTextArea?: boolean;
}

export const Input: React.FC<InputProps> = ({ label, isTextArea = false, className = '', ...props }) => {
  const baseStyles = "w-full bg-white/5 border border-walnut-800/10 p-4 text-sm text-charcoal-800 placeholder:opacity-30 focus:outline-none focus:border-gold-500 transition duration-300 rounded-lg backdrop-blur-md focus:bg-cream-100";
  
  return (
    <div className={cn("space-y-2 group", className)}>
      <label className="text-[10px] font-bold uppercase tracking-widest text-gold-500/80 group-focus-within:text-gold-500 transition-colors block ml-2">
        {label}
      </label>
      
      {isTextArea ? (
        <textarea
          className={cn(baseStyles, "min-h-[120px] resize-none")}
          {...props as React.TextareaHTMLAttributes<HTMLTextAreaElement>}
        />
      ) : (
        <input
          className={baseStyles}
          {...props as React.InputHTMLAttributes<HTMLInputElement>}
        />
      )}
    </div>
  );
};
