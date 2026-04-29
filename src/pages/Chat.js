import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import ReportModal from '../components/ReportModal';
import StudySessionBanner from '../components/StudySessionBanner';
import StudyConfirmationScreen from '../components/StudyConfirmationScreen';
import RescheduleModal from '../components/RescheduleModal';
import { AlertTriangle } from 'lucide-react';
import './Chat.css';

const Chat = ({ currentMatch, setCurrentView }) => {
    const { user } = useAuth();
    const {
        users, messages, sendMessage, reportUser,
        getStudyRequestsBetween, getSessionForMatch,
        acceptStudyRequest, declineStudyRequest
    } = useData();
    const [inputText, setInputText] = useState('');
    const [reportPopup, setReportPopup] = useState(false);

    // Academic Mode Modals
    const [confirmationSession, setConfirmationSession] = useState(null);
    const [rescheduleRequest, setRescheduleRequest] = useState(null);

    const messagesEndRef = useRef(null);

    if (!currentMatch) {
        return (
            <div className="chat-container">
                <div className="chat-header">
                    <div className="chat-header-info">
                        <div className="chat-title">
                            <h3>Messages</h3>
                            <span className="course-micro">No active conversation selected</span>
                        </div>
                    </div>
                </div>
                <div className="chat-messages">
                    <div className="empty-chat">
                        <p>Select a match from your connections to start a conversation.</p>
                    </div>
                </div>
            </div>
        );
    }

    const otherUserId = currentMatch.users.find(id => id !== user.id);
    const otherUser = users.find(u => u.id === otherUserId);

    const chatMessages = messages
        .filter(msg => msg.matchId === currentMatch.id)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // Academic Data lookups
    const studyRequests = getStudyRequestsBetween(user.id, otherUserId);
    // Find active request (pending or rescheduled)
    const activeRequest = studyRequests.find(r => ['pending', 'rescheduled'].includes(r.status));
    const activeSession = getSessionForMatch(user.id, otherUserId);

    const handleAcceptRequest = () => {
        if (!activeRequest) return;
        const session = acceptStudyRequest(activeRequest.id);
        if (session) setConfirmationSession(session);
    };

    const handleDeclineRequest = () => {
        if (!activeRequest) return;
        declineStudyRequest(activeRequest.id);
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const newMsg = {
            id: `msg${Date.now()}`,
            matchId: currentMatch.id,
            senderId: user.id,
            text: inputText.trim(),
            timestamp: new Date().toISOString(),
            read: false
        };

        sendMessage(newMsg);
        setInputText('');
        scrollToBottom();
    };

    const handleReportSubmit = (reportData) => {
        reportUser({
            ...reportData,
            reporterId: user.id,
            reportedId: otherUser.id,
            timestamp: new Date().toISOString()
        });
        setCurrentView('matches');
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        scrollToBottom();
    }, [chatMessages]);

    return (
        <div className="chat-container">
            <div className="chat-header">
                <button className="back-btn" onClick={() => setCurrentView('matches')}>
                    ← Back
                </button>
                <div className="chat-header-info">
                    <img src={otherUser?.avatar} alt={otherUser?.name} className="chat-avatar" />
                    <div className="chat-title">
                        <h3>{otherUser?.name}</h3>
                        <span className="course-micro">{otherUser?.course}</span>
                    </div>
                </div>
                <button className="report-btn" onClick={() => setReportPopup(true)}>
                    <AlertTriangle size={16} /> Report
                </button>
            </div>

            <StudySessionBanner
                session={activeSession}
                request={activeRequest}
                currentUserId={user.id}
                onAccept={handleAcceptRequest}
                onDecline={handleDeclineRequest}
                onReschedule={() => setRescheduleRequest(activeRequest)}
            />

            <div className="chat-messages">
                {chatMessages.length === 0 ? (
                    <div className="empty-chat">
                        <p>You matched with {otherUser?.name}! Send a message to start.</p>
                    </div>
                ) : (
                    chatMessages.map(msg => {
                        const isMine = msg.senderId === user.id;
                        return (
                            <div key={msg.id} className={`message-bubble-wrapper ${isMine ? 'mine' : 'theirs'}`}>
                                <div className="message-bubble">
                                    {msg.text}
                                </div>
                                <div className="message-meta">
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    {isMine && msg.read && <span className="read-receipt"> • Read</span>}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-area" onSubmit={handleSend}>
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                />
                <button type="submit" className="send-btn" disabled={!inputText.trim()}>
                    Send
                </button>
            </form>

            <ReportModal
                isOpen={reportPopup}
                onClose={() => setReportPopup(false)}
                reportedUser={otherUser}
                onSubmit={handleReportSubmit}
            />

            <StudyConfirmationScreen
                session={confirmationSession}
                partner={otherUser}
                onClose={() => setConfirmationSession(null)}
                onOpenChat={() => setConfirmationSession(null)}
            />

            <RescheduleModal
                isOpen={!!rescheduleRequest}
                onClose={() => setRescheduleRequest(null)}
                request={rescheduleRequest}
                targetUser={otherUser}
            />
        </div>
    );
};

export default Chat;
