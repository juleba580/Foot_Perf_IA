import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { predictionService } from '../services/api';
import { Upload, Sliders, Target } from 'lucide-react';
import './PredictionForm.css';

const PredictionForm = () => {
  const [activeTab, setActiveTab] = useState('single');
  const [singleData, setSingleData] = useState({});
  const [changedFields, setChangedFields] = useState({});
  const [batchFile, setBatchFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Valeurs par défaut pour tous les attributs
  const defaultValues = {
    "potential": 82,
    "acceleration": 75,
    "sprint_speed": 78,
    "agility": 72,
    "balance": 70,
    "jumping": 68,
    "stamina": 85,
    "strength": 74,
    "dribbling": 80,
    "crossing": 65,
    "finishing": 78,
    "heading_accuracy": 62,
    "short_passing": 82,
    "volleys": 60,
    "curve": 68,
    "free_kick_accuracy": 65,
    "long_passing": 75,
    "ball_control": 84,
    "long_shots": 72,
    "shot_power": 76,
    "penalties": 70,
    "reactions": 78,
    "aggression": 65,
    "interceptions": 70,
    "positioning": 75,
    "vision": 80,
    "marking": 68,
    "standing_tackle": 72,
    "sliding_tackle": 65,
    "gk_diving": 15,
    "gk_handling": 16,
    "gk_kicking": 23,
    "gk_positioning": 18,
    "gk_reflexes": 17,
    preferred_foot: 'droit',
    attacking_work_rate: 'moyen',
    defensive_work_rate: 'moyen'
  };

  // TRADUCTION DES ATTRIBUTS
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
    heading_accuracy: "Précision de la tête",
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
    preferred_foot: "Pied préféré",
    attacking_work_rate: "Tâche offensive",
    defensive_work_rate: "Tâche défensive"
  };

  // CATÉGORIES
  const attributeCategories = {
    physique: ['potential', 'acceleration', 'sprint_speed', 'agility', 'balance', 'jumping', 'stamina', 'strength', 'dribbling'],
    technique: ['crossing', 'finishing', 'heading_accuracy', 'short_passing', 'volleys', 'curve', 'free_kick_accuracy', 'long_passing', 'ball_control', 'long_shots', 'shot_power', 'penalties'],
    mental: ['reactions', 'aggression', 'interceptions', 'positioning', 'vision', 'marking', 'standing_tackle', 'sliding_tackle'],
    gardien: ['gk_diving', 'gk_handling', 'gk_kicking', 'gk_positioning', 'gk_reflexes'],
    préférences: ['preferred_foot', 'attacking_work_rate', 'defensive_work_rate']
  };

  const handleSingleInputChange = (attribute, value) => {
    setSingleData(prev => ({
      ...prev,
      [attribute]: value
    }));

    setChangedFields(prev => ({
      ...prev,
      [attribute]: value
    }));
  };

  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Fusionner les données modifiées avec les valeurs par défaut
      const allPlayerData = { ...defaultValues, ...changedFields };
      
      // 2. Envoyer seulement les champs modifiés pour la prédiction
      const response = await predictionService.predictSingle(changedFields);
      
      if (response.data.success) {
        navigate('/prediction-result', {
          state: {
            prediction: response.data.prediction,
            playerData: allPlayerData, // Envoyer TOUTES les données pour les recommandations
            changedData: changedFields, // Envoyer aussi les données modifiées (optionnel)
            type: 'single'
          }
        });
      } else {
        setError(response.data.error);
      }
    } catch (error) {
      console.error('Prediction error:', error);
      setError('La prédiction a échoué. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleBatchSubmit = async (e) => {
    e.preventDefault();
    if (!batchFile) {
      setError('Veuillez sélectionner un fichier CSV');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await predictionService.predictBatch(batchFile);
      
      if (response.data.success) {
        navigate('/prediction-results', {
          state: {
            predictions: response.data.predictions,
            type: 'batch'
          }
        });
      } else {
        setError(response.data.error);
      }
    } catch (error) {
      console.error('Batch prediction error:', error);
      setError('La prédiction par lot a échoué. Veuillez vérifier votre fichier et réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setBatchFile(file);
    setError('');
  };

  const renderAttributeInput = (attribute) => {
    if (['preferred_foot', 'attacking_work_rate', 'defensive_work_rate'].includes(attribute)) {
      return renderSelectInput(attribute);
    }
    return renderRangeInput(attribute);
  };

  const renderRangeInput = (attribute) => {
    // Utiliser la valeur modifiée ou la valeur par défaut
    const currentValue = changedFields[attribute] !== undefined 
      ? changedFields[attribute] 
      : singleData[attribute] || defaultValues[attribute];
    
    const isScaled = ['acceleration', 'sprint_speed', 'agility'].includes(attribute);
    const displayValue = isScaled ? Math.round(currentValue / 10) : currentValue;

    return (
      <div className="attribute-input">
        <label className="attribute-label">
          {attributeLabels[attribute] || attribute.replace(/_/g, " ").toUpperCase()}
          <span className="attribute-value">{displayValue}</span>
        </label>
        <input
          type="range"
          min="1"
          max={isScaled ? "10" : "100"}
          value={isScaled ? displayValue : currentValue}
          onChange={(e) => handleSingleInputChange(
            attribute, 
            isScaled ? parseInt(e.target.value) * 10 : parseInt(e.target.value)
          )}
          className="range-input"
        />
      </div>
    );
  };

  const renderSelectInput = (attribute) => {
    const options = {
      preferred_foot: ['gauche', 'droit'],
      attacking_work_rate: ['faible', 'moyen', 'élevé'],
      defensive_work_rate: ['faible', 'moyen', 'élevé']
    };

    const currentValue = changedFields[attribute] !== undefined 
      ? changedFields[attribute] 
      : singleData[attribute] || defaultValues[attribute];

    return (
      <div className="attribute-input">
        <label className="attribute-label">
          {attributeLabels[attribute] || attribute.replace(/_/g, " ").toUpperCase()}
        </label>
        <select
          value={currentValue || ''}
          onChange={(e) => handleSingleInputChange(attribute, e.target.value)}
          className="select-input"
        >
          <option value="">Sélectionner {attributeLabels[attribute]}</option>
          {options[attribute].map(option => (
            <option key={option} value={option}>
              {option.toUpperCase()}
            </option>
          ))}
        </select>
      </div>
    );
  };

  return (
    <div className="prediction-container">
      <div className="container">
        <div className="prediction-header">
          <h1>Prédiction de performance</h1>
          <p>Prédisez la performance des joueurs de football grâce à nos modèles d'IA avancés</p>
        </div>

        <div className="prediction-tabs">
          <button
            className={`tab-btn ${activeTab === 'single' ? 'active' : ''}`}
            onClick={() => setActiveTab('single')}
          >
            <Sliders size={20} />
            Saisie manuelle
          </button>
          <button
            className={`tab-btn ${activeTab === 'batch' ? 'active' : ''}`}
            onClick={() => setActiveTab('batch')}
          >
            <Upload size={20} />
            Import par lot
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {activeTab === 'single' && (
          <form onSubmit={handleSingleSubmit} className="prediction-form">
            <div className="attribute-sections">
              {Object.entries(attributeCategories).map(([category, attributes]) => (
                <div key={category} className="attribute-section">
                  <h3 className="section-title">
                    Attributs {category}
                  </h3>
                  <div className="attributes-grid">
                    {attributes.map(attribute => (
                      <div key={attribute} className="attribute-item">
                        {renderAttributeInput(attribute)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="form-summary">
              <p>
                <strong>Note :</strong> Seuls les attributs modifiés seront envoyés pour la prédiction.
                Tous les attributs seront disponibles pour les recommandations IA.
              </p>
              <p>
                Attributs modifiés : <strong>{Object.keys(changedFields).length}</strong>
              </p>
            </div>

            <button
              type="submit"
              className="btn btn-primary predict-btn"
              disabled={loading || Object.keys(changedFields).length === 0}
            >
              <Target size={20} />
              {loading ? 'Prédiction en cours...' : 'Prédire la performance'}
            </button>
          </form>
        )}

        {activeTab === 'batch' && (
          <form onSubmit={handleBatchSubmit} className="batch-form">
            <div className="file-upload-area">
              <Upload size={48} />
              <h3>Importer un fichier CSV</h3>
              <p>Sélectionnez un fichier CSV contenant les données des joueurs</p>

              <input
                type="file"
                id="file-input"
                accept=".csv"
                onChange={handleFileChange}
                className="file-input"
                style={{ display: 'none' }}
              />

              <label htmlFor="file-input" className="file-input-label">
                Choisir un fichier
              </label>

              {batchFile && (
                <div className="file-info">
                  Fichier sélectionné : {batchFile.name}
                </div>
              )}
            </div>

            <div className="file-requirements">
              <h4>Exigences du fichier :</h4>
              <ul>
                <li>Format CSV encodé UTF-8</li>
                <li>Toutes les colonnes nécessaires doivent être présentes</li>
                <li>Taille maximale : 10MB</li>
              </ul>
            </div>

            <button
              type="submit"
              className="btn btn-primary predict-btn"
              disabled={loading || !batchFile}
            >
              <Target size={20} />
              {loading ? 'Traitement...' : 'Prédire le lot'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default PredictionForm;