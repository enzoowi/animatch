import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import ReportModal from '../components/ReportModal';
import StudyRequestModal from '../components/StudyRequestModal';
import SessionFeedbackModal from '../components/SessionFeedbackModal';
import AcademicModeIndicator from '../components/AcademicModeIndicator';
import { Heart, BookOpen, AlertTriangle, X, PartyPopper } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useAuth();
    const { users, matches, likes, likeUser, reportUser, studySessions } = useData();

    const [mode, setMode] = useState('romantic'); // 'romantic' or 'academic'
    const [passedRomantic, setPassedRomantic] = useState([]);
    const [passedAcademic, setPassedAcademic] = useState([]);
    const [matchPopup, setMatchPopup] = useState(null);
    const [reportPopup, setReportPopup] = useState(false);
    const [lightboxSrc, setLightboxSrc] = useState(null);
    const [studyModalOpen, setStudyModalOpen] = useState(false);
    const [feedbackSession, setFeedbackSession] = useState(null);

    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') setLightboxSrc(null); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    // Check for past study sessions needing feedback
    useEffect(() => {
        const checkFeedback = () => {
            if (feedbackSession) return; // already showing one
            const now = Date.now();
            const session = studySessions.find(s =>
                s.participants.includes(user.id) &&
                !s.feedbackSubmitted?.includes(user.id) &&
                new Date(s.scheduledAt).getTime() + (s.duration * 60000) < now
            );
            if (session) {
                setFeedbackSession(session);
            }
        };
        checkFeedback();
        const interval = setInterval(checkFeedback, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [studySessions, user.id, feedbackSession]);

    const getCommonSubjects = (userA, userB) => {
        if (!userA.subjects || !userB.subjects) return [];
        return userA.subjects.filter(s => userB.subjects.includes(s));
    };

    // Filter profiles to show (opposite gender for romantic, all for academic)
    const oppositeGender = user.gender === 'Male' ? 'Female' : 'Male';

    const displayProfiles = useMemo(() => {
        const currentPassed = mode === 'academic' ? passedAcademic : passedRomantic;

        let filtered = users.filter(u =>
            u.id !== user.id &&
            u.role !== 'admin' &&
            (mode === 'academic' || u.gender === oppositeGender) &&
            !currentPassed.includes(u.id) &&
            (mode === 'academic' ? true : (!likes.some(l => l.from === user.id && l.to === u.id) && !matches.some(m => m.users.includes(user.id) && m.users.includes(u.id))))
        );

        if (mode === 'academic') {
            // Sort by number of common subjects
            filtered = filtered.sort((a, b) => {
                const commonA = getCommonSubjects(user, a).length;
                const commonB = getCommonSubjects(user, b).length;
                return commonB - commonA; // Descending
            });
        }

        return filtered;
    }, [users, user, passedAcademic, passedRomantic, likes, matches, mode, oppositeGender]);

    const handleAction = (profileId, action) => {
        if (action === 'pass') {
            if (mode === 'academic') {
                setPassedAcademic(prev => [...prev, profileId]);
            } else {
                setPassedRomantic(prev => [...prev, profileId]);
            }
        } else if (action === 'like') {
            if (mode === 'academic') {
                setStudyModalOpen(true);
            } else {
                const result = likeUser(user.id, profileId);
                if (result.isMatch) {
                    const matchedProfile = users.find(u => u.id === profileId);
                    setMatchPopup(matchedProfile);
                }
            }
        }
    };

    const currentProfile = displayProfiles[0];

    const handleReportSubmit = (reportData) => {
        reportUser({
            ...reportData,
            reporterId: user.id,
            reportedId: currentProfile.id,
            timestamp: new Date().toISOString()
        });

        // After reporting, we pass them automatically
        handleAction(currentProfile.id, 'pass');
    };

    return (
        <div className={`dashboard-container ${mode}`}>
            <div className="mode-toggle">
                <button
                    className={`toggle-btn ${mode === 'romantic' ? 'active' : ''}`}
                    onClick={() => setMode('romantic')}
                >
                    <Heart className="toggle-icon" size={16} />
                    Romantic Mode
                </button>
                <button
                    className={`toggle-btn ${mode === 'academic' ? 'active' : ''}`}
                    onClick={() => setMode('academic')}
                >
                    <BookOpen className="toggle-icon" size={16} />
                    Academic Mode
                </button>
            </div>

            {mode === 'academic' && <AcademicModeIndicator />}

            <div className="cards-area">
                {currentProfile ? (
                    <div className="profile-card">
                        <div className="profile-image-container">
                            <img
                                src={currentProfile.avatar}
                                alt={currentProfile.name}
                                className="profile-image clickable-image"
                                onClick={() => setLightboxSrc(currentProfile.avatar)}
                                title="Click to view full photo"
                            />
                            <div className="rep-badge">
                                {currentProfile.reputationTier} ({currentProfile.reputationScore})
                            </div>
                        </div>

                        <div className="profile-info">
                            <div className="profile-header-row">
                                <div>
                                    <h2>{currentProfile.name}, {currentProfile.age}</h2>
                                    <span className="course-badge">{currentProfile.course} • Yr {currentProfile.year}</span>
                                </div>
                                <button
                                    className="report-icon-btn"
                                    onClick={() => setReportPopup(true)}
                                    title="Report User"
                                >
                                    <AlertTriangle size={20} />
                                </button>
                            </div>

                            <div className="profile-intent">
                                Looking for: <strong>{currentProfile.intent}</strong>
                            </div>

                            {mode === 'academic' && (
                                <div className="academic-highlights">
                                    <div className="highlight">
                                        <span>Common Subjects:</span>
                                        <div className="tags">
                                            {getCommonSubjects(user, currentProfile).length > 0 ? (
                                                getCommonSubjects(user, currentProfile).map(sub =>
                                                    <span key={sub} className="tag subject match">{sub}</span>
                                                )
                                            ) : (
                                                <span className="tag empty">None</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="highlight">
                                        <span>GPA Goal:</span>
                                        <strong>{currentProfile.gpaGoal || 'Not set'}</strong>
                                    </div>
                                </div>
                            )}

                            <div className="bio-section">
                                <p>"{currentProfile.bio}"</p>
                            </div>

                            <div className="interests-section">
                                <span>Interests:</span>
                                <div className="tags">
                                    {currentProfile.interests?.map(i => <span key={i} className="tag">{i}</span>)}
                                </div>
                            </div>

                            {mode !== 'academic' && currentProfile.subjects?.length > 0 && (
                                <div className="interests-section">
                                    <span>Enrolled:</span>
                                    <div className="tags">
                                        {currentProfile.subjects?.map(s => <span key={s} className="tag subject">{s}</span>)}
                                    </div>
                                </div>
                            )}

                            {(currentProfile.additionalPhotos?.length > 0 || currentProfile.extraPhotos?.length > 0) && (
                                <div className="additional-photos-section">
                                    <span>Additional Photos:</span>
                                    <div className="additional-photos-grid">
                                        {(currentProfile.additionalPhotos || currentProfile.extraPhotos || []).map((photo, index) => (
                                            <img
                                                key={index}
                                                src={photo}
                                                alt={`${currentProfile.name} additional ${index + 1}`}
                                                className="additional-photo-thumbnail clickable-image"
                                                onClick={() => setLightboxSrc(photo)}
                                                title="Click to view full photo"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="action-buttons">
                            <button className="action-btn pass" onClick={() => handleAction(currentProfile.id, 'pass')}>
                                <X size={16} /> Pass
                            </button>
                            <button className="action-btn like" onClick={() => handleAction(currentProfile.id, 'like')}>
                                {mode === 'academic' ? (
                                    <>
                                        <BookOpen size={16} /> <span>Send Study Request</span>
                                    </>
                                ) : (
                                    <>
                                        <Heart size={16} /> <span>Like</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="empty-state">
                        <h3>No more profiles found</h3>
                        <p>You've caught up with everyone currently on AniMatch.</p>
                    </div>
                )}
            </div>

            <StudyRequestModal
                isOpen={studyModalOpen}
                onClose={(requestSent) => {
                    setStudyModalOpen(false);
                    if (requestSent === true && currentProfile) {
                        // Mark as passed so they disappear from the stack and user can keep swiping
                        setPassedAcademic(prev => [...prev, currentProfile.id]);
                    }
                }}
                targetUser={currentProfile}
                sharedSubjects={currentProfile ? getCommonSubjects(user, currentProfile) : []}
            />

            <SessionFeedbackModal
                isOpen={!!feedbackSession}
                onClose={() => setFeedbackSession(null)}
                session={feedbackSession}
                partner={feedbackSession ? users.find(u => u.id === feedbackSession.participants.find(p => p !== user.id)) : null}
            />

            {matchPopup && (
                <div className="modal-overlay">
                    <div className="match-modal">
                        <h2><PartyPopper className="match-icon" size={26} /> It's a Match!</h2>
                        <p>You and {matchPopup.name} have liked each other.</p>
                        <div className="match-images">
                            <img src={user.avatar} alt="You" />
                            <img src={matchPopup.avatar} alt={matchPopup.name} />
                        </div>
                        <button className="primary-btn" onClick={() => setMatchPopup(null)}>
                            Keep Swiping
                        </button>
                    </div>
                </div>
            )}

            <ReportModal
                isOpen={reportPopup}
                onClose={() => setReportPopup(false)}
                reportedUser={currentProfile}
                onSubmit={handleReportSubmit}
            />

            {lightboxSrc && (
                <div className="lightbox-overlay" onClick={() => setLightboxSrc(null)}>
                    <button className="lightbox-close" onClick={() => setLightboxSrc(null)} aria-label="Close">
                        <X size={28} />
                    </button>
                    <img
                        src={lightboxSrc}
                        alt="Full view"
                        className="lightbox-img"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
};

export default Dashboard;
