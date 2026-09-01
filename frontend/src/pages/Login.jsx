import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { GraduationCap, Loader2, Eye, EyeOff, ShieldCheck, UserCheck, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import loginBg from '../assets/login-bg.png';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleQuickLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    toast.loading(`Signing in as ${demoEmail}...`, { id: 'auth-toast' });
    const result = await login(demoEmail, demoPassword);
    if (result.success) {
      toast.success('Welcome back!', { id: 'auth-toast' });
      navigate('/dashboard');
    } else {
      toast.error(result.error || 'Login failed. Please check credentials.', { id: 'auth-toast' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    const result = await login(email, password);

    if (result.success) {
      toast.success('Welcome back!');
      navigate('/dashboard');
    } else {
      toast.error(result.error || 'Login failed. Please check credentials.');
    }
  };

  return (
    <div
      className="min-h-[100dvh] flex items-center justify-center p-4 sm:p-6 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm z-0"></div>
      <div className="w-full max-w-lg z-10 relative">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-6 sm:p-8 w-full border border-white/20">
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/25">
              <GraduationCap className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Matundu Primary School</h1>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">Competency-Based Curriculum (CBC) SMS Portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Email or Admission Number
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition"
                placeholder="e.g. admin@matundu.ac.ke or MAT/2026/0117"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition pr-10"
                  placeholder="Enter password (e.g. Admin@123)"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Bar */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 text-center mb-3 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Quick One-Click Demo Credentials
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@matundu.ac.ke', 'Admin@123')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 text-left transition group"
              >
                <p className="text-xs font-bold text-gray-900 group-hover:text-blue-700 flex items-center gap-1">
                  👑 Admin
                </p>
                <p className="text-[10px] text-gray-500 truncate">admin@matundu.ac.ke</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('student.117@matundu.ac.ke', 'Admin@123')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 text-left transition group"
              >
                <p className="text-xs font-bold text-gray-900 group-hover:text-emerald-700 flex items-center gap-1">
                  🎓 Student
                </p>
                <p className="text-[10px] text-gray-500 truncate">student.117@matundu.ac.ke</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('nathan@matundu.ac.ke', 'Admin@123')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-100 hover:border-purple-200 text-left transition group"
              >
                <p className="text-xs font-bold text-gray-900 group-hover:text-purple-700 flex items-center gap-1">
                  👨‍🏫 Teacher
                </p>
                <p className="text-[10px] text-gray-500 truncate">nathan@matundu.ac.ke</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('bursar@matundu.ac.ke', 'Admin@123')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-100 hover:border-amber-200 text-left transition group"
              >
                <p className="text-xs font-bold text-gray-900 group-hover:text-amber-700 flex items-center gap-1">
                  💰 Bursar
                </p>
                <p className="text-[10px] text-gray-500 truncate">bursar@matundu.ac.ke</p>
              </button>
            </div>
            <p className="text-[11px] text-center text-gray-400 mt-3">
              Standard Password for all test accounts: <span className="font-mono font-bold text-gray-600">Admin@123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
