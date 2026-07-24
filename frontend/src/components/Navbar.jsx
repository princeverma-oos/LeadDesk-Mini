import React from 'react';
import { Layers, ShieldCheck, ArrowLeft } from 'lucide-react';

const Navbar = ({ currentPath, onNavigate }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-indigo-950/30 bg-slate-950/40 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div 
          onClick={() => onNavigate('/')} 
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="p-1.5 bg-indigo-500/10 rounded-lg group-hover:bg-indigo-500/20 border border-indigo-500/20 transition-all">
            <Layers className="w-5 h-5 text-indigo-400" />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-100">
            LeadDesk <span className="text-indigo-400 font-medium">Mini</span>
          </span>
        </div>

        <nav className="flex items-center gap-4">
          {currentPath === '/admin' ? (
            <button
              onClick={() => onNavigate('/')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-slate-300 hover:text-slate-100 hover:bg-white/5 transition-all border border-slate-800"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Site
            </button>
          ) : (
            <button
              onClick={() => onNavigate('/admin')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-indigo-300 bg-indigo-950/30 hover:bg-indigo-950/60 border border-indigo-500/20 hover:border-indigo-500/50 transition-all btn-ripple"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              Admin Dashboard
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
