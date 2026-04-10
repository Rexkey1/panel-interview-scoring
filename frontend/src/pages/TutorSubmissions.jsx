import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const TutorSubmissions = () => {
    const [scores, setScores] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/api/tutor.php?action=scored_applicants')
            .then(res => setScores(res.data.scores))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-8 text-center text-slate-500">Loading your history...</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">My Submissions</h1>
                    <p className="text-sm text-slate-500">Applicants you have already scored.</p>
                </div>
                <Link to="/tutor/dashboard" className="px-4 py-2 bg-white rounded-xl shadow-sm text-sm font-bold text-slate-600 border border-slate-200">Workstation</Link>
            </div>

            <div className="bg-white border border-slate-200 rounded-[2rem] shadow-glass overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="py-4 px-6 text-[10px] uppercase tracking-widest font-black text-slate-400">Applicant</th>
                                <th className="py-4 px-6 text-[10px] uppercase tracking-widest font-black text-slate-400">Appr.</th>
                                <th className="py-4 px-6 text-[10px] uppercase tracking-widest font-black text-slate-400">Expr.</th>
                                <th className="py-4 px-6 text-[10px] uppercase tracking-widest font-black text-slate-400">Curr.</th>
                                <th className="py-4 px-6 text-[10px] uppercase tracking-widest font-black text-slate-400 text-right">Total Score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {scores.map((s, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="py-4 px-6 font-bold text-slate-700">{s.applicant_name}</td>
                                    <td className="py-4 px-6 text-sm text-slate-500">{s.appearance}</td>
                                    <td className="py-4 px-6 text-sm text-slate-500">{s.self_expression}</td>
                                    <td className="py-4 px-6 text-sm text-slate-500">{s.current_affairs}</td>
                                    <td className="py-4 px-6 text-right font-black text-indigo-600">{s.total_score}</td>
                                </tr>
                            ))}
                            {scores.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="py-8 text-center text-slate-400 font-medium">You haven't scored anyone yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
export default TutorSubmissions;
