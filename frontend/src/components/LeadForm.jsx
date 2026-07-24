import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Send, Loader2, Building, Phone, Mail, User, MessageSquare } from 'lucide-react';
import { submitLead } from '../services/api';

const LeadForm = ({ onSuccess, onError, isDemo }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmitted, setLastSubmitted] = useState({ email: '', message: '', time: 0 });
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      company: '',
      phone: '',
      message: ''
    }
  });

  const onSubmit = async (data) => {
    // Client-side Duplicate Submission Check (1-minute window)
    const now = Date.now();
    if (
      data.email.toLowerCase() === lastSubmitted.email.toLowerCase() &&
      data.message === lastSubmitted.message &&
      now - lastSubmitted.time < 60000
    ) {
      onError('Duplicate submission detected. Please wait a minute before submitting the same message.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await submitLead(data);
      if (response.success) {
        onSuccess(response.message || 'Lead submitted successfully');
        setLastSubmitted({ email: data.email, message: data.message, time: now });
        reset();
      } else {
        onError(response.message || 'Failed to submit lead');
      }
    } catch (error) {
      console.error('Submission error:', error);
      const serverErrors = error.response?.data?.errors;
      if (serverErrors && Array.isArray(serverErrors)) {
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
        <label htmlFor="name" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-indigo-400" />
          Full Name
        </label>
        <input
          id="name"
          type="text"
          className={`w-full px-4 py-3 rounded-xl bg-slate-950/60 border ${
            errors.name ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20' : 'border-indigo-950 focus:border-indigo-500 focus:ring-indigo-500/20'
          } text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-4 transition-all text-sm`}
          placeholder="John Doe"
          {...register('name', { required: 'Name is required' })}
        />
        {errors.name && (
          <span className="text-xs text-rose-400 mt-1 block">{errors.name.message}</span>
        )}
      </div>

      {/* Email Input */}
      <div>
        <label htmlFor="email" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5 text-indigo-400" />
          Email Address
        </label>
        <input
          id="email"
          type="email"
          className={`w-full px-4 py-3 rounded-xl bg-slate-950/60 border ${
            errors.email ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20' : 'border-indigo-950 focus:border-indigo-500 focus:ring-indigo-500/20'
          } text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-4 transition-all text-sm`}
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

      {/* Company Input */}
      <div>
        <label htmlFor="company" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <Building className="w-3.5 h-3.5 text-indigo-400" />
          Company Name
        </label>
        <input
          id="company"
          type="text"
          className={`w-full px-4 py-3 rounded-xl bg-slate-950/60 border ${
            errors.company ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20' : 'border-indigo-950 focus:border-indigo-500 focus:ring-indigo-500/20'
          } text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-4 transition-all text-sm`}
          placeholder="Acme Corp"
          {...register('company', { required: 'Company is required' })}
        />
        {errors.company && (
          <span className="text-xs text-rose-400 mt-1 block">{errors.company.message}</span>
        )}
      </div>

      {/* Phone Input */}
      <div>
        <label htmlFor="phone" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5 text-indigo-400" />
          Phone Number
        </label>
        <input
          id="phone"
          type="tel"
          className={`w-full px-4 py-3 rounded-xl bg-slate-950/60 border ${
            errors.phone ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20' : 'border-indigo-950 focus:border-indigo-500 focus:ring-indigo-500/20'
          } text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-4 transition-all text-sm`}
          placeholder="+1 (555) 000-0000"
          {...register('phone', { required: 'Phone number is required' })}
        />
        {errors.phone && (
          <span className="text-xs text-rose-400 mt-1 block">{errors.phone.message}</span>
        )}
      </div>

      {/* Message Input */}
      <div>
        <label htmlFor="message" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
          Message / Project Details
        </label>
        <textarea
          id="message"
          rows={3}
          className={`w-full px-4 py-3 rounded-xl bg-slate-950/60 border ${
            errors.message ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20' : 'border-indigo-950 focus:border-indigo-500 focus:ring-indigo-500/20'
          } text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-4 transition-all resize-none text-sm`}
          placeholder="Describe your requirements (minimum 10 characters)..."
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
