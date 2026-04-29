import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Shield, BarChart3, Users, Heart, AlertTriangle, BookOpen, TrendingUp, Award, Download, X } from 'lucide-react';
import { jsPDF } from 'jspdf';
import PieChart from '../components/PieChart';
import BarChart from '../components/BarChart';
import './AdminPanel.css';

const AdminPanel = () => {
    const { user } = useAuth();
    const { users, matches, reports, likes, studySessions, studyRequests, updateUser } = useData();
    const [activeTab, setActiveTab] = useState('users');
    const [reportGenerated, setReportGenerated] = useState(false);
    const [profileOverlay, setProfileOverlay] = useState(null);

    const analytics = useMemo(() => {
        if (!users || users.length === 0) return null;

        const regularUsers = users.filter(u => u.role !== 'admin');
        const total = regularUsers.length;

        const ageBuckets = { '18-19': 0, '20-21': 0, '22+': 0 };
        const programCounts = {};
        const intentCounts = {};
        const genderCounts = {};
        const yearCounts = {};
        const tierCounts = {};

        regularUsers.forEach((u) => {
            if (u.age >= 18 && u.age <= 19) ageBuckets['18-19'] += 1;
            else if (u.age >= 20 && u.age <= 21) ageBuckets['20-21'] += 1;
            else if (u.age) ageBuckets['22+'] += 1;

            if (u.course) programCounts[u.course] = (programCounts[u.course] || 0) + 1;
            if (u.intent) intentCounts[u.intent] = (intentCounts[u.intent] || 0) + 1;
            if (u.gender) genderCounts[u.gender] = (genderCounts[u.gender] || 0) + 1;
            if (u.year) yearCounts[`Year ${u.year}`] = (yearCounts[`Year ${u.year}`] || 0) + 1;
            if (u.reputationTier) tierCounts[u.reputationTier] = (tierCounts[u.reputationTier] || 0) + 1;
        });

        const toPercent = (count) => ((count / (total || 1)) * 100).toFixed(1);
        const toEntries = (obj) => Object.entries(obj).map(([label, count]) => ({
            label, count, percent: toPercent(count),
        }));

        return {
            total,
            totalMatches: matches.length,
            totalLikes: likes.length,
            totalReports: reports.length,
            totalStudySessions: studySessions?.length || 0,
            totalStudyRequests: studyRequests?.length || 0,
            matchRate: total > 0 ? ((matches.length / total) * 100).toFixed(1) : '0',
            ageBuckets: toEntries(ageBuckets),
            programs: toEntries(programCounts).sort((a, b) => b.count - a.count),
            intents: toEntries(intentCounts),
            genders: toEntries(genderCounts),
            years: toEntries(yearCounts).sort((a, b) => a.label.localeCompare(b.label)),
            tiers: toEntries(tierCounts),
        };
    }, [users, matches, likes, reports, studySessions, studyRequests]);

    // Security check
    if (user?.role !== 'admin') {
        return (
            <div className="admin-denied">
                <h2>Access Denied</h2>
                <p>You do not have permission to view this page.</p>
            </div>
        );
    }

    const handleAction = (userId, action) => {
        if (action === 'suspend') {
            updateUser(userId, { suspended: true });
        } else if (action === 'restore') {
            updateUser(userId, { suspended: false });
        }
    };

    const handleGenerateReport = () => {
        try {
            const doc = new jsPDF({ unit: 'pt', format: 'a4' });
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 50;
            let y = margin;

            const checkPageBreak = (needed = 40) => {
                if (y + needed > pageHeight - margin) {
                    doc.addPage();
                    y = margin;
                }
            };

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(18);
            doc.text('AniMatch User Analytics Report', margin, y);
            y += 24;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, y);
            y += 30;

            doc.setTextColor(0, 0, 0);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Platform Overview', margin, y);
            y += 20;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11);
            doc.text(`The AniMatch platform currently has a total of ${analytics.total} active registered users.`, margin, y); y += 16;
            doc.text(`Engagement metrics show a total of ${analytics.totalLikes} likes across the platform, resulting in ${analytics.totalMatches} matches.`, margin, y); y += 16;
            doc.text(`This represents an overall match rate of ${analytics.matchRate}%.`, margin, y); y += 16;
            doc.text(`In terms of academic engagement, users have initiated ${analytics.totalStudyRequests} study requests,`, margin, y); y += 16;
            doc.text(`which have led to ${analytics.totalStudySessions} scheduled study sessions.`, margin, y); y += 16;
            doc.text(`Additionally, ${analytics.totalReports} user reports have been filed and are pending review or resolved.`, margin, y); y += 30;

            const printTextList = (title, items) => {
                if (!items || items.length === 0) return;
                checkPageBreak(60);
                
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(12);
                doc.text(title, margin, y);
                y += 20;

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(11);
                items.forEach(item => {
                    checkPageBreak(20);
                    // Use standard hyphen instead of bullet to ensure ASCII compatibility
                    doc.text(`- ${item.label}: ${item.count} user(s) (${item.percent}%)`, margin + 15, y);
                    y += 16;
                });
                y += 14;
            };

            printTextList('Age Distribution', analytics.ageBuckets);
            printTextList('Gender Distribution', analytics.genders);
            printTextList('User Intent (Looking For)', analytics.intents);
            printTextList('Reputation Tiers', analytics.tiers);
            printTextList('Year Level Distribution', analytics.years);
            printTextList('Programs / Courses Enrolled', analytics.programs);

            const totalPages = doc.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setFontSize(9);
                doc.setTextColor(150, 150, 150);
                doc.text(`AniMatch Analytics Report - Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 30, { align: 'center' });
            }

            doc.save(`animatch-textual-report-${new Date().toISOString().slice(0, 10)}.pdf`);
            setReportGenerated(true);
        } catch (err) {
            console.error('PDF generation failed:', err);
            alert('Failed to generate PDF report. Check the console for details.');
        }
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1><Shield size={22} className="admin-icon" /> Admin Dashboard</h1>
                <div className="stats-row">
                    <div className="stat-card">
                        <div className="stat-card-icon" style={{ background: '#e8f5ee', color: '#1a7a4a' }}>
                            <Users size={20} />
                        </div>
                        <div className="stat-card-info">
                            <span>Total Users</span>
                            <strong>{users.filter(u => u.role !== 'admin').length}</strong>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-icon" style={{ background: '#fce7f3', color: '#db2777' }}>
                            <Heart size={20} />
                        </div>
                        <div className="stat-card-info">
                            <span>Total Matches</span>
                            <strong>{matches.length}</strong>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-icon" style={{ background: '#ffebee', color: '#dc2626' }}>
                            <AlertTriangle size={20} />
                        </div>
                        <div className="stat-card-info">
                            <span>Active Reports</span>
                            <strong>{reports.length}</strong>
                        </div>
                    </div>
                </div>
            </div>

            <div className="admin-tabs">
                <button
                    className={activeTab === 'users' ? 'active' : ''}
                    onClick={() => setActiveTab('users')}
                >
                    <Users size={16} /> User Management
                </button>
                <button
                    className={activeTab === 'reports' ? 'active' : ''}
                    onClick={() => setActiveTab('reports')}
                >
                    <AlertTriangle size={16} /> Reports
                </button>
                <button
                    className={activeTab === 'analytics' ? 'active' : ''}
                    onClick={() => setActiveTab('analytics')}
                >
                    <BarChart3 size={16} /> User Analytics
                </button>
            </div>

            <div className="admin-content">
                {activeTab === 'users' && (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Reputation</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id} className={u.suspended ? 'suspended-row' : ''}>
                                    <td>
                                        <div className="user-cell">
                                            <img src={u.avatar} alt="avatar" />
                                            <span>{u.name}</span>
                                        </div>
                                    </td>
                                    <td>{u.email}</td>
                                    <td>{u.reputationTier} ({u.reputationScore})</td>
                                    <td>
                                        {u.suspended ? (
                                            <span className="badge danger">Suspended</span>
                                        ) : (
                                            <span className="badge success">Active</span>
                                        )}
                                    </td>
                                    <td>
                                        {u.role !== 'admin' && (
                                            u.suspended ? (
                                                <button className="action-btn restore" onClick={() => handleAction(u.id, 'restore')}>Restore</button>
                                            ) : (
                                                <button className="action-btn suspend" onClick={() => handleAction(u.id, 'suspend')}>Suspend</button>
                                            )
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {activeTab === 'reports' && (
                    <div className="reports-list">
                        {reports.length === 0 ? (
                            <p className="empty-state">No reports pending review.</p>
                        ) : (
                            reports.map((report, idx) => {
                                const reporter = users.find(u => u.id === report.reporterId);
                                const reported = users.find(u => u.id === report.reportedId);
                                return (
                                    <div key={idx} className="report-card">
                                        <div className="report-header">
                                            <strong>Report Type: {report.category}</strong>
                                            <span>{new Date(report.timestamp).toLocaleDateString()}</span>
                                        </div>
                                        {report.description && <p className="report-desc">"{report.description}"</p>}
                                        <div className="report-meta">
                                            Reported by: <button type="button" className="report-name-link" onClick={() => setProfileOverlay(reporter)}>{reporter?.name || 'Unknown'}</button><br />
                                            Reported User: <button type="button" className="report-name-link reported" onClick={() => setProfileOverlay(reported)}>{reported?.name || 'Unknown'}</button>
                                            {reported?.suspended && <span className="badge danger" style={{ marginLeft: 8 }}>Suspended</span>}
                                        </div>
                                        <div className="report-actions">
                                            {reported?.suspended ? (
                                                <button className="action-btn restore" onClick={() => handleAction(reported.id, 'restore')}>
                                                    Restore User
                                                </button>
                                            ) : (
                                                <button className="action-btn suspend" onClick={() => handleAction(reported.id, 'suspend')}>
                                                    Suspend User
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                {activeTab === 'analytics' && analytics && (
                    <div className="analytics-panel">
                        {/* ── KPI Summary Row ── */}
                        <div className="analytics-kpi-row">
                            <div className="kpi-card">
                                <div className="kpi-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}><TrendingUp size={20} /></div>
                                <div className="kpi-info">
                                    <span className="kpi-value">{analytics.matchRate}%</span>
                                    <span className="kpi-label">Match Rate</span>
                                </div>
                            </div>
                            <div className="kpi-card">
                                <div className="kpi-icon" style={{ background: '#dbeafe', color: '#2563eb' }}><Heart size={20} /></div>
                                <div className="kpi-info">
                                    <span className="kpi-value">{analytics.totalLikes}</span>
                                    <span className="kpi-label">Total Likes</span>
                                </div>
                            </div>
                            <div className="kpi-card">
                                <div className="kpi-icon" style={{ background: '#d1fae5', color: '#059669' }}><BookOpen size={20} /></div>
                                <div className="kpi-info">
                                    <span className="kpi-value">{analytics.totalStudySessions}</span>
                                    <span className="kpi-label">Study Sessions</span>
                                </div>
                            </div>
                            <div className="kpi-card">
                                <div className="kpi-icon" style={{ background: '#fef3c7', color: '#d97706' }}><Award size={20} /></div>
                                <div className="kpi-info">
                                    <span className="kpi-value">{analytics.totalStudyRequests}</span>
                                    <span className="kpi-label">Study Requests</span>
                                </div>
                            </div>
                        </div>

                        {/* ── Charts Grid ── */}
                        <div className="analytics-charts-grid">
                            <div className="chart-card">
                                <PieChart
                                    data={analytics.genders}
                                    palette="gender"
                                    title="Gender Distribution"
                                    size={180}
                                />
                            </div>

                            <div className="chart-card">
                                <PieChart
                                    data={analytics.ageBuckets}
                                    palette="age"
                                    title="Age Distribution"
                                    size={180}
                                />
                            </div>

                            <div className="chart-card">
                                <PieChart
                                    data={analytics.intents}
                                    palette="intent"
                                    title="Looking For (Intent)"
                                    size={180}
                                />
                            </div>

                            <div className="chart-card">
                                <PieChart
                                    data={analytics.tiers}
                                    palette="default"
                                    title="Reputation Tiers"
                                    size={180}
                                />
                            </div>
                        </div>

                        {/* ── Full-Width Bar Charts ── */}
                        <div className="chart-card chart-card-wide">
                            <BarChart
                                data={analytics.programs}
                                title="Programs / Courses"
                                color="#1a7a4a"
                                maxBars={10}
                            />
                        </div>

                        <div className="chart-card chart-card-wide">
                            <BarChart
                                data={analytics.years}
                                title="Year Level Distribution"
                                color="#6366f1"
                                maxBars={6}
                            />
                        </div>

                        {/* ── Export Report ── */}
                        <div className="analytics-export">
                            <button className="export-btn" type="button" onClick={handleGenerateReport}>
                                <Download size={16} />
                                Download PDF Report
                            </button>
                            {reportGenerated && (
                                <p className="report-success">✅ PDF report downloaded successfully!</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Profile Overlay Modal ── */}
            {profileOverlay && (
                <div className="profile-overlay-backdrop" onClick={() => setProfileOverlay(null)}>
                    <div className="profile-overlay-card" onClick={(e) => e.stopPropagation()}>
                        <button className="profile-overlay-close" onClick={() => setProfileOverlay(null)} aria-label="Close">
                            <X size={20} />
                        </button>

                        <div className="profile-overlay-top">
                            <img
                                src={profileOverlay.avatar || `https://i.pravatar.cc/150?u=${profileOverlay.id}`}
                                alt={profileOverlay.name}
                                className="profile-overlay-avatar"
                            />
                            <div className="profile-overlay-identity">
                                <h2>{profileOverlay.name}</h2>
                                <p className="profile-overlay-email">{profileOverlay.email}</p>
                                <div className="profile-overlay-badges">
                                    {profileOverlay.reputationTier && (
                                        <span className={`profile-overlay-tier tier-${profileOverlay.reputationTier?.toLowerCase()}`}>
                                            {profileOverlay.reputationTier} · {profileOverlay.reputationScore}
                                        </span>
                                    )}
                                    {profileOverlay.suspended && <span className="badge danger">Suspended</span>}
                                </div>
                            </div>
                        </div>

                        <div className="profile-overlay-details">
                            <div className="profile-overlay-row">
                                {profileOverlay.age && <span><strong>Age:</strong> {profileOverlay.age}</span>}
                                {profileOverlay.gender && <span><strong>Gender:</strong> {profileOverlay.gender}</span>}
                                {profileOverlay.course && <span><strong>Course:</strong> {profileOverlay.course}</span>}
                                {profileOverlay.year && <span><strong>Year:</strong> {profileOverlay.year}</span>}
                            </div>

                            {profileOverlay.intent && (
                                <div className="profile-overlay-section">
                                    <h4>Looking for</h4>
                                    <span className="profile-overlay-pill">{profileOverlay.intent}</span>
                                </div>
                            )}

                            {profileOverlay.bio && (
                                <div className="profile-overlay-section">
                                    <h4>Bio</h4>
                                    <p className="profile-overlay-bio">"{profileOverlay.bio}"</p>
                                </div>
                            )}

                            {profileOverlay.interests?.length > 0 && (
                                <div className="profile-overlay-section">
                                    <h4>Interests</h4>
                                    <div className="profile-overlay-tags">
                                        {profileOverlay.interests.map(i => <span key={i} className="profile-overlay-tag">{i}</span>)}
                                    </div>
                                </div>
                            )}

                            {profileOverlay.subjects?.length > 0 && (
                                <div className="profile-overlay-section">
                                    <h4>Enrolled Subjects</h4>
                                    <div className="profile-overlay-tags">
                                        {profileOverlay.subjects.map(s => <span key={s} className="profile-overlay-tag subject">{s}</span>)}
                                    </div>
                                </div>
                            )}
                        </div>

                        {profileOverlay.role !== 'admin' && (
                            <div className="profile-overlay-actions">
                                {profileOverlay.suspended ? (
                                    <button
                                        className="action-btn restore full-width"
                                        onClick={() => {
                                            handleAction(profileOverlay.id, 'restore');
                                            setProfileOverlay({ ...profileOverlay, suspended: false });
                                        }}
                                    >
                                        Restore Account
                                    </button>
                                ) : (
                                    <button
                                        className="action-btn suspend full-width"
                                        onClick={() => {
                                            handleAction(profileOverlay.id, 'suspend');
                                            setProfileOverlay({ ...profileOverlay, suspended: true });
                                        }}
                                    >
                                        Suspend Account
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
