import { useState, useEffect } from 'react';
import axios from 'axios';

const TutorDashboard = () => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    applicant_id: '',
    appearance: '',
    expression: '',
    current_affairs: '',
    comment: '',
    remarks: []
  });

  const fetchPending = () => {
    setLoading(true);
    axios.get('/api/tutor.php?action=pending_applicants')
      .then(res => setApplicants(res.data.applicants))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleRemarkToggle = (remark) => {
    setForm(prev => {
      const remarks = prev.remarks.includes(remark)
        ? prev.remarks.filter(r => r !== remark)
        : [...prev.remarks, remark];
      return { ...prev, remarks };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await axios.post('/api/tutor.php?action=submit_score', form);
      setSuccess('Score submitted successfully!');
      setForm({ applicant_id: '', appearance: '', expression: '', current_affairs: '', comment: '', remarks: [] });
      fetchPending();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit score');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading workstation...</div>;

  const remarksList = ['No WAEC Certificate', 'No Birth Certificate', 'Inconsistency in Data', 'Missing Originals', 'Nervous', 'Confident'];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Scoring Workstation</h1>
        <p className="text-sm text-slate-500">Evaluating active applicants in the pool.</p>
      </div>

      {error && <div className="mb-4 bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100">{error}</div>}
      {success && <div className="mb-4 bg-emerald-50 text-emerald-600 p-4 rounded-xl text-sm font-bold border border-emerald-100">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-glass">
            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">1. Identify Applicant</label>
            <select 
              required 
              value={form.applicant_id}
              onChange={e => setForm({...form, applicant_id: e.target.value})}
              className="w-full text-lg font-bold text-slate-700 bg-slate-50 border-2 border-transparent rounded-2xl px-4 py-4 focus:border-indigo-500 transition-all outline-none">
                <option value="">— Select Applicant —</option>
                {applicants.map(a => (
                    <option key={a.id} value={a.id}>{a.applicant_name}</option>
                ))}
            </select>
            {applicants.length === 0 && (
                <div className="mt-4 p-4 rounded-2xl bg-amber-50 text-amber-700 text-sm font-medium italic border border-amber-100">
                    All currently available applicants have been evaluated.
                </div>
            )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            {[
              { id: 'appearance', label: 'Appearance', max: 10 },
              { id: 'expression', label: 'Expression', max: 10 },
              { id: 'current_affairs', label: 'Current Affairs', max: 10 }
            ].map(m => (
              <div key={m.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-glass">
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">{m.label}</label>
                  <select 
                    required 
                    value={form[m.id]}
                    onChange={e => setForm({...form, [m.id]: e.target.value})}
                    className="w-full font-bold text-slate-700 bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 transition-all">
                      <option value="">Score (0-{m.max})</option>
                      {Array.from({length: m.max + 1}, (_, i) => i).map(i => (
                        <option key={i} value={i}>{i}</option>
                      ))}
                  </select>
              </div>
            ))}
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-glass">
            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">2. Mandatory Verification / Remarks</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {remarksList.map(c => (
                    <label key={c} className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${form.remarks.includes(c) ? 'bg-indigo-50 border-indigo-200' : 'border-slate-50 hover:border-indigo-100'}`}>
                        <input 
                          type="checkbox" 
                          checked={form.remarks.includes(c)}
                          onChange={() => handleRemarkToggle(c)}
                          className="w-4 h-4 text-indigo-600 rounded" 
                        />
                        <span className="text-sm font-semibold text-slate-600">{c}</span>
                    </label>
                ))}
            </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-glass">
            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">3. Professional Opinion</label>
            <textarea 
              rows="3" 
              placeholder="Provide qualitative feedback on the interview performance..."
              value={form.comment}
              onChange={e => setForm({...form, comment: e.target.value})}
              className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
            ></textarea>
        </div>

        <button 
          disabled={applicants.length === 0 || submitting}
          className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-slate-200 hover:bg-indigo-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:bg-slate-900 disabled:active:scale-100"
        >
            {submitting ? 'Submitting...' : 'Submit Evaluation'}
        </button>
      </form>
    </div>
  );
};

export default TutorDashboard;
