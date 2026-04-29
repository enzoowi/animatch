import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { MapPin, Calendar, Clock, BookOpen, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import './UpcomingStudySessionsWidget.css';

const UpcomingStudySessionsWidget = () => {
    const { user } = useAuth();
    const { users, studySessions, studyRequests, acceptStudyRequest, declineStudyRequest } = useData();
    const [currentTime, setCurrentTime] = useState(Date.now());

    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(Date.now()), 60000); // update every minute
        return () => clearInterval(interval);
    }, []);

    // Filter sessions involving current user that haven't happened yet (or happened < 1 hour ago)
    const upcomingSessions = studySessions
        .filter(s => s.participants.includes(user.id))
        .filter(s => {
            const sessionTime = new Date(s.scheduledAt).getTime();
            // Show until 1 hour after scheduled start
            return sessionTime + (60 * 60 * 1000) > currentTime;
        })
        .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));

    const myRequests = studyRequests.filter(r => r.fromId === user.id || r.toId === user.id);
    const pendingRequests = myRequests.filter(r => ['pending', 'rescheduled'].includes(r.status));
    const declinedRequests = myRequests.filter(r => r.status === 'declined');

    if (upcomingSessions.length === 0 && pendingRequests.length === 0 && declinedRequests.length === 0) {
        return (
            <div className="uss-widget uss-fullwidth">
                <div className="uss-empty-state">
                    <BookOpen size={32} />
                    <p>No study sessions or requests yet.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="uss-widget uss-fullwidth">
            <h3 className="uss-title">
                <BookOpen size={16} /> Managed Study Sessions
            </h3>

            {pendingRequests.length > 0 && (
                <div className="uss-section">
                    <h4 className="uss-subtitle">Pending Requests</h4>
                    <div className="uss-list">
                        {pendingRequests.map(req => {
                            const isSender = req.fromId === user.id;
                            const partnerId = isSender ? req.toId : req.fromId;
                            const partner = users.find(u => u.id === partnerId);
                            if (!partner) return null;

                            return (
                                <div key={req.id} className="uss-card uss-pending-card">
                                    <img src={partner.avatar} alt={partner.name} className="uss-avatar" />
                                    <div className="uss-info">
                                        <span className="uss-partner-name">{isSender ? 'Sent to' : 'From'}: {partner.name}</span>
                                        <span className="uss-subject">{req.subject} • {req.studyType}</span>
                                        <div className="uss-meta">
                                            <span className="uss-meta-item"><Calendar size={12} /> {req.date}</span>
                                            <span className="uss-meta-item"><Clock size={12} /> {req.time}</span>
                                        </div>
                                    </div>
                                    <div className="uss-actions-container">
                                        <span className="uss-status-badge pending">Pending</span>
                                        {!isSender && (
                                            <div className="uss-action-buttons">
                                                <button className="uss-btn-accept" onClick={() => acceptStudyRequest(req.id)}>
                                                    <CheckCircle size={14} /> Accept
                                                </button>
                                                <button className="uss-btn-decline" onClick={() => declineStudyRequest(req.id)}>
                                                    <XCircle size={14} /> Reject
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {upcomingSessions.length > 0 && (
                <div className="uss-section">
                    <h4 className="uss-subtitle">Accepted / Upcoming Sessions</h4>
                    <div className="uss-list">
                        {upcomingSessions.map(session => {
                            const partnerId = session.participants.find(id => id !== user.id);
                            const partner = users.find(u => u.id === partnerId);
                            if (!partner) return null;

                            const dateObj = new Date(session.scheduledAt);
                            const isToday = dateObj.toDateString() === new Date().toDateString();

                            const timeDiff = dateObj.getTime() - currentTime;
                            let countdownStr = '';

                            if (timeDiff <= 0) {
                                countdownStr = 'Happening Now';
                            } else {
                                const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
                                const hours = Math.floor((timeDiff / (1000 * 60 * 60)) % 24);
                                const mins = Math.floor((timeDiff / (1000 * 60)) % 60);

                                if (days > 0) countdownStr = `In ${days}d ${hours}h`;
                                else if (hours > 0) countdownStr = `In ${hours}h ${mins}m`;
                                else countdownStr = `In ${mins}m`;
                            }

                            return (
                                <div key={session.id} className="uss-card">
                                    <img src={partner.avatar} alt={partner.name} className="uss-avatar" />
                                    <div className="uss-info">
                                        <span className="uss-partner-name">{partner.name}</span>
                                        <span className="uss-subject">{session.subject} • {session.studyType}</span>
                                        <div className="uss-meta">
                                            <span className="uss-meta-item">
                                                <Calendar size={12} /> {isToday ? 'Today' : dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                            </span>
                                            <span className="uss-meta-item">
                                                <Clock size={12} /> {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <span className="uss-meta-item uss-meta-location" title={session.location}>
                                                <MapPin size={12} /> {session.location}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="uss-actions-container">
                                        <span className="uss-status-badge accepted">Accepted</span>
                                        <div className={`uss-countdown ${timeDiff <= 0 ? 'uss-now' : ''}`}>
                                            {countdownStr}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {declinedRequests.length > 0 && (
                <div className="uss-section">
                    <h4 className="uss-subtitle">Declined Requests</h4>
                    <div className="uss-list">
                        {declinedRequests.map(req => {
                            const partnerId = req.fromId === user.id ? req.toId : req.fromId;
                            const partner = users.find(u => u.id === partnerId);
                            if (!partner) return null;

                            return (
                                <div key={req.id} className="uss-card uss-declined-card">
                                    <img src={partner.avatar} alt={partner.name} className="uss-avatar" style={{ filter: 'grayscale(1)' }} />
                                    <div className="uss-info" style={{ opacity: 0.7 }}>
                                        <span className="uss-partner-name">{partner.name}</span>
                                        <span className="uss-subject">{req.subject}</span>
                                    </div>
                                    <div className="uss-actions-container">
                                        <span className="uss-status-badge declined"><AlertCircle size={12} /> Rejected</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UpcomingStudySessionsWidget;
