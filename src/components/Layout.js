import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Heart, Bell, Menu, X, BookOpen, Clock, Calendar, KeyRound, MessageCircle } from 'lucide-react';
import Sidebar from './Sidebar';
import logo from '../assets/animatch-logo.png';
import './Layout.css';

const Layout = ({ children, currentView, setCurrentView }) => {
    const { user } = useAuth();
    const { notifications, markNotificationsRead } = useData();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);

    const userNotifications = notifications.filter(n => n.toId === user?.id);
    const unreadCount = userNotifications.filter(n => !n.read).length;

    return (
        <div className="app-shell">
            <header className="topbar">
                <div className="topbar-inner">
                    <div className="topbar-left">
                        <button
                            className="topbar-menu-btn"
                            onClick={() => setMobileMenuOpen((v) => !v)}
                            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>

                        <button className="brand" onClick={() => setCurrentView('dashboard')}>
                            <img src={logo} alt="AniMatch Logo" className="brand-mark" />
                            <span className="brand-name">AniMatch</span>
                        </button>
                    </div>

                    <div className="topbar-right">
                        <button
                            className="topbar-bell"
                            aria-label="Notifications"
                            onClick={() => {
                                setNotificationsOpen((open) => !open);
                                if (unreadCount > 0) markNotificationsRead(user?.id);
                            }}
                        >
                            <Bell size={22} />
                            {unreadCount > 0 && (
                                <span className="topbar-bell-badge">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {notificationsOpen && (
                            <div className="notifications-panel" role="dialog" aria-label="Notifications">
                                <div className="notifications-header">
                                    <span>Notifications</span>
                                    <button
                                        className="notifications-close"
                                        onClick={() => setNotificationsOpen(false)}
                                        aria-label="Close notifications"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                                <ul className="notifications-list">
                                    {userNotifications.map((n) => {
                                        let iconBg, iconColor, IconComponent;
                                        switch (n.type) {
                                            case 'match':
                                                iconBg = '#FCE7F3'; iconColor = '#DB2777'; IconComponent = Heart;
                                                break;
                                            case 'confession':
                                                iconBg = '#F3E8FF'; iconColor = '#7C3AED'; IconComponent = KeyRound;
                                                break;
                                            case 'message':
                                                iconBg = '#ECFDF5'; iconColor = '#059669'; IconComponent = MessageCircle;
                                                break;
                                            case 'study_request':
                                                iconBg = '#E3F2FD'; iconColor = '#1565C0'; IconComponent = BookOpen;
                                                break;
                                            case 'study_accepted':
                                                iconBg = '#E3F2FD'; iconColor = '#1565C0'; IconComponent = Calendar;
                                                break;
                                            case 'study_declined':
                                            case 'study_rescheduled':
                                                iconBg = '#E3F2FD'; iconColor = '#1565C0'; IconComponent = Clock;
                                                break;
                                            default:
                                                iconBg = '#F1F5F9'; iconColor = '#64748B'; IconComponent = Bell;
                                        }
                                        return (
                                            <li key={n.id} className={`notification-item ${!n.read ? 'unread' : ''}`} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                                <div style={{ background: iconBg, padding: '8px', borderRadius: '50%', color: iconColor, flexShrink: 0 }}>
                                                    <IconComponent size={16} />
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <p className="notification-title">{n.title}</p>
                                                    <p className="notification-body">{n.body}</p>
                                                    {n.createdAt && (
                                                        <p className="notification-time">
                                                            {new Date(n.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    )}
                                                </div>
                                            </li>
                                        );
                                    })}
                                    {userNotifications.length === 0 && (
                                        <li className="notification-empty">You're all caught up.</li>
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="shell-body">
                <aside className="sidebar-desktop">
                    <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
                </aside>

                {mobileMenuOpen && (
                    <div
                        className="mobile-overlay"
                        onClick={() => setMobileMenuOpen(false)}
                        role="presentation"
                    >
                        <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
                            <div className="mobile-drawer-header">
                                <span className="mobile-drawer-title">Menu</span>
                                <button
                                    className="mobile-drawer-close"
                                    onClick={() => setMobileMenuOpen(false)}
                                    aria-label="Close menu"
                                >
                                    <X size={22} />
                                </button>
                            </div>
                            <Sidebar
                                currentView={currentView}
                                setCurrentView={(view) => {
                                    setCurrentView(view);
                                    setMobileMenuOpen(false);
                                }}
                                isMobile
                            />
                        </div>
                    </div>
                )}

                <main className="shell-main">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
