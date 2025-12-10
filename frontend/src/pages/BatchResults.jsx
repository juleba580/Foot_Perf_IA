import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Download, Filter, User, ArrowLeft } from 'lucide-react';
import './BatchResults.css';

const BatchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { predictions } = location.state || {};
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [sortBy, setSortBy] = useState('prediction');

  if (!predictions || predictions.length === 0) {
    return (
      <div className="batch-results-container">
        <div className="container">
          <div className="error-state">
            <h2>Aucun résultat disponible</h2>
            <p>Veuillez retourner et télécharger un fichier pour la prédiction par lot.</p>
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
    if (score >= 80) return { level: 'Excellent', color: '#38a169', class: 'excellent' };
    if (score >= 70) return { level: 'Bon', color: '#319795', class: 'good' };
    if (score >= 60) return { level: 'Moyen', color: '#dd6b20', class: 'average' };
    return { level: 'À améliorer', color: '#e53e3e', class: 'poor' };
  };

  const filteredPredictions = predictions
    .filter(pred => {
      const matchesSearch = pred.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          pred.player_id.toString().includes(searchTerm);
      const matchesFilter = filterLevel === 'all' || 
        getPerformanceLevel(pred.prediction).class === filterLevel;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'prediction') return b.prediction - a.prediction;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return a.id - b.id;
    });

  const exportToCSV = () => {
    // Exporter toutes les données disponibles, pas juste les basiques
    const baseHeaders = ['ID', 'ID Joueur', 'Nom', 'Prédiction', 'Niveau de performance'];
    
    // Trouver toutes les colonnes de données disponibles
    const dataColumns = new Set();
    predictions.forEach(pred => {
      Object.keys(pred).forEach(key => {
        if (!['id', 'player_id', 'name', 'prediction', 'image'].includes(key)) {
          dataColumns.add(key);
        }
      });
    });
    
    const allHeaders = [...baseHeaders, ...Array.from(dataColumns)];
    
    const csvContent = [
      allHeaders.join(','),
      ...filteredPredictions.map(pred => {
        const rowData = [
          pred.id,
          pred.player_id,
          `"${pred.name}"`,
          pred.prediction,
          getPerformanceLevel(pred.prediction).level
        ];
        
        // Ajouter les données supplémentaires
        dataColumns.forEach(col => {
          const value = pred[col];
          if (typeof value === 'string' && value.includes(',')) {
            rowData.push(`"${value}"`);
          } else {
            rowData.push(value !== undefined ? value : '');
          }
        });
        
        return rowData.join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `predictions_joueurs_complet_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const exportSummaryToCSV = () => {
    // Exporter juste un résumé
    const headers = ['ID', 'ID Joueur', 'Nom', 'Prédiction', 'Niveau de performance'];
    const csvContent = [
      headers.join(','),
      ...filteredPredictions.map(pred => [
        pred.id,
        pred.player_id,
        `"${pred.name}"`,
        pred.prediction,
        getPerformanceLevel(pred.prediction).level
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `predictions_joueurs_resume_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const performanceStats = {
    excellent: predictions.filter(p => p.prediction >= 80).length,
    good: predictions.filter(p => p.prediction >= 70 && p.prediction < 80).length,
    average: predictions.filter(p => p.prediction >= 60 && p.prediction < 70).length,
    poor: predictions.filter(p => p.prediction < 60).length
  };

  // Fonction pour extraire les attributs importants d'un joueur
  const extractPlayerAttributes = (player) => {
    // Liste des attributs importants pour les recommandations
    const importantAttributes = [
      'potential', 'acceleration', 'sprint_speed', 'agility', 'dribbling',
      'crossing', 'finishing', 'short_passing', 'ball_control', 'shot_power',
      'long_shots', 'reactions', 'positioning', 'vision', 'stamina',
      'strength', 'balance', 'jumping', 'aggression', 'interceptions'
    ];
    
    const attributes = {};
    
    importantAttributes.forEach(attr => {
      if (player[attr] !== undefined) {
        attributes[attr] = player[attr];
      }
    });
    
    return attributes;
  };

  return (
    <div className="batch-results-container">
      <div className="container">
        <div className="results-header">
          <div className="header-left">
            <button onClick={() => navigate('/prediction')} className="back-btn">
              <ArrowLeft size={20} />
              Retour
            </button>
            <div>
              <h1>Résultats des prédictions par lot</h1>
              <p>{predictions.length} joueurs analysés</p>
            </div>
          </div>
          <div className="export-buttons">
            <button onClick={exportSummaryToCSV} className="btn btn-secondary">
              <Download size={20} />
              Exporter résumé
            </button>
            <button onClick={exportToCSV} className="btn btn-primary">
              <Download size={20} />
              Exporter données complètes
            </button>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card excellent">
            <h3>{performanceStats.excellent}</h3>
            <p>Excellent</p>
            <span>Note 80+</span>
          </div>
          <div className="stat-card good">
            <h3>{performanceStats.good}</h3>
            <p>Bon</p>
            <span>Note 70-79</span>
          </div>
          <div className="stat-card average">
            <h3>{performanceStats.average}</h3>
            <p>Moyen</p>
            <span>Note 60-69</span>
          </div>
          <div className="stat-card poor">
            <h3>{performanceStats.poor}</h3>
            <p>À améliorer</p>
            <span>Moins de 60</span>
          </div>
        </div>

        <div className="results-controls">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Rechercher des joueurs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filters">
            <select 
              value={filterLevel} 
              onChange={(e) => setFilterLevel(e.target.value)}
              className="filter-select"
            >
              <option value="all">Tous les niveaux</option>
              <option value="excellent">Excellent</option>
              <option value="good">Bon</option>
              <option value="average">Moyen</option>
              <option value="poor">À améliorer</option>
            </select>

            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="prediction">Trier par note</option>
              <option value="name">Trier par nom</option>
              <option value="id">Trier par ID</option>
            </select>
          </div>
        </div>

        <div className="results-table">
          <div className="table-header">
            <div className="col-player">Joueur</div>
            <div className="col-id">ID</div>
            <div className="col-rating">Note</div>
            <div className="col-level">Performance</div>
            <div className="col-actions">Actions</div>
          </div>

          <div className="table-body">
            {filteredPredictions.map((player) => {
              const performance = getPerformanceLevel(player.prediction);
              // Extraire les attributs importants pour les recommandations
              const playerAttributes = extractPlayerAttributes(player);
              // Vérifier si on a assez de données pour les recommandations
              const hasEnoughData = Object.keys(playerAttributes).length >= 5;
              
              return (
                <div key={player.id} className="table-row">
                  <div className="col-player">
                    {player.image ? (
                      <img src={player.image} alt={player.name} className="player-image" />
                    ) : (
                      <div className="player-placeholder">
                        <User size={20} />
                      </div>
                    )}
                    <div className="player-info">
                      <div className="player-name">{player.name || `Joueur ${player.id}`}</div>
                      <div className="player-id">ID: {player.player_id}</div>
                      {!hasEnoughData && (
                        <div className="data-warning" style={{ fontSize: '0.75rem', color: '#e53e3e' }}>
                          Données limitées
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="col-id">#{player.id}</div>
                  
                  <div className="col-rating">
                    <span className="rating-value">{player.prediction}</span>
                  </div>
                  
                  <div className="col-level">
                    <span className={`performance-badge ${performance.class}`}>
                      {performance.level}
                    </span>
                  </div>
                  
                  <div className="col-actions">
                    <button 
                      onClick={() => navigate('/prediction-result', {
                        state: {
                          prediction: player.prediction,
                          playerData: player, // Envoyer TOUTES les données du joueur
                          type: 'batch',
                          player: player // Doublon pour compatibilité
                        }
                      })}
                      className="btn btn-secondary btn-sm"
                      disabled={!hasEnoughData}
                      title={!hasEnoughData ? "Données insuffisantes pour les recommandations" : "Voir détails et recommandations"}
                    >
                      Voir détails
                    </button>
                    {!hasEnoughData && (
                      <div className="info-tooltip">
                        <small style={{ color: '#718096', fontSize: '0.7rem' }}>
                          Données limitées
                        </small>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="batch-info">
          <div className="info-card">
            <h4>Informations sur les données</h4>
            <ul>
              <li><strong>Joueurs avec données complètes:</strong> {predictions.filter(p => Object.keys(extractPlayerAttributes(p)).length >= 15).length}</li>
              <li><strong>Joueurs avec données limitées:</strong> {predictions.filter(p => Object.keys(extractPlayerAttributes(p)).length < 5).length}</li>
              <li><strong>Note moyenne:</strong> {(predictions.reduce((acc, p) => acc + p.prediction, 0) / predictions.length).toFixed(2)}</li>
              <li><strong>Export disponible:</strong> Résumé ou données complètes</li>
            </ul>
          </div>
          
          <div className="info-card">
            <h4>Pour les recommandations IA</h4>
            <p>
              Pour obtenir des recommandations d'entraînement personnalisées, assurez-vous que votre fichier CSV contient:
            </p>
            <ul>
              <li>Les attributs clés (potential, finishing, dribbling, etc.)</li>
              <li>Minimum 5 attributs différents par joueur</li>
              <li>Les valeurs doivent être numériques (1-100)</li>
            </ul>
          </div>
        </div>

        {filteredPredictions.length === 0 && (
          <div className="no-results">
            <p>Aucun joueur ne correspond à vos critères de recherche.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BatchResults;