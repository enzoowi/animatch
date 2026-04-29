import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Heart } from 'lucide-react';
import './Onboarding.css';

const intents = [
    { id: 'Serious relationship', label: 'Serious Relationship', desc: 'Looking for something long-term and meaningful.' },
    { id: 'Casual dating', label: 'Casual Dating', desc: 'Exploring connections without pressure.' },
    { id: 'Study buddy', label: 'Study Buddy', desc: 'Finding peers to study and excel with.' },
    { id: 'Event companion', label: 'Event Companion', desc: 'Someone to attend school events and org activities with.' }
];

const Onboarding = () => {
    const { user, updateProfile } = useAuth();
    const { updateUser } = useData();

    const [step, setStep] = useState(1);
    const totalSteps = 3;
    const progress = (step / totalSteps) * 100;

    const [selectedIntent, setSelectedIntent] = useState('');
    const [bio, setBio] = useState('');
    const [course, setCourse] = useState('');
    const [year, setYear] = useState('');
    const [gpaGoal, setGpaGoal] = useState('');
    const [interests, setInterests] = useState([]);
    const [interestInput, setInterestInput] = useState('');
    const [subjects, setSubjects] = useState([]);
    const [subjectInput, setSubjectInput] = useState('');

    const addTag = (list, setList, input, setInput, transform) => {
        const val = transform ? transform(input.trim()) : input.trim();
        if (!val) return;
        setList(prev => [...prev, val]);
        setInput('');
    };

    const removeTag = (list, setList, index) => {
        setList(list.filter((_, i) => i !== index));
    };

    const handleNext = () => {
        if (step === 1 && !selectedIntent) return;
        if (step === 2 && (!course || !year)) return;
        setStep((s) => Math.min(totalSteps, s + 1));
    };

    const handleBack = () => setStep((s) => Math.max(1, s - 1));

    const handleComplete = (e) => {
        e.preventDefault();
        if (!selectedIntent || !course || !year) return;


        const updates = {
            intent: selectedIntent,
            bio,
            course,
            year: parseInt(year),
            subjects,
            gpaGoal,
            interests
        };

        updateUser(user.id, updates);
        updateProfile(updates);
    };

    return (
        <div className="onboarding-page">
            <div className="onboarding-header">
                <div className="onboarding-header-inner">
                    <div className="onboarding-brand">
                        <div className="onboarding-mark" aria-hidden="true">
                            <Heart size={22} />
                        </div>
                        <span className="onboarding-brand-name">AniMatch</span>
                    </div>
                </div>
            </div>

            <div className="onboarding-progress">
                <div className="onboarding-progress-inner">
                    <div className="onboarding-progress-row">
                        <span>Step {step} of {totalSteps}</span>
                        <span>{Math.round(progress)}% Complete</span>
                    </div>
                    <div className="onboarding-progress-track">
                        <div className="onboarding-progress-bar" style={{ width: `${progress}%` }} />
                    </div>
                </div>
            </div>

            <div className="onboarding-content">
                <div className="onboarding-card">
                    <form onSubmit={handleComplete}>
                        {step === 1 && (
                            <div className="step">
                                <h2>What are you looking for?</h2>
                                <p className="subtitle">Confirm what you're looking for on AniMatch</p>

                                <div className="intent-list">
                                    {intents.map(intent => (
                                        <label
                                            key={intent.id}
                                            className={`intent-option ${selectedIntent === intent.id ? 'selected' : ''}`}
                                        >
                                            <input
                                                type="radio"
                                                name="intent"
                                                value={intent.id}
                                                checked={selectedIntent === intent.id}
                                                onChange={(e) => setSelectedIntent(e.target.value)}
                                            />
                                            <div className="intent-option-body">
                                                <p className="intent-option-title">{intent.label}</p>
                                                <p className="intent-option-desc">{intent.desc}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                                {!selectedIntent && <p className="error-text">Please select an intent to proceed.</p>}
                            </div>
                        )}

                        {step === 2 && (
                            <div className="step">
                                <h2>Basic Information</h2>
                                <p className="subtitle">Tell us about your academic background</p>

                                <div className="field">
                                    <label>Course / Program</label>
                                    <select
                                        value={course}
                                        onChange={(e) => setCourse(e.target.value)}
                                        required
                                    >
                                        <option value="">Select your course</option>
                                        <option value="AB Communication">AB Communication</option>
                                        <option value="Associate in Computer Technology">Associate in Computer Technology</option>
                                        <option value="Bachelor of Elementary Education">Bachelor of Elementary Education</option>
                                        <option value="Bachelor of Multimedia Arts">Bachelor of Multimedia Arts</option>
                                        <option value="Bachelor of Secondary Education">Bachelor of Secondary Education</option>
                                        <option value="BS Accountancy">BS Accountancy</option>
                                        <option value="BS Accounting Information System">BS Accounting Information System</option>
                                        <option value="BS Architecture">BS Architecture</option>
                                        <option value="BS Biology">BS Biology</option>
                                        <option value="BS Computer Engineering">BS Computer Engineering</option>
                                        <option value="BS Computer Science">BS Computer Science</option>
                                        <option value="BS Electrical Engineering">BS Electrical Engineering</option>
                                        <option value="BS Electronics Engineering">BS Electronics Engineering</option>
                                        <option value="BS Entertainment and Multimedia Computing">BS Entertainment and Multimedia Computing</option>
                                        <option value="BS Entrepreneurship">BS Entrepreneurship</option>
                                        <option value="BS Forensic Science">BS Forensic Science</option>
                                        <option value="BS Hospitality Management">BS Hospitality Management</option>
                                        <option value="BS Industrial Engineering">BS Industrial Engineering</option>
                                        <option value="BS Information Technology">BS Information Technology</option>
                                        <option value="BS Legal Management">BS Legal Management</option>
                                        <option value="BS Management Technology">BS Management Technology</option>
                                        <option value="BS Mathematics">BS Mathematics</option>
                                        <option value="BS Nursing">BS Nursing</option>
                                        <option value="BS Psychology">BS Psychology</option>
                                        <option value="BS Tourism Management">BS Tourism Management</option>
                                        <option value="BSBA Financial Management">BSBA Financial Management</option>
                                        <option value="BSBA Marketing Management">BSBA Marketing Management</option>
                                        <option value="Certificate in Entrepreneurship">Certificate in Entrepreneurship</option>
                                        <option value="Cookery NC II (Culinary Arts)">Cookery NC II (Culinary Arts)</option>
                                        <option value="Juris Doctor">Juris Doctor</option>
                                    </select>
                                </div>

                                <div className="field">
                                    <label>Year Level</label>
                                    <select value={year} onChange={(e) => setYear(e.target.value)} required>
                                        <option value="">Select Year</option>
                                        <option value="1">1st Year</option>
                                        <option value="2">2nd Year</option>
                                        <option value="3">3rd Year</option>
                                        <option value="4">4th Year</option>
                                        <option value="5">5th Year+</option>
                                    </select>
                                </div>

                                <div className="field">
                                    <label>Bio</label>
                                    <textarea
                                        rows="3"
                                        placeholder="Tell others a bit about yourself..."
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                    />
                                </div>

                                <div className="field">
                                    <label>Interests</label>
                                    <div className="tag-input-row">
                                        {interests.map((tag, i) => (
                                            <span key={i} className="tag-pill">
                                                {tag}
                                                <button type="button" className="tag-remove" onClick={() => removeTag(interests, setInterests, i)}>×</button>
                                            </span>
                                        ))}
                                        <div className="tag-add-row">
                                            <input
                                                type="text"
                                                className="tag-input"
                                                placeholder="Add interest…"
                                                value={interestInput}
                                                onChange={(e) => setInterestInput(e.target.value.toLowerCase())}
                                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(interests, setInterests, interestInput, setInterestInput, v => v); } }}
                                            />
                                            <button type="button" className="tag-plus-btn" onClick={() => addTag(interests, setInterests, interestInput, setInterestInput, v => v)}>+</button>
                                        </div>
                                    </div>
                                </div>

                                <div className="study-date-section">
                                    <span className="study-date-label">For Study-Date Mode Matching</span>
                                    <hr className="study-date-divider" />
                                </div>

                                <div className="field">
                                    <label>Current Subjects</label>
                                    <div className="tag-input-row">
                                        {subjects.map((tag, i) => (
                                            <span key={i} className="tag-pill">
                                                {tag}
                                                <button type="button" className="tag-remove" onClick={() => removeTag(subjects, setSubjects, i)}>×</button>
                                            </span>
                                        ))}
                                        <div className="tag-add-row">
                                            <input
                                                type="text"
                                                className="tag-input"
                                                placeholder="Add subject…"
                                                value={subjectInput}
                                                onChange={(e) => setSubjectInput(e.target.value.toUpperCase())}
                                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(subjects, setSubjects, subjectInput, setSubjectInput, v => v); } }}
                                            />
                                            <button type="button" className="tag-plus-btn" onClick={() => addTag(subjects, setSubjects, subjectInput, setSubjectInput, v => v)}>+</button>
                                        </div>
                                    </div>
                                </div>

                                <div className="field">
                                    <label>Target GPA</label>
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        placeholder="e.g. 3.25"
                                        value={gpaGoal}
                                        onChange={(e) => {
                                            const raw = e.target.value.replace(/[^0-9.]/g, '');
                                            const parts = raw.split('.');
                                            if (parts.length > 2) return;
                                            const normalized =
                                                parts[0].slice(0, 1) +
                                                (parts[1] !== undefined ? '.' + parts[1].slice(0, 2) : '');
                                            setGpaGoal(normalized);
                                        }}
                                        onBlur={() => {
                                            if (!gpaGoal) return;
                                            const num = parseFloat(gpaGoal);
                                            if (Number.isNaN(num)) {
                                                setGpaGoal('');
                                                return;
                                            }
                                            // Clamp to 1.00–4.00 range
                                            const clamped = Math.min(4, Math.max(1, num));
                                            setGpaGoal(clamped.toFixed(2));
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="step">
                                <h2>Review & Finish</h2>
                                <p className="subtitle">Everything look good? Complete setup to enter AniMatch.</p>
                            </div>
                        )}

                        <div className="onboarding-actions">
                            {step > 1 && (
                                <button type="button" className="btn-outline" onClick={handleBack}>
                                    Back
                                </button>
                            )}

                            {step < totalSteps ? (
                                <button type="button" className="primary-btn btn-wide" onClick={handleNext}>
                                    Continue
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    className="primary-btn btn-wide"
                                    disabled={!selectedIntent || !course || !year}
                                >
                                    Complete Setup
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
