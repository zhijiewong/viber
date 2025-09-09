import React from 'react';
import { createRoot } from 'react-dom/client';
import { Popup } from './Popup';

const App: React.FC = () => {
  return <Popup />;
};

// Initialize the popup when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const container = document.body;
  const root = createRoot(container);
  root.render(<App />);
});
