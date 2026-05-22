// main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* AuthProvider wraps everything so ALL components can access auth state */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);