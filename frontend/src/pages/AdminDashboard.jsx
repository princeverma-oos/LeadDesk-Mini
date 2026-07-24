import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Inbox, Search, Filter, RefreshCw, ChevronLeft, ChevronRight,
  TrendingUp, CircleDot, UserCheck, CheckCircle, ArrowRightLeft,
  LayoutDashboard, Menu, X, Star
} from 'lucide-react';
import { fetchLeads, updateLeadStatus, searchLeads } from '../services/api';
import Toast from '../components/Toast';

// Smooth animated counter component
const AnimatedCounter = ({ value, duration = 800 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * value));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [value, duration]);

  return <span>{count}</span>;
};

const AdminDashboard = () => {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({ total: 0, new: 0, contacted: 0, closed: 0 });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  
  // Filtering & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(8);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset page on search
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadLeads = async () => {
    setLoading(true);
    try {
      let response;
      const params = {
        status: statusFilter,
        page: currentPage,
        limit
      };

      if (debouncedSearch) {
        response = await searchLeads(debouncedSearch, params);
      } else {
        response = await fetchLeads(params);
      }

      if (response.success) {
        setLeads(response.leads || []);
        setStats(response.stats || { total: 0, new: 0, contacted: 0, closed: 0 });
        setTotalPages(response.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      setToast({ message: 'Failed to fetch leads from backend server', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Reload leads when search/filters/pages change
  useEffect(() => {
    loadLeads();
  }, [debouncedSearch, statusFilter, currentPage]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await updateLeadStatus(id, newStatus);
      if (response.success) {
        // Update leads array locally for seamless user experience
        setLeads(prevLeads =>
          prevLeads.map(lead => (lead._id === id ? { ...lead, status: newStatus } : lead))
        );
        
        // Update stats locally
        setStats(prevStats => {
          const oldLead = leads.find(l => l._id === id);
          if (!oldLead || oldLead.status === newStatus) return prevStats;
          
          const nextStats = { ...prevStats };
          const keyMap = { 'New': 'new', 'Contacted': 'contacted', 'Closed': 'closed' };
          nextStats[keyMap[oldLead.status]] = Math.max(0, nextStats[keyMap[oldLead.status]] - 1);
          nextStats[keyMap[newStatus]] = (nextStats[keyMap[newStatus]] || 0) + 1;
          return nextStats;
        });

        setToast({ message: 'Lead status updated successfully', type: 'success' });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setToast({ message: 'Failed to update lead status', type: 'error' });
    }
  };

  const formatDate = (dateStr) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex min-h-[calc(100vh-64px)] relative"
    >
      {/* Sidebar Component */}
      <aside className={`fixed lg:sticky top-16 left-0 h-[calc(100vh-64px)] z-30 transition-all duration-300 border-r border-indigo-950/20 bg-slate-950/60 backdrop-blur-xl ${
        sidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full lg:w-16 lg:translate-x-0 overflow-hidden'
      }`}>
        <div className="p-4 space-y-6">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2 text-indigo-400 font-semibold ${!sidebarOpen && 'lg:hidden'}`}>
              <LayoutDashboard className="w-5 h-5" />
              <span>Workspace</span>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)} 
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-1">
            <button className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-sm font-medium text-left">
              <TrendingUp className="w-4 h-4 shrink-0" />
              <span className={!sidebarOpen ? 'lg:hidden' : ''}>Active leads</span>
            </button>
            <button 
              onClick={() => setToast({ message: 'Settings panel is a demonstration placeholder', type: 'success' })}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/5 text-sm font-medium text-left transition-all"
            >
              <Star className="w-4 h-4 shrink-0" />
              <span className={!sidebarOpen ? 'lg:hidden' : ''}>Starred</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 min-w-0 p-4 md:p-6 lg:p-8 space-y-6">
        {/* Toggle button for Sidebar & Title block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg bg-slate-900 border border-indigo-950/40 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-100">Leads Hub</h1>
              <p className="text-xs text-slate-500">Manage, sort, and process inbound client proposals.</p>
            </div>
          </div>
          
          <button 
            onClick={loadLeads}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 border border-indigo-950/40 text-slate-300 hover:text-white transition-all cursor-pointer hover:bg-slate-800 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Leads
          </button>
        </div>

        {/* Dashboard Statistics Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[
            { label: 'Total Leads', val: stats.total, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20', icon: ArrowRightLeft },
            { label: 'New Leads', val: stats.new, color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20', icon: CircleDot },
            { label: 'Contacted', val: stats.contacted, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: UserCheck },
            { label: 'Closed', val: stats.closed, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle }
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`glass-card p-4 md:p-6 rounded-2xl border flex flex-col justify-between ${card.bg}`}
            >
              <div className="flex items-center justify-between text-slate-500 mb-4">
                <span className="text-xs md:text-sm font-medium">{card.label}</span>
                <card.icon className={`w-4 h-4 md:w-5 h-5 ${card.color}`} />
              </div>
              <div>
                <span className="text-2xl md:text-4xl font-extrabold text-slate-100 tracking-tight">
                  {loading ? '0' : <AnimatedCounter value={card.val} />}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Leads Table Management Panel */}
        <div className="glass-card rounded-3xl border border-indigo-950/20 overflow-hidden shadow-2xl">
          {/* Top filter and Search bars */}
          <div className="p-4 md:p-6 border-b border-indigo-950/20 bg-slate-950/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search name, message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-slate-950/60 border border-indigo-950 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/15 text-slate-100 placeholder-slate-600 transition-all"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filter:</span>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="w-full sm:w-auto px-4 py-2 text-sm rounded-xl bg-slate-950/60 border border-indigo-950 text-slate-200 focus:border-indigo-500 focus:outline-none cursor-pointer"
              >
                <option value="All" className="bg-slate-950">All Statuses</option>
                <option value="New" className="bg-slate-950">New</option>
                <option value="Contacted" className="bg-slate-950">Contacted</option>
                <option value="Closed" className="bg-slate-950">Closed</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            {loading ? (
              // Loading skeletons
              <div className="p-6 space-y-4 animate-pulse">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex gap-4 items-center">
                    <div className="h-6 bg-indigo-950/40 rounded-md w-1/4"></div>
                    <div className="h-6 bg-indigo-950/40 rounded-md w-1/4"></div>
                    <div className="h-6 bg-indigo-950/40 rounded-md w-1/6"></div>
                    <div className="h-6 bg-indigo-950/40 rounded-md w-1/4"></div>
                    <div className="h-6 bg-indigo-950/40 rounded-md w-1/12"></div>
                  </div>
                ))}
              </div>
            ) : leads.length === 0 ? (
              // Empty State UI
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="p-3.5 bg-indigo-500/5 rounded-full border border-indigo-500/10 mb-4">
                  <Inbox className="w-8 h-8 text-indigo-400/80" />
                </div>
                <h3 className="text-base font-bold text-slate-300">No leads available</h3>
                <p className="text-xs text-slate-500 max-w-xs mt-1 leading-relaxed">
                  We couldn't find any inquiries matching your filters or search term.
                </p>
              </div>
            ) : (
              // Real Table Data
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-indigo-950/20 text-slate-400 font-medium bg-slate-950/20">
                    <th className="p-4 pl-6">Name</th>
                    <th className="p-4">Contact Info</th>
                    <th className="p-4">Budget</th>
                    <th className="p-4">Message</th>
                    <th className="p-4">Submitted At</th>
                    <th className="p-4 pr-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-950/10">
                  {leads.map((lead) => (
                    <tr 
                      key={lead._id}
                      className="hover:bg-indigo-950/5 transition-colors group text-slate-300"
                    >
                      <td className="p-4 pl-6 font-semibold text-slate-200">{lead.name}</td>
                      <td className="p-4 font-mono text-slate-400">{lead.email}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 text-slate-300 bg-slate-900 border border-indigo-950 rounded-lg text-xs font-semibold">
                          {lead.budget}
                        </span>
                      </td>
                      <td className="p-4 max-w-xs truncate" title={lead.message}>
                        {lead.message}
                      </td>
                      <td className="p-4 text-slate-500 whitespace-nowrap">
                        {formatDate(lead.createdAt)}
                      </td>
                      <td className="p-4 pr-6">
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors outline-none cursor-pointer ${
                            lead.status === 'New'
                              ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                              : lead.status === 'Contacted'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}
                        >
                          <option value="New" className="bg-slate-950 text-slate-200">New</option>
                          <option value="Contacted" className="bg-slate-950 text-slate-200">Contacted</option>
                          <option value="Closed" className="bg-slate-950 text-slate-200">Closed</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="p-4 md:p-6 border-t border-indigo-950/20 bg-slate-950/30 flex items-center justify-between gap-4">
              <span className="text-xs text-slate-500">
                Page <span className="text-slate-300 font-semibold">{currentPage}</span> of <span className="text-slate-300 font-semibold">{totalPages}</span>
              </span>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1 || loading}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="p-2 rounded-xl bg-slate-950 border border-indigo-950 text-slate-400 hover:text-white disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={currentPage === totalPages || loading}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="p-2 rounded-xl bg-slate-950 border border-indigo-950 text-slate-400 hover:text-white disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast alert system */}
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

export default AdminDashboard;
