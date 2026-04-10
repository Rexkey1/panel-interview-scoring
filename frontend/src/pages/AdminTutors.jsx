import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AdminTutors = () => {
    const [tutors, setTutors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formState, setFormState] = useState({ id: 0, name: '', username: '', password: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const fetchTutors = () => {
        setLoading(true);
        axios.get('/api/admin.php?action=tutors')
            .then(res => setTutors(res.data.tutors))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchTutors();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this tutor? Their scores will still exist but they can't login.")) return;
        try {
            await axios.post('/api/admin.php?action=delete_tutor', { id });
            fetchTutors();
        } catch (e) {
            alert('Failed to delete tutor.');
        }
    };

    const handleToggle = async (id) => {
        try {
            await axios.post('/api/admin.php?action=toggle_tutor', { id });
            fetchTutors();
        } catch (e) {
            alert('Failed to toggle access.');
        }
    };

    const handleEdit = (tutor) => {
        setFormState({ id: tutor.id, name: tutor.name, username: tutor.username, password: '' });
        setShowForm(true);
        setMessage(''); setError('');
    };

    const saveTutor = async (e) => {
        e.preventDefault();
        setMessage(''); setError('');
        try {
            const res = await axios.post('/api/admin.php?action=save_tutor', formState);
            setMessage(res.data.message);
            setFormState({ id: 0, name: '', username: '', password: '' });
            setShowForm(false);
            fetchTutors();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save tutor.');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Panel Tutors</h1>
                    <p className="text-sm text-slate-500">Manage registered scoring accounts.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => { setFormState({ id: 0, name: '', username: '', password: '' }); setShowForm(!showForm); setMessage(''); setError(''); }} className="px-4 py-2 bg-indigo-600 rounded-xl shadow-sm text-sm font-bold text-white shadow-indigo-200 hover:bg-indigo-700">
                        {showForm ? 'Cancel' : '+ Add Tutor'}
                    </button>
                    <Link to="/admin/dashboard" className="px-4 py-2 bg-white rounded-xl shadow-sm text-sm font-bold text-slate-600 border border-slate-200 hover:bg-slate-50">Back Dashboard</Link>
                </div>
            </div>

            {error && <div className="mb-4 bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100">{error}</div>}
            {message && <div className="mb-4 bg-emerald-50 text-emerald-600 p-4 rounded-xl text-sm font-bold border border-emerald-100">{message}</div>}

            {showForm && (
                <div className="bg-white border border-slate-200 rounded-[2rem] shadow-glass p-8 mb-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-6">{formState.id ? 'Edit Tutor' : 'Create New Tutor'}</h2>
                    <form onSubmit={saveTutor} className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="w-full">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                            <input required value={formState.name} onChange={e=>setFormState({...formState, name: e.target.value})} className="w-full mt-1 px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:border-indigo-500 transition-all text-sm"/>
                        </div>
                        <div className="w-full">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Username</label>
                            <input required value={formState.username} onChange={e=>setFormState({...formState, username: e.target.value})} className="w-full mt-1 px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:border-indigo-500 transition-all text-sm"/>
                        </div>
                        <div className="w-full">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{formState.id ? 'Password (leave blank to keep)' : 'Password'}</label>
                            <input type="password" required={!formState.id} value={formState.password} onChange={e=>setFormState({...formState, password: e.target.value})} className="w-full mt-1 px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:border-indigo-500 transition-all text-sm"/>
                        </div>
                        <button className="w-full md:w-auto px-8 py-3 h-[46px] bg-slate-900 text-white rounded-2xl font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all mb-[1px]">Save</button>
                    </form>
                </div>
            )}

            <div className="bg-white border border-slate-200 rounded-[2rem] shadow-glass overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="py-4 px-6 text-[10px] uppercase tracking-widest font-black text-slate-400">Name</th>
                                <th className="py-4 px-6 text-[10px] uppercase tracking-widest font-black text-slate-400">Username</th>
                                <th className="py-4 px-6 text-[10px] uppercase tracking-widest font-black text-slate-400 text-center">Status</th>
                                <th className="py-4 px-6 text-[10px] uppercase tracking-widest font-black text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan="4" className="py-8 text-center text-slate-400">Loading...</td></tr>
                            ) : tutors.map(tutor => (
                                <tr key={tutor.id} className={`hover:bg-slate-50/50 transition-colors ${Number(tutor.is_active)===0 ? 'opacity-50' : ''}`}>
                                    <td className="py-4 px-6 font-bold text-slate-700">{tutor.name}</td>
                                    <td className="py-4 px-6 text-sm text-slate-500">{tutor.username}</td>
                                    <td className="py-4 px-6 text-center">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${Number(tutor.is_active)===1 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                            {Number(tutor.is_active)===1 ? 'Active' : 'Disabled'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleToggle(tutor.id)} className="px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold rounded-lg text-xs transition-colors">
                                                Toggle Access
                                            </button>
                                            <button onClick={() => handleEdit(tutor)} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-bold rounded-lg text-xs transition-colors">
                                                Edit
                                            </button>
                                            <button onClick={() => handleDelete(tutor.id)} className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold rounded-lg text-xs transition-colors">
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!loading && tutors.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="py-8 text-center text-slate-400 font-medium">No tutors found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
export default AdminTutors;
