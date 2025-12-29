// import { StrictMode } from 'react'; // Temporarily disabled due to react-beautiful-dnd compatibility
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  // Temporarily disabled StrictMode due to react-beautiful-dnd compatibility issues
  // <StrictMode>
    <App />
  // </StrictMode>
);
