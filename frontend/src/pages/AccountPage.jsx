import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../App';

const AccountPage = () => {
    const { logout } = useContext(AuthContext);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(''); setError('');

        if (newPassword && newPassword !== confirmPassword) {
            return setError('New passwords do not match.');
        }
        if (!newUsername && !newPassword) {
            return setError('Enter a new username and/or new password.');
        }

        setLoading(true);
        try {
            const res = await axios.post('/api/auth.php?action=change_credentials', {
                current_password: currentPassword,
                new_username: newUsername,
                new_password: newPassword,
            });
            setMessage(res.data.message);
            setCurrentPassword(''); setNewUsername(''); setNewPassword(''); setConfirmPassword('');
            // Force re-login since credentials changed
            setTimeout(() => logout(), 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800">My Account</h1>
                <p className="text-sm text-slate-500 mt-1">Change your login username or password.</p>
            </div>

            {message && (
                <div className="mb-6 bg-emerald-50 border border-emerald-100 text-emerald-700 px-5 py-4 rounded-2xl text-sm font-bold">
                    ✓ {message} <span className="font-normal opacity-70">You will be logged out shortly…</span>
                </div>
            )}
            {error && (
                <div className="mb-6 bg-red-50 border border-red-100 text-red-600 px-5 py-4 rounded-2xl text-sm font-bold">
                    {error}
                </div>
            )}

            <div className="bg-white border border-slate-200 rounded-[2rem] shadow-glass p-8">
                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Current Password – always required */}
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Current Password <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="password"
                            required
                            value={currentPassword}
                            onChange={e => setCurrentPassword(e.target.value)}
                            className="w-full mt-1 px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all text-sm"
                            placeholder="Enter your current password"
                        />
                    </div>

                    <hr className="border-slate-100" />
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Update Fields (fill one or both)</p>

                    {/* New Username */}
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Username</label>
                        <input
                            type="text"
                            value={newUsername}
                            onChange={e => setNewUsername(e.target.value)}
                            className="w-full mt-1 px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all text-sm"
                            placeholder="Leave blank to keep current"
                        />
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            className="w-full mt-1 px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all text-sm"
                            placeholder="Leave blank to keep current"
                        />
                    </div>

                    {/* Confirm New Password */}
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            className={`w-full mt-1 px-4 py-3 rounded-2xl border bg-slate-50 text-slate-800 outline-none focus:ring-2 focus:border-transparent transition-all text-sm ${
                                confirmPassword && confirmPassword !== newPassword
                                    ? 'border-rose-400 focus:ring-rose-300'
                                    : 'border-slate-200 focus:ring-indigo-400'
                            }`}
                            placeholder="Repeat your new password"
                        />
                        {confirmPassword && confirmPassword !== newPassword && (
                            <p className="text-xs text-rose-500 mt-1 ml-1 font-bold">Passwords do not match</p>
                        )}
                    </div>

                    <button
                        disabled={loading}
                        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-base shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        {loading ? 'Saving…' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AccountPage;
