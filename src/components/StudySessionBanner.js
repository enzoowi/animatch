import React, { useState, useEffect } from 'react';
import { Clock, MapPin, BookOpen, CheckCircle, XCircle, CalendarClock } from 'lucide-react';
import './StudySessionBanner.css';

const formatTimeLeft = (targetDate) => {
    const diff = new Date(targetDate) - new Date();
    if (diff <= 0) return 'Session started';

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / 1000 / 60) % 60);

    if (d > 0) return `In ${d}d ${h}h`;
    if (h > 0) return `In ${h}h ${m}m`;
    return `In ${m}m`;
};

const StudySessionBanner = ({
    session,        // confirmed session object (if accepted)
    request,        // pending request object (if not accepted)
    currentUserId,
    onAccept,
    onDecline,
    onReschedule,
}) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const target = session ? session.scheduledAt : (request ? `${request.date}T${request.time}:00.000Z` : null);
        if (!target) return;

        const updateTimer = () => setTimeLeft(formatTimeLeft(target));
        updateTimer();
        const interval = setInterval(updateTimer, 60000); // update every minute
        return () => clearInterval(interval);
    }, [session, request]);

    // If there's an active confirmed session:
    if (session) {
        return (
            <div className="ss-banner ss-confirmed">
                <div className="ss-banner-content">
                    <div className="ss-banner-details">
                        <span className="ss-banner-title">
                            <BookOpen size={14} /> Confirmed Study Session
                        </span>
                        <span className="ss-banner-info">
                            <strong>{session.subject}</strong> • {session.studyType}
                        </span>
                        <span className="ss-banner-meta">
                            <MapPin size={12} /> {session.location} • <Clock size={12} /> {new Date(session.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                    <div className="ss-banner-countdown">{timeLeft}</div>
                </div>
            </div>
        );
    }

    // If there's a pending request:
    if (request) {
        // Find if current user is the sender or receiver
        const isReceiver = request.toId === currentUserId;
        const isPending = request.status === 'pending';
        const isRescheduled = request.status === 'rescheduled';

        // Base details
        const details = (
            <div className="ss-banner-details">
                <span className="ss-banner-title ss-pending-title">
                    <CalendarClock size={14} /> Study Request {isRescheduled ? '(Rescheduled)' : 'Pending'}
                </span>
                <span className="ss-banner-info">
                    <strong>{request.subject}</strong> • {request.studyType}
                </span>
                <span className="ss-banner-meta">
                    <MapPin size={12} /> {request.location} • {request.date} @ {request.time}
                </span>
                {request.message && <span className="ss-banner-msg">💬 "{request.message}"</span>}
            </div>
        );

        // If I am the receiver and it's pending OR I am not the proposer of a reschedule
        const needsMyAction = (isPending && isReceiver) || (isRescheduled && request.rescheduleProposal?.proposedBy !== currentUserId);

        if (needsMyAction) {
            return (
                <div className="ss-banner ss-actionable">
                    <div className="ss-banner-content">
                        {details}
                        <div className="ss-banner-actions">
                            <button className="ss-action-btn ss-accept" onClick={onAccept}>
                                <CheckCircle size={14} /> Accept
                            </button>
                            <button className="ss-action-btn ss-reschedule" onClick={onReschedule}>
                                <Clock size={14} /> Reschedule
                            </button>
                            <button className="ss-action-btn ss-decline" onClick={onDecline}>
                                <XCircle size={14} /> Decline
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        // Waiting for the other person
        return (
            <div className="ss-banner ss-waiting">
                <div className="ss-banner-content">
                    {details}
                    <div className="ss-banner-status">
                        Awaiting partner's response...
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default StudySessionBanner;
