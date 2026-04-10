import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AdminApplicants = () => {
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [query, setQuery] = useState('');
    const [editApp, setEditApp] = useState(null);
    const [formState, setFormState] = useState({ id: 0, applicant_name: '', applicant_code: '' });

    const fetchApplicants = (searchQuery = '') => {
        setLoading(true);
        axios.get(`/api/admin.php?action=applicants&q=${encodeURIComponent(searchQuery)}`)
            .then(res => setApplicants(res.data.applicants))
            .catch(err => setError('Failed to load applicants.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        const timer = setTimeout(() => fetchApplicants(query), 300);
        return () => clearTimeout(timer);
    }, [query]);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this applicant?")) return;
        try {
            await axios.post('/api/admin.php?action=delete_applicant', { id });
            fetchApplicants(query);
        } catch (e) {
            alert('Failed to delete applicant.');
        }
    };

    const handleReset = async (id) => {
        if (!window.confirm("Are you sure you want to reset this applicant? All their scores will be lost!")) return;
        try {
            await axios.post('/api/admin.php?action=reset_applicant', { id });
            fetchApplicants(query);
        } catch (e) {
            alert('Failed to reset applicant.');
        }
    };

    const openEdit = (app) => {
        setFormState({ id: app.id, applicant_name: app.applicant_name, applicant_code: app.applicant_code || '', program: app.program || '' });
        setEditApp(app.id);
    };

    const saveEdit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/admin.php?action=edit_applicant', formState);
            setEditApp(null);
            fetchApplicants(query);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to edit applicant.');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Manage Applicants</h1>
                    <p className="text-sm text-slate-500">Real-time panel scoring aggregates.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                    <input 
                        type="text" 
                        value={query} 
                        onChange={e => setQuery(e.target.value)} 
                        className="px-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 w-full sm:w-auto" 
                        placeholder="Search PIN or Name..." 
                    />
                    <Link to="/admin/upload" className="px-4 py-2 bg-indigo-600 rounded-xl shadow-sm text-sm font-bold text-white shadow-indigo-200 hover:bg-indigo-700">+ Add New</Link>
                </div>
            </div>

            {error && <div className="mb-4 text-red-500">{error}</div>}

            <div className="bg-white border border-slate-200 rounded-[2rem] shadow-glass overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="py-4 px-6 text-[10px] uppercase tracking-widest font-black text-slate-400">Name & Program</th>
                                <th className="py-4 px-6 text-[10px] uppercase tracking-widest font-black text-slate-400">Status</th>
                                <th className="py-4 px-6 text-[10px] uppercase tracking-widest font-black text-slate-400 text-center">Total</th>
                                <th className="py-4 px-6 text-[10px] uppercase tracking-widest font-black text-slate-400 text-center">Average</th>
                                <th className="py-4 px-6 text-[10px] uppercase tracking-widest font-black text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {applicants.map(app => (
                                <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="py-4 px-6">
                                        {editApp === app.id ? (
                                            <form onSubmit={saveEdit} className="flex flex-col gap-2">
                                                <input required value={formState.applicant_name} onChange={e=>setFormState({...formState, applicant_name: e.target.value})} className="px-3 py-1.5 border border-slate-300 rounded text-sm w-full font-bold" placeholder="Applicant Name" />
                                                <input value={formState.applicant_code} onChange={e=>setFormState({...formState, applicant_code: e.target.value})} className="px-3 py-1.5 border border-slate-300 rounded text-xs w-full text-slate-500" placeholder="Applicant Code or PIN" />
                                                <input value={formState.program} onChange={e=>setFormState({...formState, program: e.target.value})} className="px-3 py-1.5 border border-slate-300 rounded text-xs w-full text-slate-500" placeholder="Program (e.g. General Nursing)" />
                                                <div className="flex gap-2 mt-1">
                                                    <button type="submit" className="text-xs font-bold text-white bg-indigo-600 px-2 py-1 rounded">Save</button>
                                                    <button type="button" onClick={() => setEditApp(null)} className="text-xs font-bold text-slate-600 bg-slate-200 px-2 py-1 rounded">Cancel</button>
                                                </div>
                                            </form>
                                        ) : (
                                            <>
                                                <div className="font-bold text-slate-700">{app.applicant_name}</div>
                                                <div className="text-xs text-slate-400">{app.applicant_code || 'No Code'} • {app.program || 'General Nursing'}</div>
                                            </>
                                        )}
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                            app.panel_status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                        }`}>
                                            {app.panel_status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-center font-bold text-indigo-600">
                                        {Number(app.panel_total || 0).toFixed(1)}
                                    </td>
                                    <td className="py-4 px-6 text-center font-bold text-indigo-600">
                                        {Number(app.panel_avg || 0).toFixed(1)}
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            {app.panel_status === 'COMPLETED' && (
                                                <button onClick={() => handleReset(app.id)} className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold rounded-lg text-xs transition-colors">
                                                    Reset
                                                </button>
                                            )}
                                            {editApp !== app.id && (
                                                <button onClick={() => openEdit(app)} className="px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold rounded-lg text-xs transition-colors">Edit</button>
                                            )}
                                            <button onClick={() => handleDelete(app.id)} className="px-3 py-1.5 bg-rose-100 text-rose-700 hover:bg-rose-200 font-bold rounded-lg text-xs transition-colors">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {applicants.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="py-8 text-center text-slate-400 font-medium">No applicants found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
export default AdminApplicants;
