import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const DemoBanner = ({ isDemo }) => {
  const [visible, setVisible] = useState(true);

  if (!isDemo || !visible) return null;

  return (
    <div className="w-full bg-amber-950/80 border-b border-amber-500/20 text-amber-200 px-6 py-3.5 flex items-center justify-between text-xs sm:text-sm font-medium backdrop-blur-xl relative z-50">
      <div className="flex items-center gap-2.5 max-w-5xl mx-auto flex-1 justify-center text-center">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        <span className="leading-relaxed">
          <strong className="text-amber-300">⚠️ Demo Mode:</strong> Database is not configured. This live demo showcases the UI/UX only. Connect a MongoDB instance to enable lead storage and campaign management.
        </span>
      </div>
      <button 
        onClick={() => setVisible(false)} 
        className="p-1 hover:bg-white/10 rounded-lg transition-colors text-amber-400 hover:text-white shrink-0 cursor-pointer"
        aria-label="Dismiss banner"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default DemoBanner;
