import React, { useState } from 'react';

const PALETTES = {
    default: ['#1a7a4a', '#2ecc71', '#27ae60', '#16a085', '#1abc9c', '#0e6655', '#7dcea0', '#45b39d'],
    gender: ['#6366f1', '#ec4899', '#f59e0b', '#10b981'],
    intent: ['#ef4444', '#f97316', '#8b5cf6', '#06b6d4', '#84cc16'],
    age: ['#3b82f6', '#8b5cf6', '#f43f5e'],
    warm: ['#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#8b5cf6', '#ec4899', '#6366f1'],
};

const PieChart = ({ data, size = 200, palette = 'default', title, showLegend = true, donut = true }) => {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const colors = PALETTES[palette] || PALETTES.default;
    const total = data.reduce((sum, d) => sum + d.count, 0);
    if (total === 0) return null;

    const cx = size / 2;
    const cy = size / 2;
    const outerR = size / 2 - 8;
    const innerR = donut ? outerR * 0.55 : 0;

    let currentAngle = -90;
    const segments = data.map((d, i) => {
        const angle = (d.count / total) * 360;
        const startAngle = currentAngle;
        const endAngle = currentAngle + angle;
        currentAngle = endAngle;

        const startRad = (Math.PI / 180) * startAngle;
        const endRad = (Math.PI / 180) * endAngle;

        const x1Outer = cx + outerR * Math.cos(startRad);
        const y1Outer = cy + outerR * Math.sin(startRad);
        const x2Outer = cx + outerR * Math.cos(endRad);
        const y2Outer = cy + outerR * Math.sin(endRad);

        const x1Inner = cx + innerR * Math.cos(endRad);
        const y1Inner = cy + innerR * Math.sin(endRad);
        const x2Inner = cx + innerR * Math.cos(startRad);
        const y2Inner = cy + innerR * Math.sin(startRad);

        const largeArc = angle > 180 ? 1 : 0;

        const pathData = donut
            ? [
                `M ${x1Outer} ${y1Outer}`,
                `A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2Outer} ${y2Outer}`,
                `L ${x1Inner} ${y1Inner}`,
                `A ${innerR} ${innerR} 0 ${largeArc} 0 ${x2Inner} ${y2Inner}`,
                'Z',
            ].join(' ')
            : [
                `M ${cx} ${cy}`,
                `L ${x1Outer} ${y1Outer}`,
                `A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2Outer} ${y2Outer}`,
                'Z',
            ].join(' ');

        return {
            pathData,
            color: colors[i % colors.length],
            label: d.label,
            count: d.count,
            percent: ((d.count / total) * 100).toFixed(1),
        };
    });

    return (
        <div className="pie-chart-wrapper">
            {title && <h3 className="pie-chart-title">{title}</h3>}
            <div className="pie-chart-body">
                <svg
                    width={size}
                    height={size}
                    viewBox={`0 0 ${size} ${size}`}
                    className="pie-chart-svg"
                >
                    {segments.map((seg, i) => (
                        <path
                            key={i}
                            d={seg.pathData}
                            fill={seg.color}
                            stroke="#fff"
                            strokeWidth="2"
                            opacity={hoveredIndex !== null && hoveredIndex !== i ? 0.4 : 1}
                            onMouseEnter={() => setHoveredIndex(i)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            style={{
                                transition: 'opacity 0.2s ease, transform 0.2s ease',
                                transformOrigin: `${cx}px ${cy}px`,
                                transform: hoveredIndex === i ? 'scale(1.04)' : 'scale(1)',
                                cursor: 'pointer',
                            }}
                        />
                    ))}
                    {donut && (
                        <>
                            <text x={cx} y={cy - 6} textAnchor="middle" className="pie-center-value">
                                {hoveredIndex !== null ? segments[hoveredIndex].count : total}
                            </text>
                            <text x={cx} y={cy + 14} textAnchor="middle" className="pie-center-label">
                                {hoveredIndex !== null ? segments[hoveredIndex].label : 'Total'}
                            </text>
                        </>
                    )}
                </svg>

                {showLegend && (
                    <ul className="pie-chart-legend">
                        {segments.map((seg, i) => (
                            <li
                                key={i}
                                className={`pie-legend-item ${hoveredIndex === i ? 'hovered' : ''}`}
                                onMouseEnter={() => setHoveredIndex(i)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >
                                <span className="pie-legend-dot" style={{ background: seg.color }} />
                                <span className="pie-legend-label">{seg.label}</span>
                                <span className="pie-legend-value">{seg.count} ({seg.percent}%)</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {hoveredIndex !== null && (
                <div className="pie-tooltip">
                    <strong>{segments[hoveredIndex].label}</strong>: {segments[hoveredIndex].count} users ({segments[hoveredIndex].percent}%)
                </div>
            )}
        </div>
    );
};

export default PieChart;
