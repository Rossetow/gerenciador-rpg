// /src/components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, userType, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">Gerenciador de Fichas de RPG</Link>
      <div className="navbar-user-info">
        {user ? (
          <>
            <span className="navbar-text">
              Bem-vindo, {user.nome}! ({userType})
            </span>
            <button onClick={handleLogout} className="btn btn-outline">Sair</button>
          </>
        ) : (
          <span className="navbar-text">Você não está logado.</span>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
