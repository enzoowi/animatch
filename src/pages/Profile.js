import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Pencil, BookOpen, Clock, MapPin, Plus, X, Camera } from 'lucide-react';
import './Profile.css';

const tierColors = {
    Elite: '#a855f7',
    Gold: '#f59e0b',
    Silver: '#94a3b8',
    Bronze: '#b45309',
};

const Profile = () => {
    const { user, updateProfile } = useAuth();
    const { users, studySessions, greenFlagScores } = useData();

    const [isEditing, setIsEditing] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const fileInputRef = useRef(null);
    const avatarInputRef = useRef(null);

    const compressImage = (dataUrl, maxPx = 600, quality = 0.6) =>
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

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const compressed = await compressImage(reader.result);
                const currentPhotos = user.additionalPhotos || user.extraPhotos || [];
                const updatedPhotos = [...currentPhotos, compressed];
                updateProfile({ additionalPhotos: updatedPhotos, extraPhotos: updatedPhotos });
            };
            reader.readAsDataURL(file);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleAvatarSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const compressed = await compressImage(reader.result, 200);
                updateProfile({ avatar: compressed });
            };
            reader.readAsDataURL(file);
        }
        if (avatarInputRef.current) {
            avatarInputRef.current.value = '';
        }
    };
    const [form, setForm] = useState(() => ({
        name: user?.name || '',
        age: user?.age || '',
        gender: user?.gender || '',
        course: user?.course || '',
        year: user?.year || '',
        intent: user?.intent || '',
        bio: user?.bio || '',
        interests: user?.interests ? user.interests.join(', ') : '',
        subjects: user?.subjects ? user.subjects.join(', ') : '',
        gpaGoal: user?.gpaGoal || '',
    }));

    if (!user) return null;

    // Academic Data
    const academicRep = greenFlagScores[user.id] || { score: user.reputationScore, label: user.reputationTier };

    // Find next upcoming session
    const upcomingSession = studySessions
        .filter(s => s.participants.includes(user.id))
        .filter(s => new Date(s.scheduledAt).getTime() > Date.now())
        .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))[0];

    const partner = upcomingSession
        ? users.find(u => u.id === upcomingSession.participants.find(id => id !== user.id))
        : null;

    const tierColor = tierColors[academicRep.label] || tierColors[user.reputationTier] || '#94a3b8';

    const handleChange = (field) => (e) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        const updates = {
            ...user,
            name: form.name.trim(),
            age: form.age ? parseInt(form.age, 10) : undefined,
            gender: form.gender,
            course: form.course,
            year: form.year ? parseInt(form.year, 10) : undefined,
            intent: form.intent || null,
            bio: form.bio,
            interests: form.interests
                ? form.interests.split(',').map((i) => i.trim()).filter(Boolean)
                : [],
            subjects: form.subjects
                ? form.subjects.split(',').map((s) => s.trim()).filter(Boolean)
                : [],
            gpaGoal: form.gpaGoal,
        };
        updateProfile(updates);
        setIsEditing(false);
    };

    return (
        <div className="profile-page">
            <div className="profile-page-card">
                {/* Avatar & basic identity */}
                <div className="profile-page-avatar-wrap">
                    <div className="profile-page-avatar-container" onClick={() => avatarInputRef.current?.click()} title="Change Profile Photo">
                        <img
                            src={user.avatar || `https://i.pravatar.cc/150?u=${user.id}`}
                            alt={user.name}
                            className="profile-page-avatar"
                        />
                        <div className="profile-avatar-overlay">
                            <Camera size={24} color="#ffffff" />
                        </div>
                    </div>
                    <input 
                        type="file" 
                        accept="image/*" 
                        ref={avatarInputRef} 
                        onChange={handleAvatarSelect} 
                        style={{ display: 'none' }} 
                    />
                    <div className="profile-page-tier-badge" style={{ background: tierColor }}>
                        {academicRep.label} · {academicRep.score}
                    </div>
                </div>

                <div className="profile-page-header-row">
                    <div className="profile-page-info">
                        <h1 className="profile-page-name">{user.name}</h1>
                        <p className="profile-page-meta">
                            {user.age && <span>{user.age} yrs</span>}
                            {user.gender && <span> · {user.gender}</span>}
                            {user.course && <span> · {user.course}</span>}
                            {user.year && <span> · Year {user.year}</span>}
                        </p>
                        <p className="profile-page-email">{user.email}</p>
                    </div>
                    <button
                        type="button"
                        className="profile-edit-btn"
                        onClick={() => {
                            setForm({
                                name: user.name || '',
                                age: user.age || '',
                                gender: user.gender || '',
                                course: user.course || '',
                                year: user.year || '',
                                intent: user.intent || '',
                                bio: user.bio || '',
                                interests: user.interests ? user.interests.join(', ') : '',
                                subjects: user.subjects ? user.subjects.join(', ') : '',
                                gpaGoal: user.gpaGoal || '',
                            });
                            setIsEditing(true);
                        }}
                        aria-label="Edit profile"
                    >
                        <Pencil size={18} />
                    </button>
                </div>

                {!isEditing && (
                    <>
                        {upcomingSession && partner && (
                            <div className="profile-page-section" style={{ background: '#F8FAFC', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #1565C0' }}>
                                <h3 style={{ color: '#1565C0', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 12px 0' }}>
                                    <BookOpen size={16} /> Upcoming Study Session
                                </h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <img src={partner.avatar} alt={partner.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <strong style={{ fontSize: '14px', color: '#1e293b' }}>{upcomingSession.subject} with {partner.name}</strong>
                                        <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#64748b' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {new Date(upcomingSession.scheduledAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> {upcomingSession.location}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {user.intent && (
                            <div className="profile-page-section">
                                <h3>Looking for</h3>
                                <span className="intent-pill">{user.intent}</span>
                            </div>
                        )}

                        {user.bio && (
                            <div className="profile-page-section">
                                <h3>About Me</h3>
                                <p className="profile-page-bio">"{user.bio}"</p>
                            </div>
                        )}

                        {user.interests?.length > 0 && (
                            <div className="profile-page-section">
                                <h3>Interests</h3>
                                <div className="profile-tags">
                                    {user.interests.map((i) => (
                                        <span key={i} className="profile-tag">
                                            {i}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {user.subjects?.length > 0 && (
                            <div className="profile-page-section">
                                <h3>Enrolled Subjects</h3>
                                <div className="profile-tags">
                                    {user.subjects.map((s) => (
                                        <span key={s} className="profile-tag subject">
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {user.gpaGoal && (
                            <div className="profile-page-section">
                                <h3>Target GPA</h3>
                                <span className="profile-gpa">{user.gpaGoal}</span>
                            </div>
                        )}

                        <div className="profile-page-section">
                            <h3>Additional Photos</h3>
                            <div className="profile-additional-photos">
                                {(user.additionalPhotos || user.extraPhotos || []).map((photo, index) => (
                                    <img 
                                        key={index} 
                                        src={photo} 
                                        alt={`Additional ${index + 1}`} 
                                        className="profile-additional-photo clickable" 
                                        onClick={() => setSelectedPhoto(photo)}
                                    />
                                ))}
                                <div className="profile-add-photo-btn" onClick={() => fileInputRef.current?.click()}>
                                    <Plus size={24} color="#64748b" />
                                </div>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    ref={fileInputRef} 
                                    onChange={handleFileSelect} 
                                    style={{ display: 'none' }} 
                                />
                            </div>
                        </div>
                    </>
                )}

                {isEditing && (
                    <form className="profile-page-form" onSubmit={handleSave}>
                        <div className="profile-page-info">
                            <input
                                className="profile-input name-input"
                                value={form.name}
                                onChange={handleChange('name')}
                                placeholder="Full name"
                                required
                            />
                            <p className="profile-page-meta">
                                <input
                                    className="profile-input meta-input small-input"
                                    type="number"
                                    min="18"
                                    value={form.age}
                                    onChange={handleChange('age')}
                                    placeholder="Age"
                                />
                                <select
                                    className="profile-input meta-input"
                                    value={form.gender}
                                    onChange={handleChange('gender')}
                                >
                                    <option value="">Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </p>
                            <p className="profile-page-meta">
                                <select
                                    className="profile-input meta-input"
                                    value={form.course}
                                    onChange={handleChange('course')}
                                >
                                    <option value="">Course / Program</option>
                                    <option value="AB Communication">AB Communication</option>
                                    <option value="Associate in Computer Technology">Associate in Computer Technology</option>
                                    <option value="Bachelor of Elementary Education">Bachelor of Elementary Education</option>
                                    <option value="Bachelor of Multimedia Arts">Bachelor of Multimedia Arts</option>
                                    <option value="Bachelor of Secondary Education">Bachelor of Secondary Education</option>
                                    <option value="BS Accountancy">BS Accountancy</option>
                                    <option value="BS Accounting Information System">BS Accounting Information System</option>
                                    <option value="BS Architecture">BS Architecture</option>
                                    <option value="BS Biology">BS Biology</option>
                                    <option value="BS Computer Engineering">BS Computer Engineering</option>
                                    <option value="BS Computer Science">BS Computer Science</option>
                                    <option value="BS Electrical Engineering">BS Electrical Engineering</option>
                                    <option value="BS Electronics Engineering">BS Electronics Engineering</option>
                                    <option value="BS Entertainment and Multimedia Computing">BS Entertainment and Multimedia Computing</option>
                                    <option value="BS Entrepreneurship">BS Entrepreneurship</option>
                                    <option value="BS Forensic Science">BS Forensic Science</option>
                                    <option value="BS Hospitality Management">BS Hospitality Management</option>
                                    <option value="BS Industrial Engineering">BS Industrial Engineering</option>
                                    <option value="BS Information Technology">BS Information Technology</option>
                                    <option value="BS Legal Management">BS Legal Management</option>
                                    <option value="BS Management Technology">BS Management Technology</option>
                                    <option value="BS Mathematics">BS Mathematics</option>
                                    <option value="BS Nursing">BS Nursing</option>
                                    <option value="BS Psychology">BS Psychology</option>
                                    <option value="BS Tourism Management">BS Tourism Management</option>
                                    <option value="BSBA Financial Management">BSBA Financial Management</option>
                                    <option value="BSBA Marketing Management">BSBA Marketing Management</option>
                                    <option value="Certificate in Entrepreneurship">Certificate in Entrepreneurship</option>
                                    <option value="Cookery NC II (Culinary Arts)">Cookery NC II (Culinary Arts)</option>
                                    <option value="Juris Doctor">Juris Doctor</option>
                                </select>
                                <input
                                    className="profile-input meta-input small-input"
                                    type="number"
                                    min="1"
                                    max="5"
                                    value={form.year}
                                    onChange={handleChange('year')}
                                    placeholder="Year"
                                />
                            </p>
                        </div>

                        <div className="profile-page-section">
                            <h3>Looking for</h3>
                            <select
                                className="profile-input"
                                value={form.intent}
                                onChange={handleChange('intent')}
                            >
                                <option value="">Select intent</option>
                                <option value="Serious relationship">Serious Relationship</option>
                                <option value="Casual dating">Casual Dating</option>
                                <option value="Study buddy">Study Buddy</option>
                                <option value="Event companion">Event Companion</option>
                            </select>
                        </div>

                        <div className="profile-page-section">
                            <h3>About Me</h3>
                            <textarea
                                className="profile-textarea"
                                rows="3"
                                value={form.bio}
                                onChange={handleChange('bio')}
                                placeholder="Add a short bio so others can get to know you."
                            />
                        </div>

                        <div className="profile-page-section">
                            <h3>Interests</h3>
                            <input
                                className="profile-input"
                                value={form.interests}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        interests: e.target.value.toLowerCase(),
                                    }))
                                }
                                placeholder="Comma separated, e.g. basketball, anime, photography"
                            />
                        </div>

                        <div className="profile-page-section">
                            <h3>Enrolled Subjects</h3>
                            <input
                                className="profile-input"
                                value={form.subjects}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        subjects: e.target.value.toUpperCase(),
                                    }))
                                }
                                placeholder="Comma separated subject codes"
                            />
                        </div>

                        <div className="profile-page-section">
                            <h3>Target GPA (4.00–1.00)</h3>
                            <input
                                className="profile-input small-input"
                                value={form.gpaGoal}
                                inputMode="decimal"
                                onChange={(e) => {
                                    const raw = e.target.value.replace(/[^0-9.]/g, '');
                                    const parts = raw.split('.');
                                    if (parts.length > 2) return;
                                    const normalized =
                                        parts[0].slice(0, 1) +
                                        (parts[1] !== undefined ? '.' + parts[1].slice(0, 2) : '');
                                    setForm((prev) => ({ ...prev, gpaGoal: normalized }));
                                }}
                                onBlur={() => {
                                    if (!form.gpaGoal) return;
                                    const num = parseFloat(form.gpaGoal);
                                    if (Number.isNaN(num)) {
                                        setForm((prev) => ({ ...prev, gpaGoal: '' }));
                                        return;
                                    }
                                    const clamped = Math.min(4, Math.max(1, num));
                                    setForm((prev) => ({ ...prev, gpaGoal: clamped.toFixed(2) }));
                                }}
                                placeholder="e.g. 3.25"
                            />
                        </div>

                        <div className="profile-form-actions">
                            <button
                                type="button"
                                className="btn-outline profile-cancel-btn"
                                onClick={() => setIsEditing(false)}
                            >
                                Cancel
                            </button>
                            <button type="submit" className="primary-btn profile-save-btn">
                                Save Changes
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {selectedPhoto && (
                <div className="profile-photo-modal" onClick={() => setSelectedPhoto(null)}>
                    <div className="profile-photo-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="profile-photo-modal-close" onClick={() => setSelectedPhoto(null)}>
                            <X size={24} />
                        </button>
                        <img src={selectedPhoto} alt="Full screen" className="profile-photo-modal-img" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
