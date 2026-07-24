/* eslint-disable @typescript-eslint/no-explicit-any */
// Error Boundary — catches React render crashes and shows a readable error screen.
// Uses 'any' workaround for useDefineForClassFields: false tsconfig quirk.
import React from 'react';

function ErrorFallback({ error, onRetry }: { error: any; onRetry: () => void }) {
  return (
    <div style={{
      minHeight: '100vh', background: '#050507', color: '#e0e0e6',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem', fontFamily: 'monospace'
    }}>
      <div style={{
        maxWidth: '700px', width: '100%', background: '#0e0e14',
        border: '1px solid rgba(239,68,68,0.3)', padding: '1.5rem'
      }}>
        <p style={{ color: '#f87171', fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>
          ⚠ RUNTIME CRASH — {error?.message || 'Unknown error'}
        </p>
        <pre style={{
          fontSize: '10px', color: '#9ca3af', background: '#000',
          padding: '1rem', overflow: 'auto', maxHeight: '200px',
          marginBottom: '12px', whiteSpace: 'pre-wrap'
        }}>
          {error?.stack}
        </pre>
        <button
          onClick={onRetry}
          style={{
            padding: '8px 16px', background: '#d25f38', color: '#000',
            fontWeight: 'bold', fontSize: '11px', border: 'none',
            cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em'
          }}
        >
          Retry
        </button>
      </div>
    </div>
  );
}

interface EBState { error: any | null }

class ErrorBoundaryClass extends React.Component<{ children: React.ReactNode; onError: (e: any) => void }> {
  componentDidCatch(error: any, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Crash:', error, info.componentStack);
    (this as any).props.onError(error);
  }
  static getDerivedStateFromError(error: any) { return { error }; }
  render() {
    const state: EBState = (this as any).state || { error: null };
    if (state?.error) return null; // parent handles display
    return (this as any).props.children;
  }
}

interface Props { children: React.ReactNode; }
interface State { error: any | null; }

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    (this as any).state = { error: null };
  }

  static getDerivedStateFromError(error: any): State {
    return { error };
  }

  componentDidCatch(error: any, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Crash:', error, info.componentStack);
  }

  render() {
    const state: State = (this as any).state;
    if (state?.error) {
      return (
        <ErrorFallback
          error={state.error}
          onRetry={() => (this as any).setState({ error: null })}
        />
      );
    }
    return (this as any).props.children;
  }
}
