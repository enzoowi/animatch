import React, { useState } from 'react';
import { X } from 'lucide-react';
import './ReportModal.css';

const ReportModal = ({ isOpen, onClose, reportedUser, onSubmit }) => {
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');

    if (!isOpen || !reportedUser) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!category) return;

        onSubmit({ category, description });

        // Reset
        setCategory('');
        setDescription('');
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="report-modal">
                <div className="modal-header">
                    <h2>Report {reportedUser.name}</h2>
                    <button className="close-btn" onClick={onClose} aria-label="Close report dialog">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Why are you reporting this user?</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                        >
                            <option value="">Select a reason</option>
                            <option value="Inappropriate Behavior">Inappropriate Behavior</option>
                            <option value="Fake Profile / Catfishing">Fake Profile / Catfishing</option>
                            <option value="Not a DLSL Student">Not a DLSL Student</option>
                            <option value="Harassment or Threats">Harassment or Threats</option>
                            <option value="Spam / Commercial">Spam / Commercial</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Additional Details (Optional)</label>
                        <textarea
                            rows="4"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Please provide any specific details to help admins review this case."
                        ></textarea>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="action-btn cancel" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="action-btn submit" disabled={!category}>
                            Submit Report
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportModal;
