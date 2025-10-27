// /src/components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { jogador, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">RPG Manager</Link>
      <div>
        {jogador && (
          <>
            <span className="navbar-text">
              Logado como: {jogador.nome} ({role})
            </span>
            <button onClick={handleLogout} className="btn btn-outline">Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;