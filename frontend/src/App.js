// /src/App.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import MestreDashboard from './pages/MestreDashboard';
import JogadorDashboard from './pages/JogadorDashboard';
import CampanhaDetalhe from './pages/CampanhaDetalhe';
import PersonagemFicha from './pages/PersonagemFicha';
import Navbar from './components/Navbar';
import './App.css'; // Vamos adicionar estilos

// Componente para proteger rotas
const ProtectedRoute = ({ children, allowedRole }) => {
  const { jogador, role } = useAuth();
  if (!jogador) {
    return <Navigate to="/" replace />;
  }
  if (role !== allowedRole) {
    return <Navigate to="/" replace />; // Ou para uma página "Não Autorizado"
  }
  return children;
};

function App() {
  return (
    <div className="App">
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route
            path="/mestre"
            element={
              <ProtectedRoute allowedRole="mestre">
                <MestreDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mestre/campanha/:id"
            element={
              <ProtectedRoute allowedRole="mestre">
                <CampanhaDetalhe />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jogador"
            element={
              <ProtectedRoute allowedRole="jogador">
                <JogadorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/personagem/:id" // Rota genérica, a própria página decide a permissão
            element={<PersonagemFicha />}
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;