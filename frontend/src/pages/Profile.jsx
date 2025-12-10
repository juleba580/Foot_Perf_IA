import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Save, Eye, EyeOff } from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const { user, updateProfile, changePassword, fetchUserProfile } = useAuth();
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    email: ''
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState({ profile: false, password: false });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, profile: true }));
    setMessage({ type: '', text: '' });

    const result = await updateProfile({
      first_name: profile.first_name,
      last_name: profile.last_name
    });

    if (result.success) {
      setMessage({ type: 'success', text: 'Profil mis à jour avec succès' });
    } else {
      setMessage({ type: 'error', text: result.error });
    }
    
    setLoading(prev => ({ ...prev, profile: false }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, password: true }));
    setMessage({ type: '', text: '' });

    // Validation
    if (passwordData.new_password !== passwordData.confirm_password) {
      setMessage({ type: 'error', text: 'Les nouveaux mots de passe ne correspondent pas' });
      setLoading(prev => ({ ...prev, password: false }));
      return;
    }

    if (passwordData.new_password.length < 6) {
      setMessage({ type: 'error', text: 'Le nouveau mot de passe doit contenir au moins 6 caractères' });
      setLoading(prev => ({ ...prev, password: false }));
      return;
    }

    const result = await changePassword({
      current_password: passwordData.current_password,
      new_password: passwordData.new_password
    });

    if (result.success) {
      setMessage({ type: 'success', text: 'Mot de passe modifié avec succès' });
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } else {
      setMessage({ type: 'error', text: result.error });
    }
    
    setLoading(prev => ({ ...prev, password: false }));
  };

  const handleRefreshProfile = async () => {
    const result = await fetchUserProfile();
    if (result.success) {
      setMessage({ type: 'success', text: 'Profil actualisé' });
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Mon Profil</h1>
        <div className="profile-actions">
          <button 
            onClick={handleRefreshProfile}
            className="btn btn-secondary"
          >
            Actualiser
          </button>
        </div>
        <p>Gérez vos informations personnelles et votre mot de passe</p>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="profile-sections">
        {/* Section Informations personnelles */}
        <div className="profile-section">
          <h2>Informations personnelles</h2>
          <form onSubmit={handleUpdateProfile} className="profile-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="first_name" className="form-label">
                  <User size={16} /> Prénom
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={profile.first_name}
                  onChange={handleProfileChange}
                  className="form-input"
                  placeholder="Votre prénom"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="last_name" className="form-label">
                  <User size={16} /> Nom
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={profile.last_name}
                  onChange={handleProfileChange}
                  className="form-input"
                  placeholder="Votre nom"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                <Mail size={16} /> Adresse email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={profile.email}
                className="form-input"
                readOnly
                disabled
              />
              <small className="text-muted">L'adresse email ne peut pas être modifiée</small>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading.profile}
            >
              <Save size={16} /> {loading.profile ? 'Mise à jour...' : 'Mettre à jour'}
            </button>
          </form>
        </div>

        {/* Section Changement de mot de passe */}
        <div className="profile-section">
          <h2>Changement de mot de passe</h2>
          <form onSubmit={handleChangePassword} className="profile-form">
            <div className="form-group">
              <label htmlFor="current_password" className="form-label">
                <Lock size={16} /> Mot de passe actuel
              </label>
              <div className="input-with-icon">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  id="current_password"
                  name="current_password"
                  value={passwordData.current_password}
                  onChange={handlePasswordChange}
                  className="form-input"
                  placeholder="Votre mot de passe actuel"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="new_password" className="form-label">
                <Lock size={16} /> Nouveau mot de passe
              </label>
              <div className="input-with-icon">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  id="new_password"
                  name="new_password"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  className="form-input"
                  placeholder="Nouveau mot de passe (min. 6 caractères)"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirm_password" className="form-label">
                <Lock size={16} /> Confirmer le nouveau mot de passe
              </label>
              <div className="input-with-icon">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirm_password"
                  name="confirm_password"
                  value={passwordData.confirm_password}
                  onChange={handlePasswordChange}
                  className="form-input"
                  placeholder="Confirmez votre nouveau mot de passe"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading.password}
            >
              <Lock size={16} /> {loading.password ? 'Changement...' : 'Changer le mot de passe'}
            </button>
          </form>
        </div>
      </div>

      {/* Section Informations de compte */}
      <div className="profile-section">
        <h2>Informations du compte</h2>
        <div className="account-info">
          <div className="info-item">
            <span className="info-label">Fournisseur d'authentification:</span>
            <span className="info-value">
              {user?.auth_provider === 'google' ? 'Google' : 'Email/Mot de passe'}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Date de création:</span>
            <span className="info-value">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'Non disponible'}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Compte actif:</span>
            <span className="info-value">
              {user?.is_active ? 'Oui' : 'Non'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;