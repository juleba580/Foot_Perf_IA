import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Menu, X, User, LogOut, Home, BarChart3, Settings } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [dropdownOuvert, setDropdownOuvert] = useState(false);
  const [modelsDropdownOuvert, setModelsDropdownOuvert] = useState(false);

  const gererDeconnexion = () => {
    logout();
    setMenuOuvert(false);
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  //Vérifie si le chemin commence par /prediction
  const isModelsActive = () => {
    return location.pathname.startsWith('/prediction');
  };

  // Fonction pour scroll vers une section
  const scrollToSection = (sectionId) => {
    if (location.pathname === '/') {
      // Si on est sur la page d'accueil, on scroll
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Sinon, on redirige vers l'accueil avec le hash
      navigate(`/#${sectionId}`);
    }
    setMenuOuvert(false);
    setModelsDropdownOuvert(false);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          {/* Logo */}
          <div className="logo">
            <Link to="/" className="logo-link" onClick={() => setMenuOuvert(false)}>
              <h1>Foot Perf</h1>
              <span>IA</span>
            </Link>
          </div>

          {/* Menu de navigation */}
          <nav className={`nav ${menuOuvert ? 'nav-open' : ''}`}>
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''}`} 
              onClick={() => setMenuOuvert(false)}
            >
              <Home size={18} />
              Accueil
            </Link>
            
            <button 
              className="nav-link" 
              onClick={() => scrollToSection('features')}
            >
              Informations
            </button>

            <div 
              className="nav-dropdown"
              onMouseEnter={() => setModelsDropdownOuvert(true)}
              onMouseLeave={() => setModelsDropdownOuvert(false)}
            >
              <button className={`nav-link dropdown-btn ${isModelsActive() ? 'active' : ''}`}>
                <BarChart3 size={18} />
                Modèles
              </button>
              <div className={`dropdown-menu ${modelsDropdownOuvert ? 'open' : ''}`}>
                <Link 
                  to="/prediction" 
                  className={`dropdown-link ${isActive('/prediction') ? 'active' : ''}`}
                  onClick={() => {setMenuOuvert(false); setModelsDropdownOuvert(false);}}
                >
                  Prédiction performances
                </Link>
                <button 
                  className="dropdown-link" 
                  onClick={() => scrollToSection('how-it-works')}
                >
                  Détails du modèle
                </button>
              </div>
            </div>
          </nav>

          {/* Zone d'actions (connexion / utilisateur) */}
          <div className="header-actions">
            {user ? (
              <div className="user-menu">
                <div 
                  className="user-dropdown"
                  onMouseEnter={() => setDropdownOuvert(true)}
                  onMouseLeave={() => setDropdownOuvert(false)}
                >
                  <button className={`user-btn ${isActive('/profile') ? 'active' : ''}`}>
                    <div className="user-avatar">
                      {user.first_name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span className="user-name">
                      {user.first_name} {user.last_name}
                    </span>
                  </button>
                  
                  <div className={`user-dropdown-menu ${dropdownOuvert ? 'open' : ''}`}>
                    <div className="user-info-dropdown">
                      <div className="user-avatar-large">
                        {user.first_name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div className="user-details">
                        <span className="user-fullname">
                          {user.first_name} {user.last_name}
                        </span>
                        <span className="user-email">{user.email}</span>
                      </div>
                    </div>
                    
                    <div className="dropdown-divider"></div>
                    
                    <Link 
                      to="/profile" 
                      className={`dropdown-item ${isActive('/profile') ? 'active' : ''}`}
                      onClick={() => {setMenuOuvert(false); setDropdownOuvert(false);}}
                    >
                      <Settings size={16} />
                      <span>Mon Profil</span>
                    </Link>
                    
                    <button 
                      onClick={gererDeconnexion} 
                      className="dropdown-item logout-item"
                    >
                      <LogOut size={16} />
                      <span>Déconnexion</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn btn-secondary" onClick={() => setMenuOuvert(false)}>
                  Connexion
                </Link>
                <Link to="/register" className="btn btn-primary" onClick={() => setMenuOuvert(false)}>
                  Inscription
                </Link>
              </div>
            )}

            {/* Menu mobile */}
            <button 
              className="mobile-menu-btn"
              onClick={() => setMenuOuvert(!menuOuvert)}
              aria-label={menuOuvert ? "Fermer le menu" : "Ouvrir le menu"}
            >
              {menuOuvert ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;