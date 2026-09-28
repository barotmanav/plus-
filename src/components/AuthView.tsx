import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, Lock, User, Building, GraduationCap, ArrowRight, CheckCircle2, X, ShieldCheck } from 'lucide-react';

interface AuthViewProps {
  initialMode?: 'login' | 'register' | 'forgot';
  defaultEmail?: string;
  onClose?: () => void;
  onSuccess?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  initialMode = 'login',
  defaultEmail = '',
  onClose,
  onSuccess,
}) => {
  const { login, registerStudent, departments, classes } = useApp();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  
  // Login form
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register form
  const [name, setName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deptId, setDeptId] = useState(departments[0]?.id || 'dept-it');
  const [semester, setSemester] = useState(3);
  const [classId, setClassId] = useState(classes[0]?.id || 'class-it-a');
  const [regError, setRegError] = useState('');

  // Forgot password
  const [forgotSent, setForgotSent] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!email.trim() || !password) {
      setLoginError('Please enter both email and password.');
      return;
    }
    const success = login(email, password);
    if (!success) {
      setLoginError('Invalid email or password. Please verify your college credentials.');
    } else {
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!name.trim() || !regEmail.trim() || !regPassword) {
      setRegError('Please fill in all required fields.');
      return;
    }
    if (regPassword.length < 6) {
      setRegError('Password must be at least 6 characters long.');
      return;
    }
    if (regPassword !== confirmPassword) {
      setRegError('Passwords do not match. Please re-enter.');
      return;
    }

    registerStudent({
      name: name.trim(),
      email: regEmail.trim(),
      departmentId: deptId,
      semester,
      classId,
      password: regPassword,
    });

    if (onSuccess) onSuccess();
    if (onClose) onClose();
  };

  const content = (
    <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden relative">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-20 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          title="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Top Tab Switcher */}
      <div className="flex border-b border-slate-100 bg-slate-50 text-xs font-semibold">
        <button
          onClick={() => { setMode('login'); setLoginError(''); }}
          className={`flex-1 py-3 text-center transition-colors ${
            mode === 'login' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => { setMode('register'); setRegError(''); }}
          className={`flex-1 py-3 text-center transition-colors ${
            mode === 'register' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Student Registration
        </button>
      </div>

      {/* Tab 1: Login */}
      {mode === 'login' && (
        <div className="p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Sign in to CampusPulse</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your college email and password to access your dashboard.
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">College Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="name@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-[11px] text-blue-600 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              <span>Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Standard Accounts Reference (Dean, Faculty, Student, CR) */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                Standard College Accounts
              </span>
              <span className="text-[10px] text-slate-400">Click to fill</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* Admin */}
              <div
                onClick={() => {
                  setEmail('admin@campuspulse.edu');
                  setPassword('admin123');
                  setLoginError('');
                }}
                className="p-2 rounded-xl bg-purple-50/60 border border-purple-100 hover:border-purple-300 cursor-pointer transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-900 text-[11px]">Dean / Admin</span>
                  <span className="text-[9px] font-mono text-purple-600 bg-purple-100 px-1 rounded">Admin</span>
                </div>
                <p className="text-[10px] text-slate-500 font-mono truncate">admin@campuspulse.edu</p>
                <p className="text-[10px] text-purple-700 font-mono mt-0.5">pw: admin123</p>
              </div>

              {/* Faculty */}
              <div
                onClick={() => {
                  setEmail('faculty@campuspulse.edu');
                  setPassword('faculty123');
                  setLoginError('');
                }}
                className="p-2 rounded-xl bg-teal-50/60 border border-teal-100 hover:border-teal-300 cursor-pointer transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-teal-900 text-[11px]">Faculty Mentor</span>
                  <span className="text-[9px] font-mono text-teal-600 bg-teal-100 px-1 rounded">Faculty</span>
                </div>
                <p className="text-[10px] text-slate-500 font-mono truncate">faculty@campuspulse.edu</p>
                <p className="text-[10px] text-teal-700 font-mono mt-0.5">pw: faculty123</p>
              </div>

              {/* Student */}
              <div
                onClick={() => {
                  setEmail('student@campuspulse.edu');
                  setPassword('student123');
                  setLoginError('');
                }}
                className="p-2 rounded-xl bg-blue-50/60 border border-blue-100 hover:border-blue-300 cursor-pointer transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-900 text-[11px]">Student (IT-A)</span>
                  <span className="text-[9px] font-mono text-blue-600 bg-blue-100 px-1 rounded">Student</span>
                </div>
                <p className="text-[10px] text-slate-500 font-mono truncate">student@campuspulse.edu</p>
                <p className="text-[10px] text-blue-700 font-mono mt-0.5">pw: student123</p>
              </div>

              {/* CR */}
              <div
                onClick={() => {
                  setEmail('cr@campuspulse.edu');
                  setPassword('cr123');
                  setLoginError('');
                }}
                className="p-2 rounded-xl bg-emerald-50/60 border border-emerald-100 hover:border-emerald-300 cursor-pointer transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900 text-[11px]">Class Rep (CR)</span>
                  <span className="text-[9px] font-mono text-emerald-600 bg-emerald-100 px-1 rounded">CR</span>
                </div>
                <p className="text-[10px] text-slate-500 font-mono truncate">cr@campuspulse.edu</p>
                <p className="text-[10px] text-emerald-700 font-mono mt-0.5">pw: cr123</p>
              </div>
            </div>
          </div>

          <div className="pt-1 text-center text-xs text-slate-500">
            Don't have a student account yet?{' '}
            <button
              onClick={() => { setMode('register'); setRegError(''); }}
              className="text-blue-600 font-semibold hover:underline"
            >
              Create Account
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Student Registration */}
      {mode === 'register' && (
        <form onSubmit={handleRegisterSubmit} className="p-6 space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Student Sign Up</h2>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Role: Student
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Normal registration creates a verified Student account.
            </p>
          </div>

          {regError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
              {regError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                placeholder="First & Last Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Student Email *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                placeholder="student@college.edu"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password *</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Academic Placement */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department *</label>
              <select
                value={deptId}
                onChange={(e) => setDeptId(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Class Section *</label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Semester</label>
            <select
              value={semester}
              onChange={(e) => setSemester(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm mt-2"
          >
            Complete Registration &amp; Open Feed
          </button>

          <p className="text-[11px] text-center text-slate-500 pt-1">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => { setMode('login'); setLoginError(''); }}
              className="text-blue-600 font-semibold hover:underline"
            >
              Sign In
            </button>
          </p>
        </form>
      )}

      {/* Tab 3: Forgot Password */}
      {mode === 'forgot' && (
        <div className="p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900">Reset Password</h2>
          {forgotSent ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="text-xs font-bold text-emerald-900">Reset instructions sent!</p>
              <p className="text-[11px] text-emerald-700">Check your college email inbox for the reset link.</p>
              <button
                onClick={() => setMode('login')}
                className="text-xs text-blue-600 font-bold hover:underline block mx-auto pt-2"
              >
                Return to Sign In
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setForgotSent(true);
              }}
              className="space-y-3"
            >
              <p className="text-xs text-slate-500">
                Enter your registered college email and we will send a password reset link.
              </p>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="student@college.edu"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
              >
                Send Reset Link
              </button>
              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full text-center text-xs text-slate-500 hover:underline"
              >
                Cancel
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );

  if (onClose) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
        {content}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-500/20 mb-3">
          CP
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">CampusPulse</h1>
        <p className="text-xs text-slate-500 font-medium mt-1">College notices. Delivered instantly.</p>
      </div>

      {content}
    </div>
  );
};

