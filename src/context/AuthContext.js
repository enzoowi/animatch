import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

/** Resolve a stored avatar path to a full URL (matches the same helper in DataContext). */
const normalizeAvatar = (avatar) => {
    if (!avatar) return avatar;
    if (avatar.startsWith('data:') || avatar.startsWith('http')) return avatar;
    const path = avatar.startsWith('/') ? avatar : `/${avatar}`;
    return `${process.env.PUBLIC_URL}${path}`;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // null means not logged in
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Simulated login/register flow
    const login = (userData) => {
        setUser({ ...userData, avatar: normalizeAvatar(userData?.avatar) });
        setIsAuthenticated(true);
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
    };

    const updateProfile = (updates) => {
        setUser((prev) => {
            const updatedUser = { ...prev, ...updates };
            if (updatedUser.id) {
                // Strip base64 image data before persisting to prevent db.json bloat/crash.
                // Images stay in React state for in-session display only.
                const sanitized = { ...updatedUser };
                for (const key of Object.keys(sanitized)) {
                    const val = sanitized[key];
                    if (typeof val === 'string' && val.startsWith('data:image/')) {
                        sanitized[key] = null;
                    } else if (Array.isArray(val)) {
                        sanitized[key] = val.filter(v => !(typeof v === 'string' && v.startsWith('data:image/')));
                    }
                }
                fetch(`http://localhost:3030/users/${sanitized.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(sanitized)
                }).catch(err => console.error("Error updating profile in db", err));
            }
            return updatedUser;
        });
    };

    const value = {
        user,
        isAuthenticated,
        login,
        logout,
        updateProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
