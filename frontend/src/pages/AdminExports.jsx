import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AdminExports = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const generateCSV = (headers, rows) => {
        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `panel_export_${new Date().getTime()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExport = async (type) => {
        setLoading(true);
        setError('');
        try {
            const res = await axios.get('/api/admin.php?action=exports_data');
            const data = res.data.data;
            
            if (type === 'raw') {
                const headers = ['Applicant', 'Code', 'Status', 'Tutor', 'Appearance', 'Expression', 'Current Affairs', 'Total Score', 'Remarks', 'Comments'];
                const rows = data.map(d => [
                    d.applicant_name, d.applicant_code || '', d.panel_status, 
                    d.tutor_name || 'N/A', d.appearance || '', d.self_expression || '', d.current_affairs || '', 
                    d.total_score || '', d.remarks_json ? JSON.parse(d.remarks_json).join('; ') : '', d.comment || ''
                ]);
                generateCSV(headers, rows);
            } else if (type === 'summary') {
                const summary = {};
                data.forEach(d => {
                    if (!summary[d.applicant_name]) summary[d.applicant_name] = { name: d.applicant_name, code: d.applicant_code, status: d.panel_status, total: 0, count: 0 };
                    if (d.tutor_name) {
                        summary[d.applicant_name].total += parseFloat(d.total_score);
                        summary[d.applicant_name].count += 1;
                    }
                });
                const headers = ['Applicant', 'Code', 'Panel Status', 'Tutors Scored', 'Average Score'];
                const rows = Object.values(summary).map(s => [
                    s.name, s.code || '', s.status, s.count, s.count > 0 ? (s.total / s.count).toFixed(2) : 0
                ]);
                generateCSV(headers, rows);
            }
        } catch (err) {
            setError('Failed to generate export.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Generate Reports</h1>
                    <p className="text-sm text-slate-500">Download CSV summaries and raw scoring data.</p>
                </div>
                <Link to="/admin/dashboard" className="px-4 py-2 bg-white rounded-xl shadow-sm text-sm font-bold text-slate-600 border border-slate-200">Back Dashboard</Link>
            </div>

            {error && <div className="mb-4 bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div onClick={() => handleExport('summary')} className={`group bg-white p-8 rounded-[2rem] border border-slate-200 shadow-glass hover:border-indigo-500 hover:shadow-indigo-100 transition-all cursor-pointer ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 2v-6m10 10V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2z" /></svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Panel Summary</h3>
                    <p className="text-sm text-slate-500 mt-2">Outputs a consolidated CSV showing the average score for each applicant across all tutors.</p>
                </div>

                <div onClick={() => handleExport('raw')} className={`group bg-white p-8 rounded-[2rem] border border-slate-200 shadow-glass hover:border-emerald-500 hover:shadow-emerald-100 transition-all cursor-pointer ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Raw Submissions</h3>
                    <p className="text-sm text-slate-500 mt-2">Downloads every single individual score submission, including individual criteria and handwritten comments.</p>
                </div>
            </div>
        </div>
    );
};
export default AdminExports;
