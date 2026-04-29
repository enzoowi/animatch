import React from 'react';
import { BookOpen } from 'lucide-react';
import './AcademicModeIndicator.css';

const AcademicModeIndicator = () => {
    return (
        <div className="academic-pill">
            <BookOpen size={14} className="academic-pill-icon" />
            <span>Academic Mode Active</span>
        </div>
    );
};

export default AcademicModeIndicator;
