from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from app.routes.prediction import prediction_bp
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 86400  # 24 hours
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
    
    # Initialize extensions
    jwt = JWTManager(app)
    CORS(app)
    
    # Register blueprints
    app.register_blueprint(prediction_bp, url_prefix='/api/predict')
    
    @app.route('/')
    def home():
        return jsonify({
            'message': 'UQACSSS Prediction API',
            'version': '1.0.0',
            'endpoints': {
                'single_prediction': '/api/predict/single',
                'batch_prediction': '/api/predict/batch',
                'recommendations': '/api/predict/recommendations',
                'health': '/api/predict/health'
            }
        })
    
    return app

app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)