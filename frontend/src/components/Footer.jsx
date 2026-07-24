import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full border-t border-indigo-950/40 bg-indigo-950/10 py-6 text-center text-xs sm:text-sm text-slate-500">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          &copy; {new Date().getFullYear()} LeadDesk Mini. All rights reserved.
        </div>
        <div>
          <a
            href="https://digitalheroesco.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors underline decoration-indigo-500/50 underline-offset-4 hover:decoration-indigo-400"
          >
            Built for Digital Heroes Training Task
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
