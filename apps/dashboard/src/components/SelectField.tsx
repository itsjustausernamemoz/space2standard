import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  style?: React.CSSProperties;
  className?: string;
  disabled?: boolean;
}

const Option: React.FC<{
  opt: SelectOption;
  selected: boolean;
  onSelect: () => void;
}> = ({ opt, selected, onSelect }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onMouseDown={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: '9px 12px',
        background: selected ? 'rgba(201,164,106,0.12)' : hovered ? 'rgba(255,255,255,0.05)' : 'transparent',
        border: 'none',
        borderRadius: 7,
        color: selected ? '#c9a46a' : '#d0d8e8',
        fontSize: 13,
        textAlign: 'left',
        cursor: 'pointer',
        fontFamily: 'SF Pro Text, system-ui, -apple-system, sans-serif',
        transition: 'background 0.1s',
      }}
    >
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{opt.label}</span>
      {selected && <Check size={13} style={{ color: '#c9a46a', flexShrink: 0, marginLeft: 8 }} />}
    </button>
  );
};

export const SelectField: React.FC<SelectFieldProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  style,
  className,
  disabled,
}) => {
  const [open, setOpen] = useState(false);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selected = options.find(o => o.value === value);

  const toggle = () => {
    if (disabled || !btnRef.current) return;
    if (open) { setOpen(false); return; }
    const rect = btnRef.current.getBoundingClientRect();
    const menuHeight = Math.min(options.length * 44, 280);
    const spaceBelow = window.innerHeight - rect.bottom;
    const useAbove = spaceBelow < menuHeight + 8 && rect.top > menuHeight + 8;
    setDropPos({
      top: useAbove ? rect.top - menuHeight - 4 : rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (
        btnRef.current && !btnRef.current.contains(e.target as Node) &&
        menuRef.current && !menuRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        disabled={disabled}
        className={className}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          cursor: disabled ? 'not-allowed' : 'pointer',
          textAlign: 'left',
          ...style,
        }}
      >
        <span style={{
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          color: selected ? 'inherit' : '#5a6070',
        }}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={14}
          style={{
            color: '#5a6070',
            flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s ease',
          }}
        />
      </button>

      {open && (
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: dropPos.top,
            left: dropPos.left,
            width: Math.max(dropPos.width, 180),
            zIndex: 99999,
            background: '#0d1220',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10,
            boxShadow: '0 12px 40px rgba(0,0,0,0.7)',
            maxHeight: 280,
            overflowY: 'auto',
            padding: 4,
          }}
        >
          {options.map(opt => (
            <Option
              key={opt.value}
              opt={opt}
              selected={value === opt.value}
              onSelect={() => { onChange(opt.value); setOpen(false); }}
            />
          ))}
        </div>
      )}
    </>
  );
};
