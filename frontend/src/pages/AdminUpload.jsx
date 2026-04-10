import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AdminUpload = () => {
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [program, setProgram] = useState('');
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleManual = async (e) => {
        e.preventDefault();
        setMessage(''); setError('');
        try {
            const res = await axios.post('/api/admin.php?action=upload_manual', { applicant_name: name, applicant_code: code, program: program });
            setMessage(res.data.message);
            setName(''); setCode(''); setProgram('');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to add applicant');
        }
    };

    const handleCSV = async (e) => {
        e.preventDefault();
        if (!file) return setError('Please select a file');
        setMessage(''); setError('');
        
        const fd = new FormData();
        fd.append('csv_file', file);
        
        try {
            const res = await axios.post('/api/admin.php?action=upload_csv', fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMessage(res.data.message);
            setFile(null);
            e.target.reset();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to import CSV');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Import Data</h1>
                    <p className="text-sm text-slate-500">Inject applicants into the pool</p>
                </div>
                <Link to="/admin/dashboard" className="px-4 py-2 bg-white rounded-xl shadow-sm text-sm font-bold text-slate-600 border border-slate-200">Back Dashboard</Link>
            </div>

            {error && <div className="mb-4 bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100">{error}</div>}
            {message && <div className="mb-4 bg-emerald-50 text-emerald-600 p-4 rounded-xl text-sm font-bold border border-emerald-100">{message}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-glass">
                    <h2 className="text-xl font-bold text-slate-800 mb-6">Quick Add</h2>
                    <form onSubmit={handleManual} className="space-y-4">
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                            <input value={name} onChange={setName} required className="w-full mt-1 px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:border-indigo-500 transition-all text-sm"/>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Applicant Code/PIN (Optional)</label>
                            <input value={code} onChange={setCode} className="w-full mt-1 px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:border-indigo-500 transition-all text-sm"/>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Program</label>
                            <input value={program} onChange={setProgram} placeholder="e.g. General Nursing" className="w-full mt-1 px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:border-indigo-500 transition-all text-sm"/>
                        </div>
                        <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700">Add Applicant</button>
                    </form>
                </div>

                <div className="bg-indigo-900 p-8 rounded-[2rem] shadow-xl text-white">
                    <h2 className="text-xl font-bold mb-2">CSV Import</h2>
                    <p className="text-xs text-indigo-300 mb-6">Upload a file with Name and Code columns.</p>
                    <form onSubmit={handleCSV} className="space-y-6">
                        <div className="border-2 border-dashed border-indigo-700 rounded-2xl p-8 text-center bg-indigo-800/50">
                            <input type="file" required onChange={setFile} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"/>
                        </div>
                        <button className="w-full py-4 bg-white text-indigo-900 rounded-2xl font-bold shadow-lg transition-all hover:bg-indigo-50">Process File</button>
                    </form>
                </div>
            </div>
        </div>
    );
};
export default AdminUpload;
