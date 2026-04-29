import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Heart } from 'lucide-react';
import './Matches.css';

const Matches = ({ setCurrentView, setSelectedChat }) => {
    const { user } = useAuth();
    const { users, matches, messages } = useData();

    // Find all matches for the current user
    const userMatches = matches.filter(m => m.users.includes(user.id));

    const handleOpenChat = (match) => {
        setSelectedChat(match);
        setCurrentView('chat');
    };

    return (
        <div className="matches-container">
            <div className="matches-header">
                <h1>
                    <Heart className="matches-icon" size={22} /> Your Connections
                </h1>
                <p>Start a conversation with your matches.</p>
            </div>

            {userMatches.length === 0 ? (
                <div className="empty-state">
                    <h3>No matches yet!</h3>
                    <p>Keep swiping in the dashboard or send an anonymous confession to find your match.</p>
                </div>
            ) : (
                <div className="matches-grid">
                    {userMatches.map(match => {
                        const otherUserId = match.users.find(id => id !== user.id);
                        const otherUser = users.find(u => u.id === otherUserId);

                        // Get latest message
                        const chatMessages = messages.filter(
                            msg => msg.matchId === match.id
                        ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

                        const lastMessage = chatMessages[chatMessages.length - 1];

                        return (
                            <div
                                key={match.id}
                                className="match-card"
                                onClick={() => handleOpenChat(match)}
                            >
                                <img src={otherUser.avatar} alt={otherUser.name} className="match-avatar" />
                                <div className="match-info">
                                    <h4>{otherUser.name}</h4>
                                    <p className="last-message">
                                        {lastMessage
                                            ? `${lastMessage.senderId === user.id ? 'You: ' : ''}${lastMessage.text}`
                                            : 'Say hi!'}
                                    </p>
                                </div>
                                <div className="match-status">
                                    {lastMessage && lastMessage.senderId !== user.id && !lastMessage.read && (
                                        <span className="unread-dot"></span>
                                    )}
                                    <span className="match-date">
                                        {new Date(match.timestamp).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Matches;
