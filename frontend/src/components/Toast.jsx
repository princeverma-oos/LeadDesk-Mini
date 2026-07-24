import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle2, AlertOctagon } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isArray = Array.isArray(message);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={`fixed bottom-6 right-6 z-50 flex items-start gap-3 max-w-sm p-4 rounded-xl border shadow-2xl backdrop-blur-xl ${
        type === 'success'
          ? 'bg-indigo-950/85 border-indigo-500/30 text-indigo-200'
          : 'bg-rose-950/85 border-rose-500/30 text-rose-200'
      }`}
    >
      <div className="mt-0.5">
        {type === 'success' ? (
          <CheckCircle2 className="w-5 h-5 text-indigo-400" />
        ) : (
          <AlertOctagon className="w-5 h-5 text-rose-400" />
        )}
      </div>

      <div className="flex-1 text-sm font-medium">
        {isArray ? (
          <ul className="list-disc list-inside space-y-1">
            {message.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        ) : (
          <p>{message}</p>
        )}
      </div>

      <button
        onClick={onClose}
        className="p-1 hover:bg-white/10 rounded-lg transition-colors shrink-0 text-slate-400 hover:text-slate-200"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

export default Toast;
