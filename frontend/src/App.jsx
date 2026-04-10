import { useState, useEffect, createContext, useContext } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet, Link } from 'react-router-dom'
import axios from 'axios'
import AdminDashboard from './pages/AdminDashboard'
import AdminApplicants from './pages/AdminApplicants'
import AdminTutors from './pages/AdminTutors'
import AdminUpload from './pages/AdminUpload'
import AdminSettings from './pages/AdminSettings'
import AdminExports from './pages/AdminExports'
import AdminSubmissions from './pages/AdminSubmissions'
import TutorDashboard from './pages/TutorDashboard'
import TutorSubmissions from './pages/TutorSubmissions'
import AccountPage from './pages/AccountPage'

export const AuthContext = createContext(null)

axios.defaults.withCredentials = true;

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  if (!user) return null;

  return (
    <nav className="w-full md:w-64 bg-white md:border-r border-b md:border-b-0 border-slate-200 flex flex-col justify-between md:h-screen md:sticky top-0 py-6 md:py-8 shrink-0">
      <div className="px-6">
        <div className="font-black text-2xl text-indigo-600 tracking-tight mb-6 md:mb-8">PanelScore</div>
        
        <div className="hidden md:block mb-8">
          <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-2">User</p>
          <span className="text-sm font-bold text-slate-800 block">Hello, {user.name}</span>
        </div>

        <div className="flex md:flex-col gap-2 md:gap-3 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
          <p className="hidden md:block text-xs font-black uppercase text-slate-400 tracking-widest mb-1 mt-4">Menu</p>
          {user.role === 'tutor' && (
              <>
                 <Link to="/tutor/dashboard" className="whitespace-nowrap px-4 py-3 bg-slate-50 text-sm font-bold text-slate-600 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors">Workstation</Link>
                 <Link to="/tutor/submissions" className="whitespace-nowrap px-4 py-3 bg-slate-50 text-sm font-bold text-slate-600 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors">History</Link>
                 <Link to="/account" className="whitespace-nowrap px-4 py-3 bg-slate-50 text-sm font-bold text-slate-600 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors">My Account</Link>
              </>
          )}
          {user.role === 'admin' && (
              <>
                 <Link to="/admin/dashboard" className="whitespace-nowrap px-4 py-3 bg-slate-50 text-sm font-bold text-slate-600 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors">Dashboard</Link>
                 <Link to="/admin/applicants" className="whitespace-nowrap px-4 py-3 bg-slate-50 text-sm font-bold text-slate-600 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors">Applicants</Link>
                 <Link to="/admin/tutors" className="whitespace-nowrap px-4 py-3 bg-slate-50 text-sm font-bold text-slate-600 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors">Tutors</Link>
                 <Link to="/admin/upload" className="whitespace-nowrap px-4 py-3 bg-slate-50 text-sm font-bold text-slate-600 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors">Import</Link>
                 <Link to="/admin/submissions" className="whitespace-nowrap px-4 py-3 bg-slate-50 text-sm font-bold text-slate-600 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors">Submissions</Link>
                 <Link to="/admin/exports" className="whitespace-nowrap px-4 py-3 bg-slate-50 text-sm font-bold text-slate-600 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors">Scoring</Link>
                 <Link to="/admin/settings" className="whitespace-nowrap px-4 py-3 bg-slate-50 text-sm font-bold text-slate-600 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors">System Rules</Link>
                 <Link to="/account" className="whitespace-nowrap px-4 py-3 bg-slate-50 text-sm font-bold text-slate-600 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors">My Account</Link>
              </>
          )}
          
          <button onClick={logout} className="md:hidden whitespace-nowrap px-4 py-3 bg-rose-50 text-sm font-bold text-rose-600 rounded-2xl hover:bg-rose-100 transition-colors">Logout</button>
        </div>
      </div>
      <div className="hidden md:block px-6 mt-8">
        <button onClick={logout} className="w-full px-4 py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-black uppercase tracking-wider rounded-2xl transition-all">Logout</button>
      </div>
    </nav>
  );
};

const ProtectedRoute = ({ role }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex-1 w-full overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

const Login = () => {
    const { user, login } = useContext(AuthContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    if (user) {
        return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/tutor/dashboard'} replace />;
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await login(username, password);
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-[2.5rem] shadow-glass border border-slate-200">
                <h2 className="text-3xl font-black text-slate-800 text-center mb-8">Login</h2>
                {error && <div className="mb-4 text-sm text-red-500 bg-red-50 p-4 rounded-2xl border border-red-100">{error}</div>}
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <input className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl px-6 py-4 focus:ring-2 focus:border-transparent focus:ring-indigo-500 transition-all outline-none" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
                    </div>
                    <div>
                        <input className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl px-6 py-4 focus:ring-2 focus:border-transparent focus:ring-indigo-500 transition-all outline-none" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
                    </div>
                    <button className="w-full bg-indigo-600 text-white font-black text-lg rounded-2xl py-4 shadow-xl shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all">SIGN IN</button>
                </form>
            </div>
        </div>
    );
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/auth.php?action=me')
      .then(res => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (username, password) => {
      const res = await axios.post('/api/auth.php?action=login', { username, password });
      setUser(res.data.user);
  };

  const logout = async () => {
      await axios.post('/api/auth.php?action=logout');
      setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute role="admin" />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/applicants" element={<AdminApplicants />} />
            <Route path="/admin/tutors" element={<AdminTutors />} />
            <Route path="/admin/upload" element={<AdminUpload />} />
            <Route path="/admin/submissions" element={<AdminSubmissions />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/exports" element={<AdminExports />} />
          </Route>
          
          <Route element={<ProtectedRoute role="tutor" />}>
            <Route path="/tutor/dashboard" element={<TutorDashboard />} />
            <Route path="/tutor/submissions" element={<TutorSubmissions />} />
          </Route>
          
          <Route element={<ProtectedRoute />}>
            <Route path="/account" element={<AccountPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  )
}

export default App
