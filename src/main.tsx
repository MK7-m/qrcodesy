import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import React from 'react';
import App from './App.tsx';
import './index.css';

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Application error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const errorMessage = this.state.error.message;
      const isSupabaseError = errorMessage.includes('Supabase');

      return (
        <div style={{
          padding: '2rem',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          maxWidth: '800px',
          margin: '2rem auto',
          lineHeight: '1.6'
        }}>
          <h1 style={{ color: '#dc2626', marginBottom: '1rem', fontSize: '1.5rem' }}>
            ⚠️ Configuration Required
          </h1>
          
          {isSupabaseError ? (
            <>
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                padding: '1.5rem',
                borderRadius: '0.5rem',
                marginBottom: '1rem'
              }}>
                <p style={{ color: '#991b1b', margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>
                  Missing Supabase Environment Variables
                </p>
                <p style={{ color: '#991b1b', margin: 0 }}>
                  Your app needs Supabase credentials to run. Please create a <code style={{
                    background: '#fee2e2',
                    padding: '0.2rem 0.4rem',
                    borderRadius: '0.25rem',
                    fontFamily: 'monospace'
                  }}>.env</code> file in the root directory.
                </p>
              </div>

              <div style={{
                background: '#fffbeb',
                border: '1px solid #fde68a',
                padding: '1.5rem',
                borderRadius: '0.5rem',
                marginBottom: '1rem'
              }}>
                <p style={{ color: '#92400e', margin: '0 0 1rem 0', fontWeight: 'bold' }}>
                  Quick Setup:
                </p>
                <ol style={{ color: '#92400e', margin: 0, paddingLeft: '1.5rem' }}>
                  <li style={{ marginBottom: '0.5rem' }}>
                    Create a file named <code style={{
                      background: '#fef3c7',
                      padding: '0.2rem 0.4rem',
                      borderRadius: '0.25rem',
                      fontFamily: 'monospace'
                    }}>.env</code> in the project root
                  </li>
                  <li style={{ marginBottom: '0.5rem' }}>
                    Add these lines (replace with your actual values):
                    <pre style={{
                      background: '#1f2937',
                      color: '#f9fafb',
                      padding: '1rem',
                      borderRadius: '0.5rem',
                      marginTop: '0.5rem',
                      overflowX: 'auto',
                      fontSize: '0.875rem'
                    }}>{`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here`}</pre>
                  </li>
                  <li style={{ marginBottom: '0.5rem' }}>
                    Restart the development server (stop and run <code style={{
                      background: '#fef3c7',
                      padding: '0.2rem 0.4rem',
                      borderRadius: '0.25rem',
                      fontFamily: 'monospace'
                    }}>npm start</code> again)
                  </li>
                </ol>
                <p style={{ color: '#92400e', margin: '1rem 0 0 0', fontSize: '0.875rem' }}>
                  <strong>Note:</strong> If you don't have a Supabase project yet, create one at{' '}
                  <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" style={{ color: '#dc2626' }}>
                    supabase.com
                  </a>
                </p>
              </div>
            </>
          ) : (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              padding: '1.5rem',
              borderRadius: '0.5rem'
            }}>
              <p style={{ color: '#991b1b', margin: 0, fontWeight: 'bold' }}>Error:</p>
              <pre style={{
                color: '#991b1b',
                whiteSpace: 'pre-wrap',
                margin: '0.5rem 0 0 0'
              }}>{errorMessage}</pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
