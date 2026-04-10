import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/admin.php?action=dashboard')
      .then(res => {
        setStats(res.data.stats);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading Dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-10">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">System Overview</h1>
        <p className="text-slate-500 mt-2 text-sm md:text-base">Welcome back! Here is what's happening with your applications today.</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 mb-12">
          <StatCard title="Applicants" value={stats.total_applicants} color="blue" icon={<UsersIcon />} />
          <StatCard title="Active Tutors" value={stats.active_tutors} color="indigo" icon={<BriefcaseIcon />} />
          <StatCard title="Total Submissions" value={stats.total_submissions} color="emerald" icon={<CheckCircleIcon />} />
          <StatCard title="Completed" value={stats.completed} color="violet" icon={<ClipboardCheckIcon />} />
          <StatCard title="Pending Review" value={stats.pending} color="amber" icon={<ClockIcon />} />
        </div>
      )}

      <div className="bg-slate-900 rounded-[2.5rem] p-6 md:p-12 overflow-hidden relative mb-12">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-md">
            <h2 className="text-2xl font-bold text-white">Quick Actions</h2>
            <p className="text-slate-400 mt-2 text-sm leading-relaxed">Execute primary administrative tasks. You can manage your tutor panel, upload new applicant datasets, or review scoring progress.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:w-auto">
            <Link to="/admin/upload" className="flex items-center gap-4 bg-white/10 hover:bg-white/20 border border-white/10 p-4 rounded-2xl transition-all group">
              <div className="bg-white/10 p-2 rounded-lg group-hover:scale-110 transition-transform">
                <UploadIcon />
              </div>
              <div>
                <div className="text-white font-bold text-sm">Upload Data</div>
                <div className="text-slate-400 text-[10px] uppercase font-bold tracking-tighter">CSV/Excel Import</div>
              </div>
            </Link>
            <Link to="/admin/tutors" className="flex items-center gap-4 bg-indigo-600 hover:bg-indigo-500 p-4 rounded-2xl transition-all shadow-xl shadow-indigo-900/20 group">
              <div className="bg-white/20 p-2 rounded-lg group-hover:scale-110 transition-transform">
                <UsersIcon />
              </div>
              <div>
                <div className="text-white font-bold text-sm">Manage Tutors</div>
                <div className="text-indigo-200 text-[10px] uppercase font-bold tracking-tighter">Panel Control</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Icons (Simple SVGs)
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const BriefcaseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" /></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ClipboardCheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;

const StatCard = ({ title, value, color, icon }) => {
  const colorMap = {
    blue: 'bg-blue-500 shadow-blue-200',
    indigo: 'bg-indigo-500 shadow-indigo-200',
    emerald: 'bg-emerald-500 shadow-emerald-200',
    violet: 'bg-violet-500 shadow-violet-200',
    amber: 'bg-amber-500 shadow-amber-200',
  };
  return (
    <div className="relative group bg-white border border-slate-200 rounded-3xl p-4 md:p-6 shadow-glass transition-all hover:-translate-y-1">
      <div className={`${colorMap[color]} w-10 h-10 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg`}>
        {icon}
      </div>
      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</div>
      <div className="text-2xl md:text-3xl font-black text-slate-800 mt-1">{value}</div>
    </div>
  );
};

export default AdminDashboard;
