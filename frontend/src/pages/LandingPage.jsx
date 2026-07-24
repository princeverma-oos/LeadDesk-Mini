import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Shield, Users, Zap, CheckCircle2, ArrowRight } from 'lucide-react';
import LeadForm from '../components/LeadForm';
import Toast from '../components/Toast';

const LandingPage = ({ isDemo }) => {
  const [toast, setToast] = useState(null); // { message, type }

  const handleSuccess = (msg) => {
    setToast({ message: msg, type: 'success' });
  };

  const handleError = (msg) => {
    setToast({ message: msg, type: 'error' });
  };

  const scrollToContact = () => {
    const contactSection = document.getElementById('contact-section');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pb-24 bg-gradient-mesh"
    >
      {/* Hero Section */}
      <section className="relative pt-16 pb-14 md:pt-28 md:pb-20 overflow-hidden max-w-7xl mx-auto px-6">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-6 uppercase tracking-wider"
          >
            <Zap className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400/20" />
            Introducing LeadDesk Mini
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold tracking-tight text-slate-100 mb-6 leading-tight max-w-4xl mx-auto"
          >
            Capture & Route Leads with <span className="gradient-text">Absolute Simplicity</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light"
          >
            Our sleek dashboard and automated form validations make lead handling a breeze. Power your team, optimize workflow, and boost conversions.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={scrollToContact}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium shadow-lg hover:shadow-indigo-500/20 transition-all cursor-pointer btn-ripple"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#features"
              className="w-full sm:w-auto px-7 py-3.5 bg-slate-900/60 hover:bg-slate-900 border border-indigo-950/40 text-slate-300 hover:text-white rounded-xl font-medium transition-all text-center"
            >
              Learn More
            </a>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-100 mb-3">
            Engineered for Fast Growing Teams
          </h2>
          <p className="text-slate-400 text-sm md:text-base max-w-lg mx-auto font-light">
            A premium, custom-tailored workspace that handles lead capture, tracking, and statuses instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Zap,
              title: 'Instant Capture',
              desc: 'Submit, validate, and persist leads to MongoDB with secure backend verification.'
            },
            {
              icon: BarChart3,
              title: 'CRM Stats',
              desc: 'Live cards track leads, including New, Contacted, and Closed stats with animated counters.'
            },
            {
              icon: Users,
              title: 'Dynamic Routing',
              desc: 'Quickly modify a lead\'s lifecycle using instant status updates saved directly to the database.'
            },
            {
              icon: Shield,
              title: 'Secured Data',
              desc: 'Sanitized schemas protect against input attacks and maintain structured Mongo collections.'
            }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="glass-card glass-card-hover p-6 rounded-2xl flex flex-col items-start"
            >
              <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400 mb-4">
                <item.icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-100 mb-2">{item.title}</h3>
              <p className="text-xs md:text-sm text-slate-400 leading-relaxed font-light">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 max-w-7xl mx-auto px-6 border-t border-indigo-950/20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold uppercase tracking-wider">
              About LeadDesk Mini
            </div>
            <h2 className="text-2xl md:text-4xl font-bold text-slate-100 tracking-tight">
              A Smooth, Modern Admin Pipeline
            </h2>
            <p className="text-slate-400 leading-relaxed text-sm md:text-base font-light">
              LeadDesk Mini is a full-featured CRM tool designed for seamless workflows. Check active statuses, sort by categories, or paginate through database collections via our premium and clean user interface.
            </p>
            <ul className="space-y-3">
              {[
                'Full responsive design built for mobile, tablet, and desktop viewports',
                'Client & server input validation prevents malformed database entries',
                'Status dropdown updates save immediately and securely to the backend DB'
              ].map((point, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs md:text-sm text-slate-300 font-light">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-5 relative flex justify-center items-center">
            {/* Visual SaaS Mock */}
            <div className="w-full aspect-square rounded-3xl bg-gradient-to-tr from-indigo-600/10 to-purple-600/5 border border-indigo-500/10 p-8 flex items-center justify-center relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-mesh opacity-20"></div>
              <div className="w-11/12 aspect-[4/3] glass-card rounded-2xl border border-indigo-500/20 p-5 flex flex-col justify-between shadow-2xl relative z-10">
                <div className="flex items-center gap-1 border-b border-indigo-950/20 pb-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/60"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60"></div>
                  <span className="text-[10px] text-slate-500 ml-1.5 font-mono">leaddesk.mini/leads</span>
                </div>
                <div className="space-y-2 flex-1 flex flex-col justify-center">
                  <div className="h-3.5 bg-indigo-500/10 border border-indigo-500/15 rounded-md w-3/4"></div>
                  <div className="h-3.5 bg-indigo-500/10 border border-indigo-500/15 rounded-md w-1/2"></div>
                  <div className="h-3.5 bg-indigo-500/10 border border-indigo-500/15 rounded-md w-5/6"></div>
                </div>
                <div className="flex justify-between items-center pt-2.5 border-t border-indigo-950/20">
                  <div className="h-5 px-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-md text-[9px] font-semibold flex items-center justify-center">
                    New Lead
                  </div>
                  <div className="h-3.5 w-16 bg-indigo-500/15 rounded-md"></div>
                </div>
              </div>
              <div className="absolute bottom-2 right-2 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl z-0"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact-section" className="py-16 max-w-4xl mx-auto px-6 text-center">
        <div className="mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-100 mb-3">
            Inquire About Your Project
          </h2>
          <p className="text-slate-400 text-sm md:text-base font-light">
            Fill out the glassmorphic lead capture form below and our specialists will reach out shortly.
          </p>
        </div>

        <div className="glass-card p-6 md:p-8 rounded-3xl border border-indigo-500/25 shadow-2xl text-left max-w-xl mx-auto">
          <LeadForm onSuccess={handleSuccess} onError={handleError} isDemo={isDemo} />
        </div>
      </section>

      {/* Toast Alert System */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default LandingPage;
