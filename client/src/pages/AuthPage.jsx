import React, { useState } from 'react';
import { Zap, ShieldCheck, ArrowRight, Sparkles, Building2, User, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthPage = () => {
  const { login, register, demoLogin } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register(name, email, password, orgName, jobTitle);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async (role) => {
    setError('');
    setLoading(true);
    try {
      await demoLogin(role);
    } catch (err) {
      setError(err.response?.data?.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col lg:flex-row">
      {/* Left Hero Column */}
      <div className="lg:w-1/2 p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-brand-950/40 border-r border-slate-800/80">
        {/* Background glow effects */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand */}
        <div className="flex items-center space-x-3 z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-sky-400 flex items-center justify-center shadow-lg shadow-brand-500/25">
            <Zap className="w-6 h-6 text-white fill-white" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              Nexus<span className="text-brand-400">Work</span>
            </span>
            <div className="text-[10px] font-semibold tracking-widest uppercase text-slate-400">
              Enterprise SaaS Platform
            </div>
          </div>
        </div>

        {/* Hero Copy */}
        <div className="my-12 z-10 max-w-lg">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>Next-Gen MERN Workforce & Project Cloud</span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Scale your engineering teams with unified velocity.
          </h1>

          <p className="mt-4 text-slate-400 text-sm leading-relaxed">
            Multi-tenant organization isolation, dynamic RBAC, real-time drag-and-drop Kanban,
            WebSocket team chat, business analytics, and built-in AI productivity copilots.
          </p>

          {/* Quick Demo Login Grid for Reviewers */}
          <div className="mt-8 p-5 rounded-2xl bg-slate-900/80 border border-slate-750 backdrop-blur-md">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Instant Reviewer Demo Accounts</span>
              <span className="text-[10px] text-brand-400 font-normal">Click to test role</span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3">
              <button
                type="button"
                onClick={() => handleDemoClick('Admin')}
                disabled={loading}
                className="p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 text-left border border-slate-700 hover:border-purple-500/50 transition-all group"
              >
                <div className="text-xs font-bold text-purple-300 group-hover:text-purple-200">
                  Sarah (Owner/Admin)
                </div>
                <div className="text-[11px] text-slate-400">Full system & org authority</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoClick('Project Manager')}
                disabled={loading}
                className="p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 text-left border border-slate-700 hover:border-amber-500/50 transition-all group"
              >
                <div className="text-xs font-bold text-amber-300 group-hover:text-amber-200">
                  Alex (Project Manager)
                </div>
                <div className="text-[11px] text-slate-400">Sprints, backlog & tasks</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoClick('Team Member')}
                disabled={loading}
                className="p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 text-left border border-slate-700 hover:border-sky-500/50 transition-all group"
              >
                <div className="text-xs font-bold text-sky-300 group-hover:text-sky-200">
                  David (Team Member)
                </div>
                <div className="text-[11px] text-slate-400">Kanban updates & chat</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoClick('Viewer')}
                disabled={loading}
                className="p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 text-left border border-slate-700 hover:border-emerald-500/50 transition-all group"
              >
                <div className="text-xs font-bold text-emerald-300 group-hover:text-emerald-200">
                  Elena (Viewer / Client)
                </div>
                <div className="text-[11px] text-slate-400">Read-only KPI reports</div>
              </button>
            </div>
          </div>
        </div>

        {/* Feature Badges */}
        <div className="flex flex-wrap gap-4 text-xs text-slate-400 z-10">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>JWT & RBAC Security</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Building2 className="w-4 h-4 text-brand-400" />
            <span>Multi-Tenant Isolated</span>
          </div>
        </div>
      </div>

      {/* Right Form Column */}
      <div className="lg:w-1/2 p-8 lg:p-16 flex items-center justify-center bg-slate-950">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              {isRegister ? 'Create an enterprise account' : 'Welcome back'}
            </h2>
            <p className="text-xs text-slate-400">
              {isRegister
                ? 'Register your organization and team lead profile'
                : 'Enter your credentials to access your workspace'}
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-900 border border-slate-750 text-slate-100 text-xs focus:border-brand-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Organization / Company Name
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder="Acme Technologies"
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-900 border border-slate-750 text-slate-100 text-xs focus:border-brand-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Job Title</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="VP of Engineering / Lead Architect"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-750 text-slate-100 text-xs focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Corporate Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@enterprise.com"
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-900 border border-slate-750 text-slate-100 text-xs focus:border-brand-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-900 border border-slate-750 text-slate-100 text-xs focus:border-brand-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-lg shadow-brand-500/25 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : isRegister ? 'Create Organization' : 'Sign In'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="text-xs text-brand-400 hover:text-brand-300 font-medium"
            >
              {isRegister
                ? 'Already registered? Sign in here'
                : "Don't have an organization yet? Create a new one"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
