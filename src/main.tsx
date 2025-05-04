
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Garante que o root existe
const rootElement = document.getElementById("root");
if (!rootElement) {
  const newRoot = document.createElement("div");
  newRoot.id = "root";
  document.body.appendChild(newRoot);
}

// Logging de informação de inicialização
console.log('Iniciando aplicação...');
console.log('Ambiente:', import.meta.env.MODE);
console.log('URL base:', window.location.origin);

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Log para confirmar que a aplicação inicializou
console.log('Aplicação inicializada com sucesso!');

// Verificar suporte ao localStorage
try {
  localStorage.setItem('test', 'test');
  localStorage.removeItem('test');
  console.log('localStorage disponível e funcionando');
} catch (e) {
  console.error('Problema com localStorage:', e);
}
