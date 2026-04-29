import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Star, X } from 'lucide-react';
import './SessionFeedbackModal.css';

const StarRating = ({ value, onChange, label }) => {
    return (
        <div className="sfm-rating-group">
            <span className="sfm-rating-label">{label}</span>
            <div className="sfm-stars">
                {[1, 2, 3, 4, 5].map(star => (
                    <button
                        type="button"
                        key={star}
                        className={`sfm-star-btn ${star <= value ? 'active' : ''}`}
                        onClick={() => onChange(star)}
                    >
                        <Star size={24} fill={star <= value ? '#F59E0B' : 'transparent'} stroke={star <= value ? '#F59E0B' : '#CBD5E1'} />
                    </button>
                ))}
            </div>
            <span className="sfm-rating-val">{value} / 5</span>
        </div>
    );
};

const SessionFeedbackModal = ({ isOpen, onClose, session, partner }) => {
    const { user } = useAuth();
    const { submitFeedback } = useData();

    const [productivity, setProductivity] = useState(0);
    const [partnerComm, setPartnerComm] = useState(0);
    const [submitted, setSubmitted] = useState(false);

    if (!isOpen || !session || !partner) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (productivity === 0 || partnerComm === 0) return;

        submitFeedback({
            sessionId: session.id,
            raterId: user.id,
            productivity,
            partnerComm,
        });
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="sfm-overlay" onClick={onClose}>
                <div className="sfm-modal sfm-success" onClick={e => e.stopPropagation()}>
                    <div className="sfm-success-icon">🌟</div>
                    <h2>Thank You!</h2>
                    <p>Your feedback helps keep the AniMatch community safe and productive.</p>
                    <button className="sfm-primary-btn" onClick={onClose}>Close</button>
                </div>
            </div>
        );
    }

    return (
        <div className="sfm-overlay" onClick={onClose}>
            <div className="sfm-modal" onClick={e => e.stopPropagation()}>
                <div className="sfm-header">
                    <h2>Session Feedback</h2>
                    <button className="sfm-close" onClick={onClose} aria-label="Close">
                        <X size={18} />
                    </button>
                </div>

                <div className="sfm-body">
                    <p className="sfm-prompt">
                        How was your <strong>{session.subject}</strong> study session with <strong>{partner.name}</strong>?
                    </p>

                    <form className="sfm-form" onSubmit={handleSubmit}>
                        <StarRating
                            label="Was the session productive?"
                            value={productivity}
                            onChange={setProductivity}
                        />

                        <StarRating
                            label="Did your partner communicate well?"
                            value={partnerComm}
                            onChange={setPartnerComm}
                        />

                        <div className="sfm-note">
                            <strong>Note:</strong> Ratings directly affect user Green Flag Scores. Be honest and fair.
                        </div>

                        <div className="sfm-actions">
                            <button
                                type="submit"
                                className="sfm-primary-btn"
                                disabled={productivity === 0 || partnerComm === 0}
                            >
                                Submit Feedback
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SessionFeedbackModal;
