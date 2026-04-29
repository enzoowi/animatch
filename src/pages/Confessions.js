import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { KeyRound, Heart, MessageCircle } from 'lucide-react';
import './Confessions.css';

const Confessions = ({ setCurrentView, setSelectedChat }) => {
    const { user } = useAuth();
    const { users, confessions, addConfession, matches, addMatch } = useData();

    const [selectedUser, setSelectedUser] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // People you can confess to (excluding yourself and already confessed)
    const availableUsers = users.filter(u =>
        u.id !== user.id &&
        !confessions.some(c => c.fromId === user.id && c.toId === u.id)
    );

    // Confessions that involved you and resulted in a mutual match
    const mutualConfessions = confessions.filter(c =>
        (c.fromId === user.id || c.toId === user.id) && c.revealed
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedUser) return;

        const newConfession = {
            id: `c${Date.now()}`,
            fromId: user.id,
            toId: selectedUser,
            timestamp: new Date().toISOString(),
        };

        const isMatch = addConfession(newConfession);

        if (isMatch) {
            const matchedUser = users.find(u => u.id === selectedUser);
            setSuccessMsg(`Wow! It's mutual! Both you and ${matchedUser.name} submitted a confession.`);
        } else {
            setSuccessMsg('Confession sent securely. They will only know if they confess to you too!');
        }

        setSelectedUser('');
        setTimeout(() => setSuccessMsg(''), 5000);
    };

    return (
        <div className="confessions-container">
            <div className="confessions-header">
                <h1>
                    <KeyRound size={22} className="confessions-icon" /> Secret Confession Bridge
                </h1>
                <p>Submit an anonymous crush. If they also submit your name, the system will reveal the match! Otherwise, it remains a secret forever.</p>
            </div>

            <div className="confession-card">
                <h3>Submit a Confession</h3>

                {successMsg && (
                    <div className={`status-message ${successMsg.includes('mutual') ? 'mutual' : 'sent'}`}>
                        {successMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="confession-form">
                    <div className="form-group">
                        <label>Select a DLSL Student</label>
                        <select
                            value={selectedUser}
                            onChange={(e) => setSelectedUser(e.target.value)}
                            required
                        >
                            <option value="">-- Choose someone --</option>
                            {availableUsers.map(u => (
                                <option key={u.id} value={u.id}>{u.name} ({u.course})</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="primary-btn submit-confession">
                        Send Secretly
                    </button>
                </form>
            </div>

            <div className="mutual-confessions-area">
                <h3>Mutual Confessions (Revealed)</h3>
                {mutualConfessions.length > 0 ? (
                    <div className="mutual-grid">
                        {mutualConfessions.map(c => {
                            // Find the other person
                            const otherId = c.fromId === user.id ? c.toId : c.fromId;
                            const otherUser = users.find(u => u.id === otherId);

                            // To prevent duplicate rendering (since mutual has two entries), just show unique matches
                            // We'll filter unique below or just render them. Since we only want one card per mutual pair,
                            // we ensure we only render if we are the fromId for uniqueness in mapping.
                            if (c.fromId !== user.id) return null;

                            const handleMessageMutual = () => {
                                // Find existing match or create one
                                let match = matches.find(m =>
                                    m.users.includes(user.id) && m.users.includes(otherId)
                                );
                                if (!match) {
                                    match = {
                                        id: `m${Date.now()}`,
                                        users: [user.id, otherId],
                                        timestamp: new Date().toISOString(),
                                    };
                                    addMatch(match);
                                }
                                setSelectedChat(match);
                                setCurrentView('chat');
                            };

                            return (
                                <div key={c.id} className="mutual-card">
                                    <div className="mutual-avatar-group">
                                        <img src={user.avatar || `https://i.pravatar.cc/150?u=${user.id}`} alt="You" />
                                        <span className="heart-icon">
                                            <Heart size={18} />
                                        </span>
                                        <img src={otherUser?.avatar || `https://i.pravatar.cc/150?u=${otherUser?.id}`} alt={otherUser?.name} />
                                    </div>
                                    <p>You and <strong>{otherUser?.name}</strong> confessed to each other!</p>
                                    <button
                                        type="button"
                                        className="mutual-message-btn"
                                        onClick={handleMessageMutual}
                                    >
                                        <MessageCircle size={16} />
                                        Message {otherUser?.name?.split(' ')[0]}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="empty-state mini">
                        <p>No mutual confessions revealed yet. take a leap of faith!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Confessions;
