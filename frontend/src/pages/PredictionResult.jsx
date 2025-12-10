import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { predictionService } from '../services/api';
import { Target, TrendingUp, AlertCircle, CheckCircle, ArrowLeft, Lightbulb } from 'lucide-react';
import './PredictionResult.css';

const PredictionResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { prediction, playerData, type, player } = location.state || {};
  
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [showRecs, setShowRecs] = useState(false);
  const [processedPlayerData, setProcessedPlayerData] = useState(null);


  // DICTIONNAIRE FRANÇAIS DES ATTRIBUTS

  const attributeLabels = {
    potential: "Potentiel",
    acceleration: "Accélération",
    sprint_speed: "Vitesse de sprint",
    agility: "Agilité",
    balance: "Équilibre",
    jumping: "Saut",
    stamina: "Endurance",
    strength: "Force",
    dribbling: "Dribble",
    
    crossing: "Centres",
    finishing: "Finition",
    heading_accuracy: "Précision tête",
    short_passing: "Passe courte",
    volleys: "Volées",
    curve: "Effet",
    free_kick_accuracy: "Précision coups francs",
    long_passing: "Passe longue",
    ball_control: "Contrôle de balle",
    long_shots: "Tirs lointains",
    shot_power: "Puissance de tir",
    penalties: "Pénaltys",

    reactions: "Réactions",
    aggression: "Agressivité",
    interceptions: "Interceptions",
    positioning: "Placement",
    vision: "Vision",
    marking: "Marquage",
    standing_tackle: "Tacle debout",
    sliding_tackle: "Tacle glissé",

    gk_diving: "Plongeon",
    gk_handling: "Prise de balle",
    gk_kicking: "Dégagement",
    gk_positioning: "Placement gardien",
    gk_reflexes: "Réflexes",
  };


  // PRÉPARER LES DONNÉES
  useEffect(() => {
    if (playerData || player) {
      const dataToUse = playerData || player;

      const importantAttributes = [
        'potential', 'acceleration', 'sprint_speed', 'agility', 'balance', 
        'jumping', 'stamina', 'strength', 'dribbling', 'crossing', 
        'finishing', 'heading_accuracy', 'short_passing', 'volleys', 
        'curve', 'free_kick_accuracy', 'long_passing', 'ball_control', 
        'long_shots', 'shot_power', 'penalties', 'reactions', 'aggression', 
        'interceptions', 'positioning', 'vision', 'marking', 'standing_tackle', 
        'sliding_tackle', 'gk_diving', 'gk_handling', 'gk_kicking', 
        'gk_positioning', 'gk_reflexes'
      ];

      const filteredData = {};
      importantAttributes.forEach(attr => {
        const v = dataToUse[attr];
        filteredData[attr] = v !== undefined && v !== null
          ? (typeof v === "string" ? parseFloat(v) || 50 : v)
          : 50;
      });

      setProcessedPlayerData(filteredData);
    }
  }, [playerData, player]);

  if (!prediction) {
    return (
      <div className="prediction-result-container">
        <div className="container">
          <div className="error-state">
            <AlertCircle size={64} />
            <h2>Aucune donnée disponible</h2>
            <p>Veuillez effectuer une prédiction avant d'accéder à cette page.</p>
            <button onClick={() => navigate('/prediction')} className="btn btn-primary">
              <ArrowLeft size={20} />
              Retour à la prédiction
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getPerformanceLevel = (score) => {
    if (score >= 80) return { level: 'Excellent', color: '#38a169', icon: CheckCircle };
    if (score >= 70) return { level: 'Bon', color: '#319795', icon: TrendingUp };
    if (score >= 60) return { level: 'Moyen', color: '#dd6b20', icon: AlertCircle };
    return { level: 'À améliorer', color: '#e53e3e', icon: AlertCircle };
  };

  const performance = getPerformanceLevel(prediction);
  const PerformanceIcon = performance.icon;

  const handleGetRecommendations = async () => {
    if (!processedPlayerData) return;

    setLoadingRecs(true);
    try {
      const response = await predictionService.getRecommendations(processedPlayerData, prediction);
      if (response.data.success) {
        setRecommendations(response.data.recommendations);
        setShowRecs(true);
      }
    } catch (error) {
      console.error('Erreur API recommandations :', error);
    } finally {
      setLoadingRecs(false);
    }
  };

  const hasEnoughDataForRecommendations = () => {
    if (!processedPlayerData) return false;
    return Object.values(processedPlayerData).filter(v => typeof v === "number" && !isNaN(v)).length >= 5;
  };

  return (
    <div className="prediction-result-container">
      <div className="container">
        <div className="result-header">
          <button onClick={() => navigate(type === 'batch' ? '/batch-results' : '/prediction')} className="back-btn">
            <ArrowLeft size={20} />
            Retour {type === 'batch' ? 'aux résultats' : 'à la prédiction'}
          </button>

          <h1>Résultat de la prédiction</h1>

          {type === 'batch' && (
            <div className="result-type-badge">
              Analyse depuis un fichier CSV
            </div>
          )}
        </div>

        <div className="result-content">
          {/* SCORE PRINCIPAL */}
          <div className="prediction-card">
            <div className="prediction-score">
              <div className="score-circle">
                <Target size={48} />
                <span className="score-value">{prediction}</span>
                <span className="score-label">Note globale</span>
              </div>
            </div>

            <div className="performance-info">
              <PerformanceIcon size={32} color={performance.color} />
              <h3 style={{ color: performance.color }}>{performance.level}</h3>

              <p>
                {prediction >= 80 
                  ? 'Un joueur exceptionnel avec un haut niveau de performance.'
                  : prediction >= 70
                  ? 'Un joueur solide avec un fort potentiel d’amélioration.'
                  : prediction >= 60
                  ? 'Un joueur moyen qui peut progresser avec un bon entraînement.'
                  : 'Un joueur nécessitant une amélioration importante dans plusieurs domaines.'
                }
              </p>
            </div>
          </div>

          {/* RECOMMANDATIONS */}
          <div className="recommendations-section">
            {!showRecs ? (
              <div className="get-recommendations">
                <Lightbulb size={48} />
                <h3>Recommandations d'entraînement personnalisées</h3>
                <p>Générées automatiquement selon les attributs actuels du joueur</p>

                {!hasEnoughDataForRecommendations() ? (
                  <div className="data-warning">
                    <AlertCircle size={20} />
                    <p>Données insuffisantes pour générer des recommandations.</p>
                    <small>Assurez-vous que le joueur possède au moins 5 attributs valides.</small>
                  </div>
                ) : (
                  <button
                    onClick={handleGetRecommendations}
                    disabled={loadingRecs}
                    className="btn btn-primary"
                  >
                    {loadingRecs ? 'Génération...' : 'Obtenir les recommandations'}
                  </button>
                )}
              </div>
            ) : (
              <div className="recommendations-list">
                <h3>Recommandations d'entraînement</h3>
                <p className="recommendations-subtitle">
                  Basées sur l'analyse du profil du joueur
                </p>
                
                {recommendations.length > 0 ? (
                  <div className="recommendations-grid">
                    {recommendations.slice(0, 6).map((rec, index) => (
                      <div key={index} className="recommendation-card">
                        <div className="rec-header">
                          <h4>{attributeLabels[rec.attribute] || rec.attribute}</h4>
                          <span className="current-score">Actuel : {rec.current_value}</span>
                        </div>

                        <div className="progress-info">
                          <div className="progress-bar">
                            <div 
                              className="progress-fill"
                              style={{ width: `${Math.min((rec.current_value / rec.threshold) * 100, 100)}%` }}
                            ></div>
                          </div>
                          <span className="target-score">Cible : {rec.threshold}</span>
                        </div>

                        <div className="rec-advice">
                          <p>{rec.recommendation}</p>
                        </div>

                        {rec.image && (
                          <div className="rec-image">
                            <img src={rec.image} alt={rec.attribute} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-recommendations">
                    <CheckCircle size={48} />
                    <h4>Performance excellente</h4>
                    <p>Aucune recommandation nécessaire : le joueur performe très bien.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ATTRIBUTS DU JOUEUR */}
          <div className="player-attributes">
            <h3>Résumé des attributs du joueur</h3>

            {!processedPlayerData ? (
              <div className="no-data">
                <p>Aucune donnée détaillée disponible.</p>
              </div>
            ) : (
              <div className="attributes-summary">
                {Object.entries(processedPlayerData)
                  .filter(([key, value]) => value !== null && value !== undefined)
                  .slice(0, 10)
                  .map(([key, value]) => (
                    <div key={key} className="attribute-summary-item">
                      <span className="attr-name">{attributeLabels[key] || key}</span>
                      <span className="attr-value">{value}</span>
                    </div>
                  ))}

                {Object.keys(processedPlayerData).length > 10 && (
                  <div className="more-attributes">
                    <small>
                      + {Object.keys(processedPlayerData).length - 10} attributs supplémentaires
                    </small>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default PredictionResult;
