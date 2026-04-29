import React, { useState } from 'react';

const BarChart = ({ data, color = '#1a7a4a', maxBars = 8, title }) => {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const sorted = [...data].sort((a, b) => b.count - a.count).slice(0, maxBars);
    const max = Math.max(...sorted.map(d => d.count), 1);

    return (
        <div className="bar-chart-wrapper">
            {title && <h3 className="bar-chart-title">{title}</h3>}
            <div className="bar-chart-body">
                {sorted.map((item, i) => {
                    const widthPct = (item.count / max) * 100;
                    const isHovered = hoveredIndex === i;
                    return (
                        <div
                            key={item.label}
                            className={`bar-chart-row ${isHovered ? 'hovered' : ''}`}
                            onMouseEnter={() => setHoveredIndex(i)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            <span className="bar-chart-label" title={item.label}>{item.label}</span>
                            <div className="bar-chart-track">
                                <div
                                    className="bar-chart-fill"
                                    style={{
                                        width: `${widthPct}%`,
                                        background: isHovered
                                            ? `linear-gradient(90deg, ${color}, ${color}dd)`
                                            : `linear-gradient(90deg, ${color}cc, ${color}88)`,
                                    }}
                                />
                            </div>
                            <span className="bar-chart-value">
                                {item.count} <span className="bar-chart-pct">({item.percent}%)</span>
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BarChart;
