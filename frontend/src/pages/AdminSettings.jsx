import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AdminSettings = () => {
    const [mode, setMode] = useState('ALL_ACTIVE_TUTORS');
    const [min, setMin] = useState(0);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        axios.get('/api/admin.php?action=settings')
            .then(res => {
                setMode(res.data.settings.completion_mode);
                setMin(res.data.settings.minimum_required_tutors);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setMessage(''); setError('');
        try {
            const res = await axios.post('/api/admin.php?action=settings', { completion_mode: mode, minimum_required_tutors: parseInt(min) });
            setMessage(res.data.message);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save settings');
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading Settings...</div>;

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
                    <p className="text-sm text-slate-500">Global panel configurations</p>
                </div>
                <Link to="/admin/dashboard" className="px-4 py-2 bg-white rounded-xl shadow-sm text-sm font-bold text-slate-600 border border-slate-200">Back Dashboard</Link>
            </div>

            {error && <div className="mb-4 bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100">{error}</div>}
            {message && <div className="mb-4 bg-emerald-50 text-emerald-600 p-4 rounded-xl text-sm font-bold border border-emerald-100">{message}</div>}

            <div className="bg-white border border-slate-200 rounded-[2rem] shadow-glass p-8">
                <div className="text-lg font-semibold text-slate-800">Completion Rule</div>
                <div className="text-sm text-slate-500 mt-1 mb-6">Default: complete when all active tutors have scored.</div>

                <form onSubmit={handleSave} className="space-y-6">
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Completion Mode</label>
                        <select 
                            value={mode} 
                            onChange={e => setMode(e.target.value)} 
                            className="w-full mt-1 px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                        >
                            <option value="ALL_ACTIVE_TUTORS">ALL_ACTIVE_TUTORS (Recommended)</option>
                            <option value="MINIMUM_REQUIRED">MINIMUM_REQUIRED</option>
                        </select>
                        <div className="text-xs text-slate-500 mt-2 px-1">If MINIMUM_REQUIRED is selected, the applicant completes when at least N active tutors have scored.</div>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Minimum Required Tutors (N)</label>
                        <input 
                            type="number" 
                            min="0" 
                            value={min} 
                            onChange={e => setMin(e.target.value)} 
                            className="w-full mt-1 px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm" 
                        />
                    </div>

                    <button className="w-full xl:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all">Save Settings</button>
                </form>
            </div>
        </div>
    );
};
export default AdminSettings;
