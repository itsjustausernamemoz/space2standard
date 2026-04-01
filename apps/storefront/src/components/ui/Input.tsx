import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label: string;
  isTextArea?: boolean;
}

export const Input: React.FC<InputProps> = ({ label, isTextArea = false, className = '', ...props }) => {
  const baseStyles = "w-full bg-cream-50 border border-walnut-800/20 p-4 text-sm text-navy-950 font-medium placeholder:opacity-40 focus:outline-none focus:border-gold-500 transition duration-300 rounded-lg shadow-inner focus:bg-white";
  
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
