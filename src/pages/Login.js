import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Camera } from 'lucide-react';
import logo from '../assets/animatch-logo.png';
import LegalModal from '../components/LegalModal';
import './Login.css';

const Login = () => {
    const { login } = useAuth();
    const { users, addUser } = useData();

    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);

    // Registration specific fields
    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [lastName, setLastName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarDataUrl, setAvatarDataUrl] = useState(null);
    const [additionalPhotos, setAdditionalPhotos] = useState([]);
    const additionalPhotosRef = useRef(null);
    const [agreed, setAgreed] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const capitalizeName = (str) => {
        return str
            .split(' ')
            .map(word => word ? word.charAt(0).toUpperCase() + word.slice(1) : '')
            .join(' ');
    };

    /**
     * Compress an image data-URL to max 200×200 px at 60% JPEG quality.
     * This keeps each stored image under ~10 KB so db.json stays small.
     */
    const compressImage = (dataUrl, maxPx = 200, quality = 0.6) =>
        new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
                const canvas = document.createElement('canvas');
                canvas.width  = Math.round(img.width  * scale);
                canvas.height = Math.round(img.height * scale);
                canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.src = dataUrl;
        });

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setError('Please upload a valid image file.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError('Profile photo must be less than 5 MB.');
            return;
        }
        const reader = new FileReader();
        reader.onload = async (ev) => {
            const compressed = await compressImage(ev.target.result);
            setAvatarPreview(compressed);
            setAvatarDataUrl(compressed);
        };
        reader.readAsDataURL(file);
    };

    const handleAdditionalPhotos = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        files.forEach(file => {
            if (!file.type.startsWith('image/')) {
                setError('Please upload valid image files only.');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setError('Each additional photo must be less than 5 MB.');
                return;
            }
            const reader = new FileReader();
            reader.onload = async (ev) => {
                const compressed = await compressImage(ev.target.result);
                setAdditionalPhotos(prev => {
                    if (prev.length >= 5) return prev;
                    return [...prev, compressed];
                });
            };
            reader.readAsDataURL(file);
        });
    };

    const removeAdditionalPhoto = (index) => {
        setAdditionalPhotos(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (isLogin) {
            const existingUser = users.find(u => u.email === email);
            if (existingUser) {
                login(existingUser);
            } else {
                setError('User not found. Try registering.');
            }
        } else {
            // Registration checks
            if (password !== confirmPassword) {
                setError('Passwords do not match.');
                return;
            }
            if (!email.endsWith('@dlsl.edu.ph')) {
                setError('Must use a valid official De La Salle Lipa student email (@dlsl.edu.ph).');
                return;
            }
            if (parseInt(age) < 18) {
                setError('You must be 18+ to use this platform.');
                return;
            }
            if (!gender) {
                setError('Please select your gender.');
                return;
            }
            if (!avatarDataUrl) {
                setError('Please upload at least one profile photo.');
                return;
            }
            if (!agreed) {
                setError('You must agree to the terms to proceed.');
                return;
            }

            const emailExists = users.some(u => u.email === email);
            if (emailExists) {
                setError('Email is already registered.');
                return;
            }

            const fullName = `${firstName.trim()} ${middleName ? middleName.trim() + ' ' : ''}${lastName.trim()}`;
            const newUser = {
                id: `u${Date.now()}`,
                name: fullName,
                email,
                gender,
                age: parseInt(age),
                // Avatar is compressed to ≤200×200 px / ~10 KB before being stored
                avatar: avatarDataUrl,
                additionalPhotos,
                role: 'user',
                reputationScore: 50,
                reputationTier: 'Bronze',
                intent: null,
            };

            addUser(newUser);
            login(newUser);
        }
    };

    return (
        <div className="auth-page">
            {error && <div className="error-toast">{error}</div>}
            <div className="auth-wrap">
                <div className="auth-logo">
                    <img src={logo} alt="AniMatch Logo" className="auth-mark" />
                    <span className="auth-name">AniMatch</span>
                </div>
                <p className="auth-subtitle">Welcome back to campus connections</p>

                <div className="auth-card">
                    <h1 className="auth-title">{isLogin ? 'Login' : 'Create account'}</h1>

                    <form onSubmit={handleSubmit} className="login-form">
                        {!isLogin && (
                            <>
                                <div className="form-group">
                                    <label>First Name</label>
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(capitalizeName(e.target.value))}
                                        required
                                    />
                                </div>
                                <div className="name-row">
                                    <div className="form-group form-group-flex">
                                        <label>Middle Name <span className="optional-text">(Opt)</span></label>
                                        <input
                                            type="text"
                                            value={middleName}
                                            onChange={(e) => setMiddleName(capitalizeName(e.target.value))}
                                        />
                                    </div>
                                    <div className="form-group form-group-flex">
                                        <label>Last Name</label>
                                        <input
                                            type="text"
                                            value={lastName}
                                            onChange={(e) => setLastName(capitalizeName(e.target.value))}
                                            required
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="form-group">
                            <label>School Email</label>
                            <input
                                type="email"
                                placeholder="your_name@dlsl.edu.ph"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <div className="password-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                    title={showPassword ? "Hide password" : "Show password"}
                                    tabIndex="-1"
                                >
                                    {showPassword ? (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                            <line x1="1" y1="1" x2="23" y2="23"></line>
                                        </svg>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {!isLogin && (
                            <>
                                <div className="form-group">
                                    <label>Confirm Password</label>
                                    <div className="password-wrapper">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle-btn"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            title={showConfirmPassword ? "Hide password" : "Show password"}
                                            tabIndex="-1"
                                        >
                                            {showConfirmPassword ? (
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                                    <line x1="1" y1="1" x2="23" y2="23"></line>
                                                </svg>
                                            ) : (
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                    <circle cx="12" cy="12" r="3"></circle>
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="name-row">
                                    <div className="form-group">
                                        <label>Age</label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            pattern="\d*"
                                            maxLength="2"
                                            className="age-input"
                                            value={age}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (/^\d*$/.test(val) && val.length <= 2) {
                                                    setAge(val);
                                                }
                                            }}
                                            required
                                        />
                                    </div>

                                    <div className="form-group form-group-flex">
                                        <label>Gender</label>
                                        <div className="gender-selector">
                                            <button
                                                type="button"
                                                className={`gender-btn ${gender === 'Male' ? 'active' : ''}`}
                                                onClick={() => setGender('Male')}
                                            >
                                                Male
                                            </button>
                                            <button
                                                type="button"
                                                className={`gender-btn ${gender === 'Female' ? 'active' : ''}`}
                                                onClick={() => setGender('Female')}
                                            >
                                                Female
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Profile Photo <span className="required-note">(required)</span></label>
                                    <div
                                        className={`photo-upload-area ${avatarPreview ? 'has-photo' : ''}`}
                                        onClick={() => fileInputRef.current.click()}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') fileInputRef.current.click();
                                        }}
                                    >
                                        {avatarPreview ? (
                                            <img src={avatarPreview} alt="Preview" className="photo-preview" />
                                        ) : (
                                            <div className="photo-upload-placeholder">
                                                <span className="upload-icon">
                                                    <Camera size={22} />
                                                </span>
                                                <span>Click to upload a photo</span>
                                                <span className="upload-hint">JPG, PNG, WEBP accepted</span>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={handlePhotoChange}
                                    />
                                    {avatarPreview && (
                                        <button
                                            type="button"
                                            className="change-photo-btn"
                                            onClick={() => fileInputRef.current.click()}
                                        >
                                            Change Photo
                                        </button>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>Additional Photos <span className="optional-text">(optional)</span></label>
                                    <div className="additional-photos-container">
                                        {additionalPhotos.map((photo, index) => (
                                            <div key={index} className="additional-photo-wrapper">
                                                <img src={photo} alt={`Additional ${index + 1}`} className="additional-photo-preview" />
                                                <button 
                                                    type="button" 
                                                    className="remove-photo-btn"
                                                    onClick={() => removeAdditionalPhoto(index)}
                                                    title="Remove photo"
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                        ))}
                                        {additionalPhotos.length < 5 && (
                                            <div
                                                className="photo-upload-area mini"
                                                onClick={() => additionalPhotosRef.current.click()}
                                                role="button"
                                                tabIndex={0}
                                            >
                                                <div className="photo-upload-placeholder">
                                                    <span className="upload-icon">+</span>
                                                    <span>Add photo</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        ref={additionalPhotosRef}
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        style={{ display: 'none' }}
                                        onChange={handleAdditionalPhotos}
                                    />
                                    <div className="upload-hint" style={{marginTop: '4px'}}>Add up to 5 additional photos</div>
                                </div>

                                <div className="checkbox-group">
                                    <input
                                        type="checkbox"
                                        id="agree"
                                        checked={agreed}
                                        onChange={(e) => setAgreed(e.target.checked)}
                                    />
                                    <label htmlFor="agree">
                                        I confirm that I am at least 18 years old and am officially enrolled at De La Salle Lipa.
                                    </label>
                                </div>
                            </>
                        )}

                        <button type="submit" className="primary-btn">
                            {isLogin ? 'Login' : 'Register'}
                        </button>
                    </form>

                    <div className="toggle-mode">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button type="button" className="link-btn" onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                        }}>
                            {isLogin ? 'Sign up' : 'Back to login'}
                        </button>
                    </div>
                </div>

                <p className="auth-legal">
                    By continuing, you agree to our{' '}
                    <button type="button" className="legal-link-btn" onClick={() => setIsLegalModalOpen(true)}>
                        Terms of Service and Privacy Policy
                    </button>
                </p>

                <LegalModal 
                    isOpen={isLegalModalOpen} 
                    onClose={() => setIsLegalModalOpen(false)} 
                />
            </div>
        </div>
    );
};

export default Login;
