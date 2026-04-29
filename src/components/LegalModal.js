import React, { useState } from 'react';
import { X, Shield, FileText } from 'lucide-react';
import './LegalModal.css';

const LegalModal = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('tos'); // 'tos' or 'privacy'

    if (!isOpen) return null;

    return (
        <div className="legal-modal-overlay" onClick={onClose}>
            <div className="legal-modal-content" onClick={e => e.stopPropagation()}>
                <div className="legal-modal-header">
                    <div className="legal-modal-tabs">
                        <button 
                            className={`legal-tab ${activeTab === 'tos' ? 'active' : ''}`}
                            onClick={() => setActiveTab('tos')}
                        >
                            <FileText size={18} />
                            Terms of Service
                        </button>
                        <button 
                            className={`legal-tab ${activeTab === 'privacy' ? 'active' : ''}`}
                            onClick={() => setActiveTab('privacy')}
                        >
                            <Shield size={18} />
                            Privacy Policy
                        </button>
                    </div>
                    <button className="legal-close-btn" onClick={onClose} aria-label="Close modal">
                        <X size={24} />
                    </button>
                </div>
                <div className="legal-modal-body">
                    {activeTab === 'tos' ? <TermsOfService /> : <PrivacyPolicy />}
                </div>
                <div className="legal-modal-footer">
                    <button className="legal-accept-btn" onClick={onClose}>I Understand</button>
                </div>
            </div>
        </div>
    );
};

const TermsOfService = () => (
    <div className="legal-document">
        <h2>Terms of Service</h2>
        <p className="effective-date">Effective Date: April 2026</p>
        
        <h3>1. Acceptance of Terms</h3>
        <p>By accessing and using AniMatch ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform. The Platform is designed exclusively for enrolled students of De La Salle Lipa.</p>

        <h3>2. Eligibility and Registration</h3>
        <p>To use AniMatch, you must be at least 18 years of age and hold a valid and active student email account ending in <code>@dlsl.edu.ph</code>. You are responsible for maintaining the confidentiality of your account credentials.</p>

        <h3>3. User Conduct</h3>
        <p>Users are expected to communicate respectfully and professionally. The following behaviors are strictly prohibited:</p>
        <ul>
            <li>Harassment, bullying, or abusive behavior towards other students.</li>
            <li>Sharing inappropriate, explicit, or unauthorized content.</li>
            <li>Impersonating another student or faculty member.</li>
            <li>Using the Platform for unauthorized commercial activities.</li>
        </ul>

        <h3>4. Study Sessions and Meetups</h3>
        <p>AniMatch facilitates the scheduling of academic study sessions and campus connections. The Platform is not responsible for the outcome of any in-person or virtual meetings. Users are advised to meet in public campus locations and exercise personal safety precautions.</p>

        <h3>5. Termination of Account</h3>
        <p>AniMatch reserves the right to suspend or terminate any account that violates these Terms of Service, institution guidelines, or disrupts the community.</p>
        
        <h3>6. Changes to Terms</h3>
        <p>We may modify these terms at any time. Continued use of the Platform after changes constitutes acceptance of the new terms.</p>
    </div>
);

const PrivacyPolicy = () => (
    <div className="legal-document">
        <h2>Privacy Policy</h2>
        <p className="effective-date">Effective Date: April 2026</p>
        
        <h3>1. Information We Collect</h3>
        <p>When you register for AniMatch, we collect personal information necessary to verify your student status and facilitate platform features, including:</p>
        <ul>
            <li>Full Name</li>
            <li>Institutional Email Address (@dlsl.edu.ph)</li>
            <li>Age and Gender</li>
            <li>Profile Photographs</li>
            <li>Interactions, study session requests, and chat logs within the Platform</li>
        </ul>

        <h3>2. How We Use Your Information</h3>
        <p>Your data is used to:</p>
        <ul>
            <li>Verify your identity and eligibility to use the Platform.</li>
            <li>Match you with other students for study sessions or campus connections.</li>
            <li>Maintain a safe and secure environment for all users.</li>
            <li>Improve the functionality and user experience of AniMatch.</li>
        </ul>

        <h3>3. Data Sharing and Disclosure</h3>
        <p>We do not sell your personal data. Information may only be disclosed under the following circumstances:</p>
        <ul>
            <li>To other users as part of your public profile (excluding private chat messages).</li>
            <li>To De La Salle Lipa administrators if requested for disciplinary or safety investigations.</li>
            <li>When required by law or legal processes.</li>
        </ul>

        <h3>4. Data Security</h3>
        <p>We implement industry-standard security measures to protect your personal information. However, no electronic transmission over the internet is entirely secure. We cannot guarantee absolute security but strive to protect your data effectively.</p>

        <h3>5. Your Rights</h3>
        <p>You have the right to access, update, or delete your personal information. To request account deletion and data removal, please contact the platform administration.</p>
    </div>
);

export default LegalModal;
