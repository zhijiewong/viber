import React from 'react';
import { createRoot } from 'react-dom/client';
import { DevToolsPanel } from './DevToolsPanel';

const App: React.FC = () => {
  return <DevToolsPanel />;
};

// Initialize the devtools panel when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const container = document.body;
  const root = createRoot(container);
  root.render(<App />);
});
