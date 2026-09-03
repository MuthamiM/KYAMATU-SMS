import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { GraduationCap, Loader2, Eye, EyeOff, LogIn, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import loginBg from '../assets/login-bg.png';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

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
      className="min-h-[100dvh] flex items-center justify-center p-4 sm:p-6 bg-cover bg-center bg-no-repeat relative overflow-hidden"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/75 via-blue-950/60 to-slate-950/75 z-0" />

      {/* Animated decorative orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse z-0" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse z-0" style={{ animationDelay: '1s' }} />

      <div className="w-full max-w-md z-10 relative">
        {/* School badge / branding above card */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white/80 text-xs font-medium tracking-wider uppercase">
            <BookOpen className="w-3.5 h-3.5" />
            Competency-Based Curriculum Portal
          </div>
        </div>

        {/* Main login card */}
        <div className="bg-white/[0.92] backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/20 p-7 sm:p-9 w-full border border-white/30 relative overflow-hidden">
          {/* Subtle top accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

          {/* School identity */}
          <div className="text-center mb-7">
            <div className="w-[68px] h-[68px] bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-600/30 rotate-3 hover:rotate-0 transition-transform duration-300">
              <GraduationCap className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-2xl sm:text-[1.7rem] font-black text-gray-900 tracking-tight leading-tight">
              Matundu Primary School
            </h1>
            <p className="text-sm text-gray-500 font-medium mt-1.5 italic">
              "Nurturing Excellence, Building Futures"
            </p>
          </div>

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                Email or Admission Number
              </label>
              <div className="relative">
                <input
                  id="login-email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 bg-gray-50/80 border border-gray-200/80 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                  placeholder="e.g. admin@matundu.ac.ke"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 bg-gray-50/80 border border-gray-200/80 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all pr-11"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-[18px] w-[18px]" aria-hidden="true" />
                  ) : (
                    <Eye className="h-[18px] w-[18px]" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/25 transition-all duration-200 hover:shadow-xl hover:shadow-blue-600/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-[18px] h-[18px]" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-[11px] text-center text-gray-400">
              Contact your school administrator if you need access credentials.
            </p>
          </div>
        </div>

        {/* Below-card attribution */}
        <p className="text-center text-[11px] text-white/40 mt-5 tracking-wide">
          Powered by <span className="font-semibold text-white/55">KYAMATU SMS</span> &middot; © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}

export default Login;
