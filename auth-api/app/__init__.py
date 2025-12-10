from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from .models import db
from .routes.auth import auth_bp, init_oauth
import os

def create_app():
    app = Flask(__name__)
    
    # Clé secrète pour les sessions (nécessaire pour notre OAuth)
    app.secret_key = os.getenv('SECRET_KEY', 'dev-secret-session')
    
    # Configuration directe
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///app/database.sqlite')
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET', 'dev-secret-key')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 86400  # 24 hours
    app.config['GOOGLE_CLIENT_ID'] = os.getenv('GOOGLE_CLIENT_ID', '')
    app.config['GOOGLE_CLIENT_SECRET'] = os.getenv('GOOGLE_CLIENT_SECRET', '')
    app.config['FRONTEND_URL'] = os.getenv('FRONTEND_URL', 'http://localhost:3000')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize extensions
    db.init_app(app)
    jwt = JWTManager(app)
    CORS(app)
    
    # Initialize OAuth
    init_oauth(app)
    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    
    # Health check route
    @app.route('/')
    def home():
        return jsonify({
            'message': 'UQACSSS Auth API',
            'status': 'running',
            'version': '1.0.0'
        })
    
    @app.route('/health')
    def health():
        return jsonify({'status': 'healthy'})
    
    # Create tables
    with app.app_context():
        db.create_all()
    
    return app
