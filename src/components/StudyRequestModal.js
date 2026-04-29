import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { X, BookOpen } from 'lucide-react';
import './StudyRequestModal.css';

const STUDY_TYPES = ['Quiz Review', 'Assignment Work', 'Group Discussion', 'Silent Co-Study', 'Exam Preparation'];
const LOCATIONS = ['Library', 'Study Hall', 'Café Near Campus', 'Online Study Session'];
const DURATIONS = [30, 45, 60, 90, 120, 150, 180];

const StudyRequestModal = ({ isOpen, onClose, targetUser, sharedSubjects = [] }) => {
    const { user } = useAuth();
    const { sendStudyRequest } = useData();

    const [form, setForm] = useState({
        subject: sharedSubjects.length > 0 ? sharedSubjects[0] : 'other',
        otherSubject: '',
        studyType: STUDY_TYPES[0],
        location: LOCATIONS[0],
        date: '',
        time: '',
        duration: 60,
        message: '',
    });
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            setForm({
                subject: sharedSubjects.length > 0 ? sharedSubjects[0] : 'other',
                otherSubject: '',
                studyType: STUDY_TYPES[0],
                location: LOCATIONS[0],
                date: '',
                time: '',
                duration: 60,
                message: '',
            });
            setSubmitted(false);
            setErrors({});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, targetUser?.id]);

    if (!isOpen) return null;

    const handleChange = (field) => (e) =>
        setForm(prev => ({ ...prev, [field]: e.target.value }));

    const validate = () => {
        const errs = {};
        const subjectChosen = form.subject === 'other' ? form.otherSubject.trim() : form.subject.trim();
        if (!subjectChosen) errs.subject = 'Please select or enter a subject.';
        if (!form.date) errs.date = 'Please pick a date.';
        if (!form.time) errs.time = 'Please pick a time.';
        return errs;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }

        const finalSubject = form.subject === 'other' ? form.otherSubject.trim() : form.subject;
        sendStudyRequest({
            fromId: user.id,
            toId: targetUser.id,
            subject: finalSubject,
            studyType: form.studyType,
            location: form.location,
            date: form.date,
            time: form.time,
            duration: parseInt(form.duration, 10),
            message: form.message.trim(),
        });
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="srm-overlay" onClick={() => onClose(true)}>
                <div className="srm-modal srm-success" onClick={e => e.stopPropagation()}>
                    <div className="srm-success-icon">📚</div>
                    <h2>Study Request Sent!</h2>
                    <p>Your request has been sent to <strong>{targetUser.name}</strong>.</p>
                    <p className="srm-success-sub">You'll be notified when they respond.</p>
                    <button className="srm-primary-btn" onClick={() => {
                        setSubmitted(false);
                        onClose(true); // Tell Dashboard to swipe away
                    }}>Done</button>
                </div>
            </div>
        );
    }

    return (
        <div className="srm-overlay" onClick={() => onClose(false)}>
            <div className="srm-modal" onClick={e => e.stopPropagation()}>
                <div className="srm-header">
                    <div className="srm-title-row">
                        <BookOpen size={20} className="srm-icon" />
                        <h2>Send Study Request</h2>
                    </div>
                    <button className="srm-close" onClick={() => onClose(false)} aria-label="Close">
                        <X size={18} />
                    </button>
                </div>

                <div className="srm-target-info">
                    <img src={targetUser.avatar} alt={targetUser.name} className="srm-avatar" />
                    <div>
                        <p className="srm-target-name">{targetUser.name}</p>
                        <p className="srm-target-course">{targetUser.course} · Year {targetUser.year}</p>
                    </div>
                </div>

                <form className="srm-form" onSubmit={handleSubmit}>
                    {/* Subject */}
                    <div className="srm-field">
                        <label>Subject to Study</label>
                        <select value={form.subject} onChange={handleChange('subject')}>
                            {sharedSubjects.length > 0 && (
                                <optgroup label="Shared Subjects">
                                    {sharedSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                                </optgroup>
                            )}
                            <option value="other">Other Subject…</option>
                        </select>
                        {form.subject === 'other' && (
                            <input
                                className="srm-other-input"
                                placeholder="Enter subject name"
                                value={form.otherSubject}
                                onChange={(e) => handleChange('otherSubject')({ target: { value: e.target.value.toUpperCase() } })}
                            />
                        )}
                        {errors.subject && <span className="srm-error">{errors.subject}</span>}
                    </div>

                    {/* Study Type */}
                    <div className="srm-field">
                        <label>Study Type</label>
                        <select value={form.studyType} onChange={handleChange('studyType')}>
                            {STUDY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    {/* Location */}
                    <div className="srm-field">
                        <label>Preferred Location</label>
                        <select value={form.location} onChange={handleChange('location')}>
                            {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>

                    {/* Date & Time */}
                    <div className="srm-row">
                        <div className="srm-field">
                            <label>Date</label>
                            <input type="date" value={form.date} onChange={handleChange('date')} min={new Date().toISOString().split('T')[0]} />
                            {errors.date && <span className="srm-error">{errors.date}</span>}
                        </div>
                        <div className="srm-field">
                            <label>Time</label>
                            <input type="time" value={form.time} onChange={handleChange('time')} />
                            {errors.time && <span className="srm-error">{errors.time}</span>}
                        </div>
                    </div>

                    {/* Duration */}
                    <div className="srm-field">
                        <label>Duration</label>
                        <select value={form.duration} onChange={handleChange('duration')}>
                            {DURATIONS.map(d => (
                                <option key={d} value={d}>
                                    {d < 60 ? `${d} min` : `${Math.floor(d / 60)}h${d % 60 ? ` ${d % 60}min` : ''}`}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Message */}
                    <div className="srm-field">
                        <label>Optional Message</label>
                        <textarea
                            placeholder="Add a note to your study partner…"
                            value={form.message}
                            onChange={handleChange('message')}
                            rows={3}
                            maxLength={200}
                        />
                        <span className="srm-char-count">{form.message.length}/200</span>
                    </div>

                    <div className="srm-actions">
                        <button type="button" className="srm-cancel-btn" onClick={() => onClose(false)}>Cancel</button>
                        <button type="submit" className="srm-primary-btn">
                            <BookOpen size={15} /> Send Request
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StudyRequestModal;
