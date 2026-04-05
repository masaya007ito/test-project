import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import WorldApp from './WorldApp';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WorldApp />
  </StrictMode>
);
