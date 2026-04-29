import React from 'react';
import UpcomingStudySessionsWidget from '../components/UpcomingStudySessionsWidget';
import './StudySessions.css';

const StudySessions = () => {
    return (
        <div className="study-sessions-page">
            <div className="study-sessions-header">
                <h1>Study Sessions</h1>
                <p>Manage your upcoming academic collaborations.</p>
            </div>

            <div className="study-sessions-content">
                <UpcomingStudySessionsWidget />
            </div>
        </div>
    );
};

export default StudySessions;
