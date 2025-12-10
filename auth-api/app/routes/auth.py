from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from authlib.integrations.flask_client import OAuth
from app.models import db, User
from email_validator import validate_email, EmailNotValidError

# Def le Blueprint EN PREMIER 
auth_bp = Blueprint('auth', __name__)

# OAuth Configuration - Initialiser plus tard
oauth = OAuth()
google = None

def init_oauth(app):
    """Initialiser OAuth avec l'application Flask"""
    global google
    oauth.init_app(app)
    google = oauth.register(
        name='google',
        client_id=app.config['GOOGLE_CLIENT_ID'],
        client_secret=app.config['GOOGLE_CLIENT_SECRET'],
        server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
        client_kwargs={
            'scope': 'openid email profile'
        }
    )
    return google

# MAINTENANT les routes peuvent utiliser auth_bp
@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Validation
        required_fields = ['email', 'password', 'first_name', 'last_name']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Email validation
        try:
            valid = validate_email(data['email'])
            email = valid.email
        except EmailNotValidError:
            return jsonify({'error': 'Invalid email address'}), 400
        
        # Check if user exists
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'User already exists with this email'}), 409
        
        # Create user
        user = User(
            email=email,
            first_name=data['first_name'],
            last_name=data['last_name'],
            auth_provider='local'
        )
        
        # Définir le mot de passe (haché)
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # Create access token
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'message': 'User registered successfully',
            'access_token': access_token,
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Registration failed', 'details': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400
        
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'user': user.to_dict()
        })
        
    except Exception as e:
        return jsonify({'error': 'Login failed', 'details': str(e)}), 500

@auth_bp.route('/google')
def google_login():
    try:
        # S'assurer que Google OAuth est initialisé
        if google is None:
            init_oauth(current_app._get_current_object())
            
        redirect_uri = request.host_url + 'api/auth/google/callback'
        return google.authorize_redirect(redirect_uri)
    except Exception as e:
        return jsonify({'error': 'Google authentication failed', 'details': str(e)}), 400

@auth_bp.route('/google/callback')
def google_callback():
    try:
        # S'assurer que Google OAuth est initialisé
        if google is None:
            init_oauth(current_app._get_current_object())
            
        token = google.authorize_access_token()
        user_info = token.get('userinfo')
        
        if not user_info:
            return jsonify({'error': 'Failed to get user information from Google'}), 400
        
        # Find or create user
        user = User.query.filter_by(email=user_info['email']).first()
        
        if not user:
            user = User(
                email=user_info['email'],
                first_name=user_info.get('given_name', ''),
                last_name=user_info.get('family_name', ''),
                auth_provider='google'
            )
            db.session.add(user)
            db.session.commit()
        
        access_token = create_access_token(identity=user.id)
        
        # Redirect to frontend with token
        frontend_url = current_app.config.get('FRONTEND_URL', 'http://localhost:3000')
        return f'<script>window.opener.postMessage({{token: "{access_token}"}}, "{frontend_url}"); window.close();</script>'
        
    except Exception as e:
        return jsonify({'error': 'Google authentication failed', 'details': str(e)}), 400

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({'user': user.to_dict()})
        
    except Exception as e:
        return jsonify({'error': 'Failed to get user information', 'details': str(e)}), 500

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    # In a real app, you might want to blacklist the token
    return jsonify({'message': 'Logout successful'})

# Route pour récupérer les informations détaillées de l'utilisateur
@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_user_profile():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'success': True,
            'user': user.to_dict()
        })
        
    except Exception as e:
        return jsonify({'error': 'Failed to get user profile', 'details': str(e)}), 500

# Ajouter cette route pour modifier le mot de passe
@auth_bp.route('/change-password', methods=['PUT'])
@jwt_required()
def change_password():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validation des champs requis
        required_fields = ['current_password', 'new_password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Vérifier la longueur du nouveau mot de passe
        if len(data['new_password']) < 6:
            return jsonify({'error': 'New password must be at least 6 characters'}), 400
        
        # Récupérer l'utilisateur
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Vérifier le mot de passe actuel (sauf pour les utilisateurs Google)
        if user.auth_provider == 'local':
            if not user.check_password(data['current_password']):
                return jsonify({'error': 'Current password is incorrect'}), 401
        
        # Mettre à jour le mot de passe
        user.set_password(data['new_password'])
        
        # Si c'était un utilisateur Google, changer le provider en local
        if user.auth_provider == 'google':
            user.auth_provider = 'local'
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Password updated successfully'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to change password', 'details': str(e)}), 500

# Ajouter cette route pour mettre à jour le profil utilisateur
@auth_bp.route('/profile/update', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Mettre à jour les champs autorisés
        updatable_fields = ['first_name', 'last_name']
        for field in updatable_fields:
            if field in data:
                setattr(user, field, data[field])
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Profile updated successfully',
            'user': user.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update profile', 'details': str(e)}), 500