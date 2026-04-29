import React, { createContext, useState, useContext, useEffect } from 'react';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

const API_URL = 'http://localhost:3030';

/**
 * Resolve a stored avatar value to a URL the browser can load.
 * - null / undefined  → returned as-is (components handle the fallback)
 * - data: URL         → returned as-is (uploaded photo stored as base64)
 * - http/https URL    → returned as-is (external image)
 * - relative path     → prefixed with process.env.PUBLIC_URL so it resolves
 *                       correctly regardless of the app's sub-directory (e.g. /animatch)
 */
const normalizeAvatar = (avatar) => {
    if (!avatar) return avatar;
    if (avatar.startsWith('data:') || avatar.startsWith('http')) return avatar;
    const path = avatar.startsWith('/') ? avatar : `/${avatar}`;
    return `${process.env.PUBLIC_URL}${path}`;
};

export const DataProvider = ({ children }) => {
    const [users, setUsers] = useState([]);
    const [matches, setMatches] = useState([]);
    const [messages, setMessages] = useState([]);
    const [confessions, setConfessions] = useState([]);
    const [reports, setReports] = useState([]);
    const [likes, setLikes] = useState([]);

    // ─── Academic / Study Request state ───────────────────────────────────────
    const [studyRequests, setStudyRequests] = useState([]);
    const [studySessions, setStudySessions] = useState([]);
    const [studyFeedback, setStudyFeedback] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [greenFlagScores, setGreenFlagScores] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [
                    usersRes,
                    matchesRes,
                    messagesRes,
                    confessionsRes,
                    reportsRes,
                    likesRes,
                    studyRequestsRes,
                    studySessionsRes,
                    studyFeedbackRes,
                    notificationsRes,
                    greenFlagScoresRes
                ] = await Promise.all([
                    fetch(`${API_URL}/users`).then(res => res.json()),
                    fetch(`${API_URL}/matches`).then(res => res.json()),
                    fetch(`${API_URL}/messages`).then(res => res.json()),
                    fetch(`${API_URL}/confessions`).then(res => res.json()),
                    fetch(`${API_URL}/reports`).then(res => res.json()),
                    fetch(`${API_URL}/likes`).then(res => res.json()),
                    fetch(`${API_URL}/studyRequests`).then(res => res.json()),
                    fetch(`${API_URL}/studySessions`).then(res => res.json()),
                    fetch(`${API_URL}/studyFeedback`).then(res => res.json()),
                    fetch(`${API_URL}/notifications`).then(res => res.json()),
                    fetch(`${API_URL}/greenFlagScores`).then(res => res.json())
                ]);

                setUsers((usersRes || []).map(u => ({ ...u, avatar: normalizeAvatar(u.avatar) })));
                setMatches(matchesRes || []);
                setMessages(messagesRes || []);
                setConfessions(confessionsRes || []);
                setReports(reportsRes || []);
                setLikes(likesRes || []);
                setStudyRequests(studyRequestsRes || []);
                setStudySessions(studySessionsRes || []);
                setStudyFeedback(studyFeedbackRes || []);
                setNotifications(notificationsRes || []);
                
                const scoresDict = {};
                if (Array.isArray(greenFlagScoresRes)) {
                    greenFlagScoresRes.forEach(item => {
                        scoresDict[item.id] = { score: item.score, sessions: item.sessions, label: item.label };
                    });
                }
                setGreenFlagScores(scoresDict);
            } catch (error) {
                console.error("Failed to fetch mock data from json-server", error);
            }
        };

        fetchData();
    }, []);

    /**
     * Strip base64 image data from objects before persisting to json-server.
     * Base64 blobs balloon db.json (100s of KB per user) and cause crashes.
     * Images are kept in React state for in-session display only.
     */
    const sanitizePayload = (obj) => {
        if (!obj || typeof obj !== 'object') return obj;
        if (Array.isArray(obj)) {
            return obj
                .filter(v => !(typeof v === 'string' && v.startsWith('data:image/')))
                .map(v => (typeof v === 'object' && v !== null ? sanitizePayload(v) : v));
        }
        const clean = {};
        for (const key of Object.keys(obj)) {
            const val = obj[key];
            if (typeof val === 'string' && val.startsWith('data:image/')) {
                clean[key] = null;
            } else if (Array.isArray(val)) {
                clean[key] = val.filter(v => !(typeof v === 'string' && v.startsWith('data:image/')));
            } else if (typeof val === 'object' && val !== null) {
                clean[key] = sanitizePayload(val);
            } else {
                clean[key] = val;
            }
        }
        return clean;
    };

    const persist = (endpoint, method, data) => {
        const sanitized = sanitizePayload(data);
        const url = method === 'POST' ? `${API_URL}/${endpoint}` : `${API_URL}/${endpoint}/${sanitized.id}`;
        fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitized)
        }).catch(err => console.error("Error persisting to JSON Server", err));
    };

    // ─── Existing actions ─────────────────────────────────────────────────────
    const addUser = (user) => {
        setUsers(prev => [...prev, user]);
        persist('users', 'POST', user);
    };

    const addMatch = (match) => {
        setMatches(prev => [...prev, match]);
        persist('matches', 'POST', match);
    };

    const likeUser = (fromId, toId) => {
        const newLike = { id: `l_${Date.now()}`, from: fromId, to: toId };
        setLikes(prev => [...prev, newLike]);
        persist('likes', 'POST', newLike);

        const isMutual = likes.find(l => l.from === toId && l.to === fromId) || Math.random() > 0.7;
        if (isMutual) {
            const matchId = `m${Date.now()}`;
            const match = { id: matchId, users: [fromId, toId], timestamp: new Date().toISOString() };
            addMatch(match);

            // Notify both users about the new match
            const fromUser = users.find(u => u.id === fromId);
            const toUser = users.find(u => u.id === toId);
            addNotification({
                type: 'match',
                title: 'New Match! 🎉',
                body: `You and ${toUser?.name} have matched!`,
                fromId: toId,
                toId: fromId,
            });
            addNotification({
                type: 'match',
                title: 'New Match! 🎉',
                body: `You and ${fromUser?.name} have matched!`,
                fromId: fromId,
                toId: toId,
            });

            return { isMatch: true, matchId };
        }
        return { isMatch: false };
    };

    const sendMessage = (msg) => {
        setMessages(prev => [...prev, msg]);
        persist('messages', 'POST', msg);

        // Notify the recipient about the new message
        const match = matches.find(m => m.id === msg.matchId);
        if (match) {
            const recipientId = match.users.find(id => id !== msg.senderId);
            const sender = users.find(u => u.id === msg.senderId);
            if (recipientId) {
                addNotification({
                    type: 'message',
                    title: 'New Message',
                    body: `${sender?.name}: ${msg.text.length > 50 ? msg.text.slice(0, 50) + '…' : msg.text}`,
                    fromId: msg.senderId,
                    toId: recipientId,
                    relatedId: msg.matchId,
                });
            }
        }
    };

    const addConfession = (confession) => {
        const reverseConfession = confessions.find(
            c => c.fromId === confession.toId && c.toId === confession.fromId
        );
        if (reverseConfession && !reverseConfession.revealed) {
            const updatedReverse = { ...reverseConfession, revealed: true };
            setConfessions(prev => prev.map(c =>
                c.id === reverseConfession.id ? updatedReverse : c
            ));
            persist('confessions', 'PUT', updatedReverse);

            const newConfession = { ...confession, revealed: true };
            setConfessions(prev => [...prev, newConfession]);
            persist('confessions', 'POST', newConfession);

            // Notify both users about the mutual confession
            const fromUser = users.find(u => u.id === confession.fromId);
            const toUser = users.find(u => u.id === confession.toId);
            addNotification({
                type: 'confession',
                title: 'Mutual Confession! 💕',
                body: `You and ${toUser?.name} confessed to each other! The secret is out.`,
                fromId: confession.toId,
                toId: confession.fromId,
            });
            addNotification({
                type: 'confession',
                title: 'Mutual Confession! 💕',
                body: `You and ${fromUser?.name} confessed to each other! The secret is out.`,
                fromId: confession.fromId,
                toId: confession.toId,
            });

            return true;
        } else {
            const newConfession = { ...confession, revealed: false };
            setConfessions(prev => [...prev, newConfession]);
            persist('confessions', 'POST', newConfession);
            return false;
        }
    };

    const reportUser = (report) => {
        setReports(prev => [...prev, report]);
        persist('reports', 'POST', report);
    };

    const updateUser = (userId, updates) => {
        const userToUpdate = users.find(u => u.id === userId);
        if (userToUpdate) {
            const updatedUser = { ...userToUpdate, ...updates };
            setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
            persist('users', 'PUT', updatedUser);
        }
    };

    // ─── Notifications ────────────────────────────────────────────────────────
    const addNotification = (notif) => {
        const newNotif = { ...notif, id: `notif_${Date.now()}`, createdAt: new Date().toISOString(), read: false };
        setNotifications(prev => [newNotif, ...prev]);
        persist('notifications', 'POST', newNotif);
    };

    const markNotificationsRead = (userId) => {
        const updatedNotifs = notifications.map(n => n.toId === userId ? { ...n, read: true } : n);
        setNotifications(updatedNotifs);
        updatedNotifs.filter(n => n.toId === userId).forEach(n => persist('notifications', 'PUT', n));
    };

    // ─── Study Request actions ─────────────────────────────────────────────────
    const sendStudyRequest = (request) => {
        const newReq = {
            ...request,
            id: `sr_${Date.now()}`,
            status: 'pending',
            createdAt: new Date().toISOString(),
            rescheduleProposal: null,
        };
        setStudyRequests(prev => [...prev, newReq]);
        persist('studyRequests', 'POST', newReq);

        const sender = users.find(u => u.id === request.fromId);
        addNotification({
            type: 'study_request',
            title: 'New Study Request',
            body: `${sender?.name} sent you a Study Request for ${request.subject}.`,
            fromId: request.fromId,
            toId: request.toId,
            relatedId: newReq.id,
        });
        return newReq;
    };

    const acceptStudyRequest = (requestId) => {
        let accepted = null;
        setStudyRequests(prev => prev.map(r => {
            if (r.id === requestId) {
                accepted = { ...r, status: 'accepted' };
                return accepted;
            }
            return r;
        }));

        if (!accepted) return null;
        persist('studyRequests', 'PUT', accepted);

        setMatches(prev => {
            const alreadyMatched = prev.some(m => m.users.includes(accepted.fromId) && m.users.includes(accepted.toId));
            if (!alreadyMatched) {
                const newMatch = { id: `m${Date.now()}`, users: [accepted.fromId, accepted.toId], timestamp: new Date().toISOString() };
                persist('matches', 'POST', newMatch);
                return [...prev, newMatch];
            }
            return prev;
        });

        const session = {
            id: `ss_${Date.now()}`,
            requestId: accepted.id,
            participants: [accepted.fromId, accepted.toId],
            subject: accepted.subject,
            studyType: accepted.studyType,
            location: accepted.location,
            scheduledAt: `${accepted.date}T${accepted.time}:00.000Z`,
            duration: accepted.duration,
            feedbackSubmitted: [],
        };
        setStudySessions(prev => [...prev, session]);
        persist('studySessions', 'POST', session);

        const accepter = users.find(u => u.id === accepted.toId);
        addNotification({
            type: 'study_accepted',
            title: 'Study Request Accepted',
            body: `${accepter?.name} accepted your Study Request for ${accepted.subject}.`,
            fromId: accepted.toId,
            toId: accepted.fromId,
            relatedId: session.id,
        });

        return session;
    };

    const declineStudyRequest = (requestId) => {
        let declined = null;
        setStudyRequests(prev => prev.map(r => {
            if (r.id === requestId) { declined = { ...r, status: 'declined' }; return declined; }
            return r;
        }));
        if (!declined) return;
        persist('studyRequests', 'PUT', declined);

        const decliner = users.find(u => u.id === declined.toId);
        addNotification({
            type: 'study_declined',
            title: 'Study Request Declined',
            body: `${decliner?.name} declined your Study Request for ${declined.subject}.`,
            fromId: declined.toId,
            toId: declined.fromId,
            relatedId: requestId,
        });
    };

    const rescheduleStudyRequest = (requestId, { date, time, duration, proposedBy }) => {
        let req = null;
        setStudyRequests(prev => prev.map(r => {
            if (r.id === requestId) {
                req = { ...r, status: 'rescheduled', rescheduleProposal: { date, time, duration, proposedBy } };
                return req;
            }
            return r;
        }));
        if (!req) return;
        persist('studyRequests', 'PUT', req);

        const proposer = users.find(u => u.id === proposedBy);
        const reqToUpdate = studyRequests.find(r => r.id === requestId);
        const receiverId = proposedBy === reqToUpdate?.fromId ? reqToUpdate?.toId : reqToUpdate?.fromId;
        addNotification({
            type: 'study_rescheduled',
            title: 'New Reschedule Proposal',
            body: `${proposer?.name} suggested a new time for your Study Session.`,
            fromId: proposedBy,
            toId: receiverId,
            relatedId: requestId,
        });
    };

    const acceptReschedule = (requestId) => {
        let req = null;
        setStudyRequests(prev => prev.map(r => {
            if (r.id === requestId && r.rescheduleProposal) {
                req = { ...r, ...r.rescheduleProposal, status: 'accepted', rescheduleProposal: null };
                return req;
            }
            return r;
        }));
        if (!req) return null;
        persist('studyRequests', 'PUT', req);

        setMatches(prev => {
            const alreadyMatched = prev.some(m => m.users.includes(req.fromId) && m.users.includes(req.toId));
            if (!alreadyMatched) {
                const newMatch = { id: `m${Date.now()}`, users: [req.fromId, req.toId], timestamp: new Date().toISOString() };
                persist('matches', 'POST', newMatch);
                return [...prev, newMatch];
            }
            return prev;
        });

        const updatedSession = {
            id: `ss_${Date.now()}`,
            requestId: req.id,
            participants: [req.fromId, req.toId],
            subject: req.subject,
            studyType: req.studyType,
            location: req.location,
            scheduledAt: `${req.date}T${req.time}:00.000Z`,
            duration: req.duration,
            feedbackSubmitted: [],
        };
        const oldSession = studySessions.find(s => s.requestId === requestId);
        if (oldSession) {
            persist('studySessions', 'DELETE', oldSession);
        }
        setStudySessions(prev => [...prev.filter(s => s.requestId !== requestId), updatedSession]);
        persist('studySessions', 'POST', updatedSession);
        return updatedSession;
    };

    // ─── Post-session feedback ─────────────────────────────────────────────────
    const submitFeedback = ({ sessionId, raterId, productivity, partnerComm }) => {
        const newFb = {
            id: `fb_${Date.now()}`,
            sessionId,
            raterId,
            productivity,
            partnerComm,
            timestamp: new Date().toISOString(),
        };
        setStudyFeedback(prev => [...prev, newFb]);
        persist('studyFeedback', 'POST', newFb);

        const session = studySessions.find(s => s.id === sessionId);
        if (session) {
            const updatedSession = { ...session, feedbackSubmitted: [...(session.feedbackSubmitted || []), raterId] };
            setStudySessions(prev => prev.map(s => s.id === sessionId ? updatedSession : s));
            persist('studySessions', 'PUT', updatedSession);

            const partnerId = session.participants.find(id => id !== raterId);
            if (partnerId) {
                const avgRating = (productivity + partnerComm) / 2;
                const delta = avgRating >= 4.5 ? 10 : avgRating >= 3 ? 5 : -8;
                
                const current = greenFlagScores[partnerId] || { score: 75, sessions: 0, label: 'Reliable' };
                const newScore = Math.min(100, Math.max(0, current.score + delta));
                const label =
                    newScore >= 90 ? 'Top-Rated Partner' :
                        newScore >= 75 ? 'Excellent Study Partner' :
                            newScore >= 50 ? 'Reliable' : 'Needs Improvement';
                            
                const newGreenFlag = { id: partnerId, score: newScore, sessions: current.sessions + 1, label };
                setGreenFlagScores(prev => ({ ...prev, [partnerId]: newGreenFlag }));
                
                let method = "PUT";
                if(!greenFlagScores[partnerId] && !Object.keys(greenFlagScores).includes(partnerId)){
                    method = "POST";
                }

                persist('greenFlagScores', method, newGreenFlag);
            }
        }
    };

    // ─── Helpers ──────────────────────────────────────────────────────────────
    const getStudyRequestsBetween = (userAId, userBId) =>
        studyRequests.filter(r =>
            (r.fromId === userAId && r.toId === userBId) ||
            (r.fromId === userBId && r.toId === userAId)
        );

    const getSessionForMatch = (userAId, userBId) =>
        studySessions.find(s =>
            s.participants.includes(userAId) && s.participants.includes(userBId)
        );

    const value = {
        users, matches, messages, confessions, reports, likes,
        addUser, updateUser, addMatch, likeUser, sendMessage, addConfession, reportUser,
        studyRequests, studySessions, studyFeedback, notifications, greenFlagScores,
        sendStudyRequest, acceptStudyRequest, declineStudyRequest,
        rescheduleStudyRequest, acceptReschedule, submitFeedback,
        addNotification, markNotificationsRead,
        getStudyRequestsBetween, getSessionForMatch,
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
