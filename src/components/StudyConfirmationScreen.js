import React from 'react';
import { Calendar, MessageCircle, Clock, MapPin, BookOpen } from 'lucide-react';
import './StudyConfirmationScreen.css';

const StudyConfirmationScreen = ({ session, partner, onOpenChat, onClose }) => {
    if (!session || !partner) return null;

    const sessionDate = new Date(session.scheduledAt);
    const dateStr = sessionDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
    const timeStr = sessionDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

    const handleAddToCalendar = () => {
        // In a real app, this would generate an .ics file or open Google Calendar
        alert('Added to your calendar!');
    };

    return (
        <div className="scs-overlay" onClick={onClose}>
            <div className="scs-modal" onClick={e => e.stopPropagation()}>
                <div className="scs-success-badge">
                    <span>It's a Study Match!</span>
                </div>

                <div className="scs-photos">
                    <img src={partner.avatar || `https://i.pravatar.cc/150?u=${partner.id}`} alt={partner.name} className="scs-partner-avatar" />
                </div>

                <div className="scs-header">
                    <h2>Study Session Confirmed!</h2>
                    <p>You and {partner.name} are all set to study.</p>
                </div>

                <div className="scs-details-card">
                    <div className="scs-detail-row">
                        <BookOpen size={18} className="scs-detail-icon" />
                        <div className="scs-detail-content">
                            <span className="scs-detail-label">Subject</span>
                            <span className="scs-detail-value">{session.subject} ({session.studyType})</span>
                        </div>
                    </div>

                    <div className="scs-detail-row">
                        <MapPin size={18} className="scs-detail-icon" />
                        <div className="scs-detail-content">
                            <span className="scs-detail-label">Location</span>
                            <span className="scs-detail-value">{session.location}</span>
                        </div>
                    </div>

                    <div className="scs-detail-row">
                        <Calendar size={18} className="scs-detail-icon" />
                        <div className="scs-detail-content">
                            <span className="scs-detail-label">Date & Time</span>
                            <span className="scs-detail-value">{dateStr} at {timeStr}</span>
                        </div>
                    </div>

                    <div className="scs-detail-row">
                        <Clock size={18} className="scs-detail-icon" />
                        <div className="scs-detail-content">
                            <span className="scs-detail-label">Duration</span>
                            <span className="scs-detail-value">
                                {session.duration < 60 ? `${session.duration} minutes` : `${Math.floor(session.duration / 60)}h${session.duration % 60 ? ` ${session.duration % 60}m` : ''}`}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="scs-actions">
                    <button className="scs-btn scs-btn-primary" onClick={onOpenChat}>
                        <MessageCircle size={18} /> Open Chat
                    </button>
                    <button className="scs-btn scs-btn-secondary" onClick={handleAddToCalendar}>
                        <Calendar size={18} /> Add to Calendar
                    </button>
                </div>

                <button className="scs-close-text" onClick={onClose}>
                    Close
                </button>
            </div>
        </div>
    );
};

export default StudyConfirmationScreen;
