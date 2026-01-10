import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

console.log('🚀 Application starting...');
console.log('   Root element:', document.getElementById('root'));

try {
  const root = document.getElementById('root');
  if (!root) {
    console.error('❌ CRITICAL: Root element not found!');
    document.body.innerHTML = '<div style="padding: 40px; color: red;"><h1>Error: Root element not found</h1><p>The application cannot start because the root element is missing.</p></div>';
  } else {
    console.log('✅ Root element found, creating React root...');
    const reactRoot = createRoot(root);
    console.log('✅ React root created, rendering App...');
    reactRoot.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    console.log('✅ App rendered successfully');
  }
} catch (error) {
  console.error('═══════════════════════════════════════════════════════════');
  console.error('❌ FATAL ERROR during application initialization');
  console.error('   Error:', error);
  console.error('   Error message:', error.message);
  console.error('   Error stack:', error.stack);
  console.error('═══════════════════════════════════════════════════════════');
  
  document.body.innerHTML = `
    <div style="padding: 40px; color: red; font-family: Arial, sans-serif;">
      <h1>⚠️ Application Failed to Load</h1>
      <p><strong>Error:</strong> ${error.message || 'Unknown error'}</p>
      <details style="margin-top: 20px;">
        <summary style="cursor: pointer; font-weight: bold;">Full Error Details</summary>
        <pre style="font-size: 12px; margin-top: 10px; padding: 10px; background-color: #f5f5f5; border-radius: 4px; overflow: auto;">
          ${error.stack || 'No stack trace available'}
        </pre>
      </details>
      <button onclick="window.location.reload()" style="margin-top: 20px; padding: 12px 24px; font-size: 16px; cursor: pointer;">
        Reload Page
      </button>
    </div>
  `;
}
