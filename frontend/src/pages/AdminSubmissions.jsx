import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AdminSubmissions = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTutor, setSelectedTutor] = useState('ALL');

    useEffect(() => {
        axios.get('/api/admin.php?action=exports_data')
            .then(res => {
                // Only keep applicants that have actually been scored
                const scoredOnly = res.data.data.filter(d => d.tutor_name);
                setData(scoredOnly);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const uniqueTutors = useMemo(() => {
        const tutors = new Set();
        data.forEach(d => {
            if (d.tutor_name) tutors.add(d.tutor_name);
        });
        return Array.from(tutors).sort();
    }, [data]);

    const filteredData = useMemo(() => {
        if (selectedTutor === 'ALL') return data;
        return data.filter(d => d.tutor_name === selectedTutor);
    }, [data, selectedTutor]);

    const handleExport = () => {
        if (filteredData.length === 0) return alert('No data to export!');
        
        const headers = ['Applicant', 'Code', 'Panel Status', 'Tutor', 'Appearance', 'Expression', 'Current Affairs', 'Total Score', 'Remarks', 'Comments'];
        
        const csvContent = [
            headers.join(','),
            ...filteredData.map(d => {
                const remarks_parsed = d.remarks_json ? JSON.parse(d.remarks_json).join('; ') : '';
                return [
                    d.applicant_name, 
                    d.applicant_code || '', 
                    d.panel_status, 
                    d.tutor_name, 
                    d.appearance || '', 
                    d.self_expression || '', 
                    d.current_affairs || '', 
                    d.total_score || '', 
                    remarks_parsed, 
                    d.comment || ''
                ].map(c => `"${String(c).replace(/"/g, '""')}"`).join(',');
            })
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `tutor_submissions_${selectedTutor === 'ALL' ? 'all' : selectedTutor.replace(/\s+/g, '_')}_${new Date().getTime()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading Submissions...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Tutor Submissions</h1>
                    <p className="text-sm text-slate-500">View individual scores per panel tutor across all applicants.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div className="flex-1 min-w-[200px]">
                        <select 
                            value={selectedTutor} 
                            onChange={e => setSelectedTutor(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 bg-white shadow-sm"
                        >
                            <option value="ALL">All Tutors (Panels)</option>
                            {uniqueTutors.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                    <button onClick={handleExport} className="px-4 py-2 bg-emerald-600 rounded-xl shadow-sm text-sm font-bold text-white shadow-emerald-200 hover:bg-emerald-700 whitespace-nowrap">
                        Export Filtered CSV
                    </button>
                    <Link to="/admin/dashboard" className="px-4 py-2 bg-white rounded-xl shadow-sm text-sm font-bold text-slate-600 border border-slate-200 hover:bg-slate-50">Back</Link>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-[2rem] shadow-glass overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="py-4 px-6 text-[10px] uppercase tracking-widest font-black text-slate-400">Applicant</th>
                                <th className="py-4 px-6 text-[10px] uppercase tracking-widest font-black text-slate-400">Code/PIN</th>
                                <th className="py-4 px-6 text-[10px] uppercase tracking-widest font-black text-slate-400">Tutor (Panel)</th>
                                <th className="py-4 px-6 text-[10px] uppercase tracking-widest font-black text-slate-400 text-center">Score</th>
                                <th className="py-4 px-6 text-[10px] uppercase tracking-widest font-black text-slate-400">Remarks</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredData.map((d, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="py-4 px-6 font-bold text-slate-700">{d.applicant_name}</td>
                                    <td className="py-4 px-6 text-xs text-slate-500">{d.applicant_code || '---'}</td>
                                    <td className="py-4 px-6">
                                        <span className="inline-flex px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold">
                                            {d.tutor_name}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-center font-black text-indigo-600 text-base">{d.total_score}</td>
                                    <td className="py-4 px-6 text-xs text-slate-500 max-w-xs truncate" title={d.comment}>
                                        {d.remarks_json ? JSON.parse(d.remarks_json).length + ' remarks' : 'None'} 
                                        {d.comment ? ` - ${d.comment}` : ''}
                                    </td>
                                </tr>
                            ))}
                            {filteredData.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="py-12 text-center text-slate-400 font-medium">
                                        No submissions found for the selected panel.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="mt-4 text-xs font-bold text-slate-400 tracking-widest uppercase text-right px-4">
                {filteredData.length} submissions
            </div>
        </div>
    );
};
export default AdminSubmissions;
