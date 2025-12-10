import joblib
import pandas as pd
import numpy as np
import os
from typing import Dict, List, Any
import logging
import traceback

logger = logging.getLogger(__name__)

class PredictionService:
    def __init__(self):
        self.model = None
        self.transformer = None
        self.target_pipeline = None
        self.expected_columns = None
        self.categorical_columns = None
        self.numerical_columns = None
        self.load_models()
    
    def load_models(self):
        """Load ML models and transformers"""
        try:
            model_path = os.getenv('MODEL_PATH')
            transformer_path = os.getenv('TRANSFORMER_PATH')
            target_pipeline_path = os.getenv('TARGET_PIPELINE_PATH')
            
            if not all([model_path, transformer_path, target_pipeline_path]):
                raise ValueError("Model paths not configured")
            
            self.model = joblib.load(model_path)
            self.transformer = joblib.load(transformer_path)
            self.target_pipeline = joblib.load(target_pipeline_path)
            
            # Extraire les colonnes attendues par le transformer
            self.extract_expected_columns()
            
            logger.info("All models loaded successfully")
            logger.info(f"Expected columns: {self.expected_columns}")
            logger.info(f"Categorical columns: {self.categorical_columns}")
            logger.info(f"Numerical columns: {self.numerical_columns}")
            
        except Exception as e:
            logger.error(f"Error loading models: {e}")
            raise
    
    def extract_expected_columns(self):
        """Extract expected columns from the transformer"""
        try:
            # Les colonnes catégorielles sont généralement dans le one-hot encoder
            if hasattr(self.transformer, 'named_steps'):
                # Pour les pipelines sklearn
                for name, step in self.transformer.named_steps.items():
                    if hasattr(step, 'get_feature_names_out'):
                        if 'onehot' in name.lower() or 'categorical' in name.lower():
                            # Extraire les colonnes originales des noms de features
                            features = step.get_feature_names_out()
                            # Nettoyer pour obtenir les colonnes originales
                            self.categorical_columns = list(set(
                                [f.split('_')[0] for f in features if '_' in f]
                            ))
            elif hasattr(self.transformer, 'transformers'):
                # Pour les ColumnTransformer
                for name, transformer, columns in self.transformer.transformers:
                    if 'onehot' in str(transformer).lower() or 'categorical' in str(transformer).lower():
                        self.categorical_columns = columns
            
            # Si on n'a pas pu extraire, utiliser les valeurs par défaut
            if self.categorical_columns is None:
                self.categorical_columns = ['preferred_foot', 'attacking_work_rate', 'defensive_work_rate']
            
            # Liste complète des colonnes attendues (basée sur l'entraînement)
            self.expected_columns = [
                'potential', 'crossing', 'finishing', 'heading_accuracy', 'short_passing',
                'volleys', 'dribbling', 'curve', 'free_kick_accuracy', 'long_passing',
                'ball_control', 'acceleration', 'sprint_speed', 'agility', 'reactions',
                'balance', 'shot_power', 'jumping', 'stamina', 'strength', 'long_shots',
                'aggression', 'interceptions', 'positioning', 'vision', 'penalties',
                'marking', 'standing_tackle', 'sliding_tackle', 'gk_diving', 'gk_handling',
                'gk_kicking', 'gk_positioning', 'gk_reflexes', 'preferred_foot',
                'attacking_work_rate', 'defensive_work_rate'
            ]
            
            # Colonnes numériques = toutes sauf catégorielles
            self.numerical_columns = [
                col for col in self.expected_columns 
                if col not in self.categorical_columns
            ]
            
        except Exception as e:
            logger.warning(f"Could not extract columns from transformer: {e}")
            # Valeurs par défaut
            self.expected_columns = [
                'potential', 'crossing', 'finishing', 'heading_accuracy', 'short_passing',
                'volleys', 'dribbling', 'curve', 'free_kick_accuracy', 'long_passing',
                'ball_control', 'acceleration', 'sprint_speed', 'agility', 'reactions',
                'balance', 'shot_power', 'jumping', 'stamina', 'strength', 'long_shots',
                'aggression', 'interceptions', 'positioning', 'vision', 'penalties',
                'marking', 'standing_tackle', 'sliding_tackle', 'gk_diving', 'gk_handling',
                'gk_kicking', 'gk_positioning', 'gk_reflexes', 'preferred_foot',
                'attacking_work_rate', 'defensive_work_rate'
            ]
            self.categorical_columns = ['preferred_foot', 'attacking_work_rate', 'defensive_work_rate']
            self.numerical_columns = [
                col for col in self.expected_columns 
                if col not in self.categorical_columns
            ]
    
    def prepare_single_input(self, data: Dict) -> pd.DataFrame:
        """Prepare single input data for prediction"""
        try:
            logger.info(f"Données reçues dans prepare_single_input: {data}")
            
            # Faire une copie pour ne pas modifier l'original
            processed_data = {}
            
            # Traitement des valeurs scalaires (1-10 vers 1-100)
            scaling_needed = ['acceleration', 'sprint_speed', 'agility']
            
            for key, value in data.items():
                if key in processed_data:
                    continue
                    
                # Gestion des valeurs scalaires
                if key in scaling_needed:
                    try:
                        val = float(value)
                        # Si la valeur est entre 1 et 10, multiplier par 10
                        if 1 <= val <= 10:
                            processed_data[key] = val * 10
                        else:
                            processed_data[key] = val
                    except (ValueError, TypeError):
                        processed_data[key] = 50.0  # Valeur par défaut
                
                # Conversion des types
                elif key in self.categorical_columns:
                    # Normaliser les chaînes de caractères
                    if isinstance(value, str):
                        processed_data[key] = value.lower().strip()
                    else:
                        processed_data[key] = str(value).lower().strip()
                
                else:
                    # Conversion numérique avec gestion d'erreurs
                    try:
                        processed_data[key] = float(value)
                    except (ValueError, TypeError):
                        # Si c'est une colonne attendue mais valeur invalide, mettre une valeur par défaut
                        if key in self.expected_columns:
                            processed_data[key] = 50.0
                        else:
                            # Colonne non attendue, on l'ignore
                            pass
            
            # Ajouter les colonnes manquantes avec des valeurs par défaut
            for col in self.expected_columns:
                if col not in processed_data:
                    if col in self.categorical_columns:
                        # Valeurs par défaut pour les catégorielles
                        if col == 'preferred_foot':
                            processed_data[col] = 'right'
                        elif 'work_rate' in col:
                            processed_data[col] = 'medium'
                        else:
                            processed_data[col] = 'unknown'
                    else:
                        # Valeur par défaut pour les numériques
                        if col.startswith('gk_'):
                            processed_data[col] = 50.0  # Moyen pour gardien
                        else:
                            processed_data[col] = 50.0  # Valeur moyenne
            
            # Créer le DataFrame avec l'ordre correct des colonnes
            df = pd.DataFrame([processed_data])
            
            # Réorganiser les colonnes pour correspondre à l'ordre attendu
            df = df[self.expected_columns]
            
            # Vérifier les types
            for col in self.categorical_columns:
                if col in df.columns:
                    df[col] = df[col].astype(str)
            
            for col in self.numerical_columns:
                if col in df.columns:
                    df[col] = pd.to_numeric(df[col], errors='coerce').fillna(50.0)
            
            logger.info(f"DataFrame préparé - Shape: {df.shape}")
            logger.info(f"Colonnes: {df.columns.tolist()}")
            
            return df
            
        except Exception as e:
            logger.error(f"Error preparing input data: {e}", exc_info=True)
            logger.error(f"Data received: {data}")
            raise
    
    def predict_single(self, data: Dict) -> Dict:
        """Make prediction for single input"""
        try:
            logger.info(f"Début prédiction avec données: {data}")
            
            # Validation basique
            if not data or not isinstance(data, dict):
                raise ValueError("Données invalides ou vides")
            
            # Préparer les données
            input_df = self.prepare_single_input(data)
            
            # Vérifier que le DataFrame n'est pas vide
            if input_df.empty:
                raise ValueError("Le DataFrame préparé est vide")
            
            # Log pour débogage
            logger.info(f"DataFrame avant transformation - Colonnes: {input_df.columns.tolist()}")
            
            # Transformer les données
            transformed_data = self.transformer.transform(input_df)
            logger.info(f"Données transformées shape: {transformed_data.shape}")
            
            # Faire la prédiction
            prediction = self.model.predict(transformed_data)
            logger.info(f"Prédiction brute: {prediction}")
            
            # Transformation inverse pour la cible
            final_prediction = np.round(
                self.target_pipeline.inverse_transform(prediction.reshape(-1, 1)), 2
            )
            logger.info(f"Prédiction finale: {final_prediction}")
            
            return {
                'prediction': float(final_prediction[0, 0]),
                'success': True,
                'columns_used': input_df.columns.tolist()
            }
            
        except Exception as e:
            logger.error(f"Prediction error: {e}", exc_info=True)
            return {
                'error': f"Erreur de prédiction: {str(e)}",
                'success': False,
                'input_data': data if isinstance(data, dict) else str(data)
            }
    
    def clean_data_for_json(self, data):
        """Clean data to make it JSON serializable"""
        if isinstance(data, dict):
            return {k: self.clean_data_for_json(v) for k, v in data.items()}
        elif isinstance(data, list):
            return [self.clean_data_for_json(item) for item in data]
        elif isinstance(data, (np.integer, np.int64)):
            return int(data)
        elif isinstance(data, (np.floating, np.float64)):
            # Convertir NaN et inf en None ou 0
            if np.isnan(data) or np.isinf(data):
                return None
            return float(data)
        elif isinstance(data, np.ndarray):
            return data.tolist()
        elif pd.isna(data):
            return None
        elif isinstance(data, pd.Timestamp):
            return data.isoformat()
        else:
            return data
    
    def predict_batch(self, file_path: str) -> List[Dict]:
        """Make predictions for batch input (CSV file)"""
        try:
            logger.info(f"Batch prediction pour le fichier: {file_path}")
            
            # Lire le CSV
            df = pd.read_csv(file_path)
            logger.info(f"CSV chargé - Shape: {df.shape}, Colonnes: {df.columns.tolist()}")
            
            # Garder une copie des données originales
            original_df = df.copy()
            
            # Vérifier et préparer les colonnes manquantes
            for col in self.expected_columns:
                if col not in df.columns:
                    if col in self.categorical_columns:
                        if col == 'preferred_foot':
                            df[col] = 'right'
                        elif 'work_rate' in col:
                            df[col] = 'medium'
                        else:
                            df[col] = 'unknown'
                    else:
                        df[col] = 50.0
            
            # Réorganiser les colonnes
            df = df[self.expected_columns]
            
            # Convertir les types
            for col in self.categorical_columns:
                if col in df.columns:
                    df[col] = df[col].astype(str)
            
            for col in self.numerical_columns:
                if col in df.columns:
                    df[col] = pd.to_numeric(df[col], errors='coerce').fillna(50.0)
            
            # Transformer les données
            transformed_data = self.transformer.transform(df)
            logger.info(f"Batch transformé - Shape: {transformed_data.shape}")
            
            # Faire les prédictions
            predictions = self.model.predict(transformed_data)
            
            # Transformation inverse
            final_predictions = np.round(
                self.target_pipeline.inverse_transform(predictions.reshape(-1, 1)), 2
            )
            
            # Préparer les résultats avec TOUTES les données
            results = []
            for i in range(len(df)):
                player_id = None
                player_name = None
                
                # Essayer de trouver l'ID et le nom dans différentes colonnes possibles
                possible_id_cols = ['player_fifa_api_id', 'player_id', 'id', 'sofifa_id']
                possible_name_cols = ['player_name', 'name', 'short_name', 'long_name']
                
                for id_col in possible_id_cols:
                    if id_col in original_df.columns:
                        player_id = original_df.iloc[i][id_col]
                        break
                
                for name_col in possible_name_cols:
                    if name_col in original_df.columns:
                        player_name = original_df.iloc[i][name_col]
                        break
                
                # Préparer les données complètes du joueur
                player_data = {}
                
                # Ajouter les attributs transformés
                for col in self.expected_columns:
                    if col in df.columns:
                        val = df.iloc[i][col]
                        # Convertir les types pandas/numpy en types Python natifs
                        if pd.isna(val):
                            player_data[col] = None
                        elif isinstance(val, (np.integer, np.int64)):
                            player_data[col] = int(val)
                        elif isinstance(val, (np.floating, np.float64)):
                            if np.isnan(val) or np.isinf(val):
                                player_data[col] = None
                            else:
                                player_data[col] = float(val)
                        elif isinstance(val, str):
                            player_data[col] = str(val)
                        else:
                            player_data[col] = val
                
                # Ajouter les données originales supplémentaires
                for col in original_df.columns:
                    if col not in self.expected_columns:
                        val = original_df.iloc[i][col]
                        # Nettoyer les données pour JSON
                        if pd.isna(val):
                            player_data[col] = None
                        elif isinstance(val, (np.integer, np.int64)):
                            player_data[col] = int(val)
                        elif isinstance(val, (np.floating, np.float64)):
                            if np.isnan(val) or np.isinf(val):
                                player_data[col] = None
                            else:
                                player_data[col] = float(val)
                        elif isinstance(val, pd.Timestamp):
                            player_data[col] = val.isoformat()
                        elif isinstance(val, str):
                            player_data[col] = str(val)
                        else:
                            player_data[col] = val
                
                # Créer le résultat final
                result = {
                    'id': i + 1,
                    'player_id': self.clean_data_for_json(player_id) or f'player_{i+1}',
                    'prediction': float(final_predictions[i, 0]) if not np.isnan(final_predictions[i, 0]) else None,
                    'name': self.clean_data_for_json(player_name) or f'Joueur {i+1}',
                    'image': self.clean_data_for_json(original_df.iloc[i].get('player_img', original_df.iloc[i].get('image', '')))
                }
                
                # Fusionner avec toutes les données du joueur
                for key, value in player_data.items():
                    if key not in result:  # Éviter les doublons
                        result[key] = self.clean_data_for_json(value)
                
                results.append(result)
            
            logger.info(f"Batch prédiction terminée - {len(results)} joueurs")
            logger.info(f"Premier résultat: {results[0] if results else 'Aucun résultat'}")
            
            # Nettoyer tous les résultats pour JSON
            cleaned_results = self.clean_data_for_json(results)
            
            return cleaned_results
            
        except Exception as e:
            logger.error(f"Batch prediction error: {e}", exc_info=True)
            logger.error(f"Traceback: {traceback.format_exc()}")
            raise ValueError(f"Erreur de prédiction par lot: {str(e)}")

# Global instance
prediction_service = PredictionService()