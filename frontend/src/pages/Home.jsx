import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Target, Upload, BarChart3, Users, Award, Shield } from 'lucide-react';
import './Home.css';

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: Target,
      title: 'Prédiction de performance',
      description: 'Prédisez la performance des joueurs avec nos modèles de machine learning avancés',
      link: '/prediction'
    },
    {
      icon: Upload,
      title: 'Analyse par lot',
      description: 'Téléchargez des fichiers CSV pour des prédictions multiples en une fois',
      link: '/prediction'
    },
    {
      icon: BarChart3,
      title: 'Analyses détaillées',
      description: 'Obtenez des insights complets et des analyses de performance',
      link: '/prediction'
    },
    {
      icon: Users,
      title: 'Gestion d\'équipe',
      description: 'Gérez et suivez plusieurs joueurs et équipes',
      link: '/prediction'
    },
    {
      icon: Award,
      title: 'Recommandations d\'entraînement',
      description: 'Suggestions d\'entraînement personnalisées alimentées par l\'IA',
      link: '/prediction'
    },
    {
      icon: Shield,
      title: 'Sécurisé & Fiable',
      description: 'Sécurité de niveau entreprise pour vos données',
      link: '/prediction'
    }
  ];

  return (
    <div className="home-container">
      {/* Section Hero */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1>Foot Perf AI</h1>
              <p className="hero-subtitle">
                Plateforme avancée alimentée par l'IA pour l'optimisation des performances footballistiques. 
                Prédisez la performance des joueurs, obtenez des recommandations d'entraînement personnalisées 
                et prenez des décisions basées sur les données.
              </p>
              <div className="hero-actions">
                {user ? (
                  <Link to="/prediction" className="btn btn-primary btn-large">
                    <Target size={24} />
                    Commencer les prédictions
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="btn btn-primary btn-large">
                      Commencer
                    </Link>
                    <Link to="/login" className="btn btn-secondary btn-large">
                      Se connecter
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="hero-visual">
              <img src="https://images.squarespace-cdn.com/content/v1/5352fb7ce4b0bf79997bfc81/1589203534128-K0N49DZ0YD3BF3636MM1/image3.jpg?format=2500w" alt="Analyses Football" />
            </div>
          </div>
        </div>
      </section>

      {/* Section Fonctionnalités */}
      <section id="features" className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Fonctionnalités puissantes pour le football moderne</h2>
            <p>Tout ce dont vous avez besoin pour optimiser la performance des joueurs et la stratégie d'équipe</p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="feature-card">
                  <div className="feature-icon">
                    <IconComponent size={32} />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                  <Link to={feature.link} className="feature-link">
                    En savoir plus →
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section Fonctionnement */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="container">
          <div className="section-header">
            <h2>Comment ça marche</h2>
            <p>Étapes simples pour obtenir des insights sur la performance des joueurs</p>
          </div>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Saisie des données joueur</h3>
              <p>Entrez les attributs des joueurs manuellement ou téléchargez un fichier CSV avec plusieurs joueurs</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Analyse IA</h3>
              <p>Nos modèles de machine learning analysent les données et prédisent les scores de performance</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Résultats & Recommandations</h3>
              <p>Recevez des prédictions détaillées et des recommandations d'entraînement personnalisées</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section CTA */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Prêt à transformer la performance de votre équipe ?</h2>
            <p>Rejoignez les entraîneurs et analystes qui utilisent déjà Foot Perf AI pour prendre des décisions basées sur les données</p>
            {user ? (
              <Link to="/prediction" className="btn btn-primary btn-large">
                Faire une prédiction
              </Link>
            ) : (
              <div className="cta-actions">
                <Link to="/register" className="btn btn-primary btn-large">
                  Essai gratuit
                </Link>
                <Link to="/login" className="btn btn-secondary btn-large">
                  Se connecter
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;