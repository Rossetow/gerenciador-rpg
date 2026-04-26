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

// Componente para proteger rotas, agora usando o novo contexto
const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, userType, loading } = useAuth();

  // Se ainda estiver verificando a autenticação, não renderize nada ainda.
  if (loading) {
    return <p>Verificando autenticação...</p>;
  }

  // Se não houver usuário ou o tipo de usuário for diferente do permitido, redireciona
  if (!user || userType !== allowedRole) {
    return <Navigate to="/" replace />;
  }
  
  // Se tudo estiver OK, renderiza a rota protegida
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
            path="/mestre/personagem/:id"
            element={
              <ProtectedRoute allowedRole="mestre">
                <PersonagemFicha />
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
            path="/jogador/personagem/:id"
            element={
              <ProtectedRoute allowedRole="jogador">
                <PersonagemFicha />
              </ProtectedRoute>
            }
          />

          {/* Rota para "Não Encontrado" */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
