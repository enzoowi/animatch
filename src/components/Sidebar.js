import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, MessageCircle, MessageSquare, User, Shield, BookOpen } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ currentView, setCurrentView, isMobile = false }) => {
    const { user, logout } = useAuth();

    const isAdmin = user?.role === 'admin';

    const menuItems = isAdmin
        ? [{ id: 'admin', label: 'Admin Panel', Icon: Shield }]
        : [
            { id: 'dashboard', label: 'Discover', Icon: LayoutDashboard },
            { id: 'matches', label: 'Matches', Icon: Users },
            { id: 'chat', label: 'Chat', Icon: MessageCircle },
            { id: 'study-sessions', label: 'Study Sessions', Icon: BookOpen },
            { id: 'confessions', label: 'Confessions', Icon: MessageSquare },
            { id: 'profile', label: 'Profile', Icon: User },
            { id: 'admin', label: 'Admin Panel', Icon: Shield },
        ].filter(item => item.id !== 'admin' || user?.role === 'admin');

    return (
        <div className={`sidebar ${isMobile ? 'sidebar-mobile' : ''}`}>
            <nav className="sidebar-nav" aria-label="Primary">
                {menuItems.map(item => {
                    const active = currentView === item.id;
                    const Icon = item.Icon;
                    return (
                        <button
                            key={item.id}
                            className={`menu-item ${active ? 'active' : ''}`}
                            onClick={() => setCurrentView(item.id)}
                        >
                            <Icon className="menu-icon" size={20} />
                            <span className="menu-label">{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="sidebar-footer">
                <div className="user-info">
                    {isAdmin ? (
                        <div className="user-avatar admin-avatar-placeholder">
                            <Shield size={20} />
                        </div>
                    ) : (
                        <img
                            src={user?.avatar || 'https://via.placeholder.com/40'}
                            alt="Avatar"
                            className="user-avatar"
                        />
                    )}
                    <div className="user-details">
                        <span className="user-name">{user?.name}</span>
                        <span className="user-score">{isAdmin ? 'Administrator' : user?.reputationTier}</span>
                    </div>
                </div>
                <button className="logout-btn" onClick={logout}>Logout</button>
            </div>
        </div>
    );
};

export default Sidebar;
