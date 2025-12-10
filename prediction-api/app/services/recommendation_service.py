import json
import os
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)

class RecommendationService:
    def __init__(self):
        self.gemini_client = None
        self.thresholds = None
        self.load_thresholds()
        self.init_gemini()
    
    def init_gemini(self):
        """Initialize Gemini AI client"""
        try:
            api_key = os.getenv('GEMINI_API_KEY')
            if api_key and api_key != "dev-mode-no-gemini":
                # Import conditionnel pour éviter l'erreur
                from google import genai
                self.gemini_client = genai.Client(api_key=api_key)
                logger.info("Gemini AI client initialized")
        except ImportError:
            logger.warning("Google Generative AI not installed, using fallback recommendations")
        except Exception as e:
            logger.warning(f"Failed to initialize Gemini AI: {e}")
    
    def load_thresholds(self):
        """Load attribute thresholds"""
        try:
            thresholds_path = os.path.join(
                os.path.dirname(__file__), 
                '../../data/attribute_thresholds.json'
            )
            with open(thresholds_path, 'r') as f:
                self.thresholds = json.load(f)
        except Exception as e:
            logger.error(f"Error loading thresholds: {e}")
            self.thresholds = {}
    
    def generate_training_advice(self, attribute: str) -> str:
        """Generate training advice using Gemini AI or fallback"""
        # Essayer Gemini si disponible
        if self.gemini_client:
            try:
                prompt = f"""
                As a professional football coach, provide concise training advice (max 50 words) 
                to improve a player's {attribute}. Focus on practical exercises and techniques.
                """
                
                response = self.gemini_client.models.generate_content(
                    model="gemini-2.0-flash",
                    contents=prompt,
                )
                return response.text.strip()
            except Exception as e:
                logger.warning(f"Gemini AI failed, using fallback: {e}")
        
        # Fallback vers les recommandations prédéfinies
        return self.get_fallback_advice(attribute)
    
    def get_fallback_advice(self, attribute: str) -> str:
        """Get predefined training advice"""
        advice_map = {
            'crossing': 'Pratiquez les centres depuis différentes positions avec les deux pieds. Travaillez la précision et la courbe de la balle.',
            'finishing': 'Améliorez la finition avec des exercices de tir sous pression. Travaillez les angles et la puissance.',
            'heading_accuracy': 'Développez la technique de tête avec des exercices de timing et de positionnement. Renforcez les muscles du cou.',
            'short_passing': 'Pratiquez les passes courtes et rapides. Travaillez la précision et le poids de la passe.',
            'volleys': 'Améliorez les volées avec des exercices de contrôle et de frappe en l\'air. Travaillez l\'équilibre.',
            'dribbling': 'Développez le dribble avec des exercices de slalom et 1 contre 1. Améliorez le contrôle rapproché.',
            'curve': 'Pratiquez les effets avec des exercices de frappe enroulée. Travaillez la technique de pied.',
            'free_kick_accuracy': 'Améliorez les coups francs avec des répétitions techniques. Étudiez les placements du mur.',
            'long_passing': 'Développez les passes longues avec des exercices de précision à distance. Travaillez la technique.',
            'ball_control': 'Améliorez le contrôle avec des exercices de réception. Travaillez le premier toucher de balle.',
            'acceleration': 'Développez l\'acceleration avec des exercices explosifs. Travaillez les départs rapides.',
            'sprint_speed': 'Améliorez la vitesse avec des exercices de course. Travaillez la foulée et la fréquence.',
            'agility': 'Développez l\'agilité avec des exercices de changement de direction. Améliorez la coordination.',
            'reactions': 'Améliorez les réflexes avec des exercices de réaction. Travaillez l\'anticipation.',
            'balance': 'Développez l\'équilibre avec des exercices de stabilité. Renforcez le tronc.',
            'shot_power': 'Augmentez la puissance de tir avec des exercices de frappe. Travaillez la technique.',
            'jumping': 'Améliorez le saut avec des exercices pliométriques. Renforcez les jambes.',
            'stamina': 'Développez l\'endurance avec un entraînement par intervalles. Améliorez la condition physique.',
            'strength': 'Renforcez la puissance physique avec des exercices de musculation. Travaillez les duels.',
            'long_shots': 'Pratiquez les tirs de loin avec des exercices de précision à distance.',
            'aggression': 'Canalsez l\'agressivité de manière positive. Travaillez l\'engagement contrôlé.',
            'interceptions': 'Améliorez les interceptions avec des exercices d\'anticipation. Lisez le jeu.',
            'positioning': 'Développez le positionnement avec des exercices tactiques. Étudiez le placement.',
            'vision': 'Améliorez la vision de jeu avec des exercices de prise d\'information. Scannez le terrain.',
            'penalties': 'Pratiquez les penalties avec des exercices de concentration. Variez les placements.',
            'marking': 'Améliorez le marquage avec des exercices défensifs. Travaillez la concentration.',
            'standing_tackle': 'Développez le tacle debout avec des exercices techniques. Travaillez le timing.',
            'sliding_tackle': 'Pratiquez le tacle glissé avec prudence. Travaillez la technique et la sécurité.',
            'gk_diving': 'Améliorez les plongeons avec des exercices techniques. Travaillez l\'explosivité.',
            'gk_handling': 'Développez la prise de balle avec des exercices de réception. Travaillez la sécurité.',
            'gk_kicking': 'Améliorez le jeu au pied avec des exercices de précision. Travaillez la distribution.',
            'gk_positioning': 'Développez le positionnement gardien avec des exercices d\'angles. Étudiez la géométrie.',
            'gk_reflexes': 'Améliorez les réflexes avec des exercices de réaction rapide. Travaillez l\'explosivité.',
            'potential': 'Développez votre potentiel avec un entraînement régulier et varié. Fixez-vous des objectifs progressifs.',
            'preferred_foot': 'Travaillez le pied faible avec des exercices spécifiques. Développez l\'ambidextrie.',
            'attacking_work_rate': 'Améliorez l\'engagement offensif avec un travail d\'endurance et d\'anticipation.',
            'defensive_work_rate': 'Développez l\'engagement défensif avec un travail de concentration et de positionnement.'
        }
        return advice_map.get(attribute, f'Pratiquez régulièrement {attribute.replace("_", " ")} avec des exercices ciblés et progressifs.')
    
    def get_recommendations(self, player_data: Dict, prediction: float) -> List[Dict]:
        """Get personalized recommendations for player"""
        recommendations = []
        
        for attribute, value in player_data.items():
            if (attribute in self.thresholds and 
                value < self.thresholds[attribute]['seuil']):
                
                advice = self.generate_training_advice(attribute)
                
                recommendations.append({
                    'attribute': attribute,
                    'current_value': value,
                    'threshold': self.thresholds[attribute]['seuil'],
                    'recommendation': advice,
                    'image': self.thresholds[attribute].get('image', ''),
                    'improvement_needed': self.thresholds[attribute]['seuil'] - value
                })
        
        # Sort by improvement needed (descending)
        recommendations.sort(key=lambda x: x['improvement_needed'], reverse=True)
        
        return recommendations

# Global instance
recommendation_service = RecommendationService()