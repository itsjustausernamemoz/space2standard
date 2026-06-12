import React from 'react';

const sfText    = { fontFamily: 'SF Pro Text, system-ui, -apple-system, sans-serif' };
const sfDisplay = { fontFamily: 'SF Pro Display, system-ui, -apple-system, sans-serif' };

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
}

interface ConfirmState extends ConfirmOptions {
  resolve: (v: boolean) => void;
}

export function useConfirm() {
  const [state, setState] = React.useState<ConfirmState | null>(null);

  const confirm = React.useCallback((opts: ConfirmOptions | string): Promise<boolean> => {
    return new Promise(resolve => {
      setState({
        ...(typeof opts === 'string' ? { message: opts } : opts),
        resolve,
      });
    });
  }, []);

  const close = (result: boolean) => {
    state?.resolve(result);
    setState(null);
  };

  const dialog = state ? (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={() => close(false)}
    >
      <div
        style={{
          background: '#0d1220', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16, padding: '28px 32px', width: 380, maxWidth: '90vw',
          boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {state.title && (
          <h3 style={{ ...sfDisplay, color: '#fff', fontSize: 17, fontWeight: 600, margin: '0 0 8px', letterSpacing: '-0.2px' }}>
            {state.title}
          </h3>
        )}
        <p style={{ ...sfText, color: '#8a95a8', fontSize: 14, lineHeight: 1.55, margin: 0 }}>
          {state.message}
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 26 }}>
          <button
            onClick={() => close(false)}
            style={{
              ...sfText,
              background: 'rgba(255,255,255,0.05)',
              color: '#9aa5b8',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 8, padding: '8px 20px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => close(true)}
            style={{
              ...sfText,
              background: state.danger ? 'rgba(239,68,68,0.12)' : 'rgba(201,164,106,0.12)',
              color:      state.danger ? '#f87171'               : '#c9a46a',
              border: `1px solid ${state.danger ? 'rgba(239,68,68,0.28)' : 'rgba(201,164,106,0.28)'}`,
              borderRadius: 8, padding: '8px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            {state.confirmLabel ?? (state.danger ? 'Delete' : 'Confirm')}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return { confirm, dialog };
}
