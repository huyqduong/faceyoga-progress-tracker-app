import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Import your providers here
// import { AuthProvider } from '../contexts/AuthContext';

function render(ui: React.ReactElement, { route = '/' } = {}) {
  window.history.pushState({}, 'Test page', route);

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <BrowserRouter>
        {/* Add your providers here */}
        {/* <AuthProvider> */}
          {children}
          <Toaster />
        {/* </AuthProvider> */}
      </BrowserRouter>
    );
  }

  return rtlRender(ui, { wrapper: Wrapper });
}

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { render };
