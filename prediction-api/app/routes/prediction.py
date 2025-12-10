from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import pandas as pd
import tempfile
import os
import logging
from app.services.prediction_service import prediction_service
from app.services.recommendation_service import recommendation_service

# Configure logging
logger = logging.getLogger(__name__)

prediction_bp = Blueprint('prediction', __name__)

@prediction_bp.route('/single', methods=['POST'])
@jwt_required()
def predict_single():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided', 'success': False}), 400
        
        result = prediction_service.predict_single(data)
        
        if result['success']:
            return jsonify({
                'success': True,
                'prediction': result['prediction'],
                'player_id': 'manual_input'
            })
        else:
            return jsonify({
                'success': False,
                'error': result['error']
            }), 400
            
    except Exception as e:
        logger.error(f"Single prediction failed: {e}", exc_info=True)
        return jsonify({
            'success': False,
            'error': f'Prediction failed: {str(e)}'
        }), 500

@prediction_bp.route('/batch', methods=['POST'])
@jwt_required()
def predict_batch():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided', 'success': False}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected', 'success': False}), 400
        
        if not file.filename.endswith('.csv'):
            return jsonify({'error': 'File must be CSV', 'success': False}), 400
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.csv') as temp_file:
            file.save(temp_file.name)
            temp_path = temp_file.name
        
        try:
            logger.info(f"Processing batch prediction for file: {file.filename}")
            
            # Faire la prédiction
            results = prediction_service.predict_batch(temp_path)
            
            logger.info(f"Successfully processed {len(results)} players")
            
            return jsonify({
                'success': True,
                'predictions': results,
                'total_players': len(results),
                'message': f'Prédictions terminées pour {len(results)} joueurs'
            })
            
        except Exception as e:
            logger.error(f"Error in batch prediction: {e}", exc_info=True)
            return jsonify({
                'success': False,
                'error': f'Erreur de prédiction par lot: {str(e)}'
            }), 500
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_path):
                os.unlink(temp_path)
            
    except Exception as e:
        logger.error(f"Batch prediction failed: {e}", exc_info=True)
        return jsonify({
            'success': False,
            'error': f'Batch prediction failed: {str(e)}'
        }), 500

@prediction_bp.route('/recommendations', methods=['POST'])
@jwt_required()
def get_recommendations():
    try:
        data = request.get_json()
        
        if not data or 'player_data' not in data:
            return jsonify({'error': 'Player data required', 'success': False}), 400
        
        player_data = data['player_data']
        prediction = data.get('prediction', 0)
        
        recommendations = recommendation_service.get_recommendations(player_data, prediction)
        
        return jsonify({
            'success': True,
            'recommendations': recommendations,
            'total_recommendations': len(recommendations)
        })
        
    except Exception as e:
        logger.error(f"Failed to get recommendations: {e}", exc_info=True)
        return jsonify({
            'success': False,
            'error': f'Failed to get recommendations: {str(e)}'
        }), 500

@prediction_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        models_loaded = all([
            prediction_service.model is not None,
            prediction_service.transformer is not None,
            prediction_service.target_pipeline is not None
        ])
        
        return jsonify({
            'status': 'healthy' if models_loaded else 'degraded',
            'models_loaded': models_loaded,
            'service': 'prediction-api'
        })
        
    except Exception as e:
        logger.error(f"Health check failed: {e}", exc_info=True)
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'service': 'prediction-api'
        }), 500