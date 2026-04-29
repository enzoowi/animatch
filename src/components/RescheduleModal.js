import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { X, Calendar as CalendarIcon, Clock } from 'lucide-react';
import './RescheduleModal.css';

const DURATIONS = [30, 45, 60, 90, 120, 150, 180];

const RescheduleModal = ({ isOpen, onClose, request, targetUser }) => {
    const { user } = useAuth();
    const { rescheduleStudyRequest } = useData();

    // Initialize with original request time
    const [form, setForm] = useState({
        date: request?.date || '',
        time: request?.time || '',
        duration: request?.duration || 60,
    });
    const [errors, setErrors] = useState({});

    if (!isOpen || !request || !targetUser) return null;

    const handleChange = (field) => (e) =>
        setForm(prev => ({ ...prev, [field]: e.target.value }));

    const validate = () => {
        const errs = {};
        if (!form.date) errs.date = 'Please pick a new date.';
        if (!form.time) errs.time = 'Please pick a new time.';
        return errs;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }

        rescheduleStudyRequest(request.id, {
            date: form.date,
            time: form.time,
            duration: parseInt(form.duration, 10),
            proposedBy: user.id,
        });
        onClose();
    };

    return (
        <div className="rm-overlay" onClick={onClose}>
            <div className="rm-modal" onClick={e => e.stopPropagation()}>
                <div className="rm-header">
                    <div className="rm-title-row">
                        <Clock size={20} className="rm-icon" />
                        <h2>Suggest Another Time</h2>
                    </div>
                    <button className="rm-close" onClick={onClose} aria-label="Close">
                        <X size={18} />
                    </button>
                </div>

                <div className="rm-body">
                    <p className="rm-prompt">
                        Suggest a new time to <strong>{targetUser.name}</strong> for your <strong>{request.subject}</strong> study session.
                    </p>

                    <form className="rm-form" onSubmit={handleSubmit}>
                        <div className="rm-row">
                            <div className="rm-field">
                                <label><CalendarIcon size={14} /> Date</label>
                                <input type="date" value={form.date} onChange={handleChange('date')} min={new Date().toISOString().split('T')[0]} />
                                {errors.date && <span className="rm-error">{errors.date}</span>}
                            </div>
                            <div className="rm-field">
                                <label><Clock size={14} /> Time</label>
                                <input type="time" value={form.time} onChange={handleChange('time')} />
                                {errors.time && <span className="rm-error">{errors.time}</span>}
                            </div>
                        </div>

                        <div className="rm-field">
                            <label>Duration</label>
                            <select value={form.duration} onChange={handleChange('duration')}>
                                {DURATIONS.map(d => (
                                    <option key={d} value={d}>
                                        {d < 60 ? `${d} min` : `${Math.floor(d / 60)}h${d % 60 ? ` ${d % 60}min` : ''}`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="rm-actions">
                            <button type="button" className="rm-cancel-btn" onClick={onClose}>Cancel</button>
                            <button type="submit" className="rm-primary-btn">Send Proposal</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RescheduleModal;
