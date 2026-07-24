import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Send, Loader2 } from 'lucide-react';
import { submitLead } from '../services/api';

const LeadForm = ({ onSuccess, onError, isDemo }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      budget: '',
      message: ''
    }
  });

  const onSubmit = async (data) => {
    if (isDemo) {
      onError([
        'Demo Mode',
        'Database is not connected.',
        'Configure MONGODB_URI in the backend to enable this feature.'
      ]);
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await submitLead(data);
      if (response.success) {
        onSuccess(response.message || 'Lead submitted successfully');
        reset();
      } else {
        onError(response.message || 'Failed to submit lead');
      }
    } catch (error) {
      console.error('Submission error:', error);
      const serverErrors = error.response?.data?.errors;
      if (serverErrors && Array.isArray(serverErrors)) {
        // Extract validation error messages
        onError(serverErrors.map(err => err.message));
      } else {
        onError(error.response?.data?.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Name Input */}
      <div>
        <label htmlFor="name" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
          Full Name
        </label>
        <input
          id="name"
          type="text"
          className={`w-full px-4 py-3 rounded-xl bg-slate-950/60 border ${
            errors.name ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20' : 'border-indigo-950 focus:border-indigo-500 focus:ring-indigo-500/20'
          } text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-4 transition-all`}
          placeholder="John Doe"
          {...register('name', { required: 'Name is required' })}
        />
        {errors.name && (
          <span className="text-xs text-rose-400 mt-1 block">{errors.name.message}</span>
        )}
      </div>

      {/* Email Input */}
      <div>
        <label htmlFor="email" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          className={`w-full px-4 py-3 rounded-xl bg-slate-950/60 border ${
            errors.email ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20' : 'border-indigo-950 focus:border-indigo-500 focus:ring-indigo-500/20'
          } text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-4 transition-all`}
          placeholder="john@example.com"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
              message: 'Please enter a valid email address'
            }
          })}
        />
        {errors.email && (
          <span className="text-xs text-rose-400 mt-1 block">{errors.email.message}</span>
        )}
      </div>

      {/* Budget Range Input */}
      <div>
        <label htmlFor="budget" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
          Estimated Budget Range
        </label>
        <div className="relative">
          <select
            id="budget"
            className={`w-full px-4 py-3 rounded-xl bg-slate-950/60 border ${
              errors.budget ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20' : 'border-indigo-950 focus:border-indigo-500 focus:ring-indigo-500/20'
            } text-slate-100 focus:outline-none focus:ring-4 transition-all appearance-none cursor-pointer`}
            {...register('budget', { required: 'Please select a budget range' })}
          >
            <option value="" disabled className="bg-slate-950 text-slate-500">Select budget range...</option>
            <option value="< $500" className="bg-slate-950 text-slate-200">&lt; $500</option>
            <option value="$500–$1000" className="bg-slate-950 text-slate-200">$500 – $1000</option>
            <option value="$1000–$5000" className="bg-slate-950 text-slate-200">$1000 – $5000</option>
            <option value=">$5000" className="bg-slate-950 text-slate-200">&gt; $5000</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
            </svg>
          </div>
        </div>
        {errors.budget && (
          <span className="text-xs text-rose-400 mt-1 block">{errors.budget.message}</span>
        )}
      </div>

      {/* Message Input */}
      <div>
        <label htmlFor="message" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
          Message / Details
        </label>
        <textarea
          id="message"
          rows={3}
          className={`w-full px-4 py-3 rounded-xl bg-slate-950/60 border ${
            errors.message ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20' : 'border-indigo-950 focus:border-indigo-500 focus:ring-indigo-500/20'
          } text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-4 transition-all resize-none`}
          placeholder="Briefly describe your requirements (min 10 characters)..."
          {...register('message', {
            required: 'Message is required',
            minLength: {
              value: 10,
              message: 'Message must be at least 10 characters'
            }
          })}
        />
        {errors.message && (
          <span className="text-xs text-rose-400 mt-1 block">{errors.message.message}</span>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 mt-2 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-75 disabled:cursor-not-allowed btn-ripple cursor-pointer"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span>Submitting Inquiry...</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4 text-indigo-200" />
            <span>Submit Inquiry</span>
          </>
        )}
      </button>
    </form>
  );
};

export default LeadForm;
