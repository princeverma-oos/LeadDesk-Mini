import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Inbox, Search, Filter, RefreshCw, ChevronLeft, ChevronRight,
  TrendingUp, CircleDot, UserCheck, CheckCircle, ArrowRightLeft,
  LayoutDashboard, Menu, X, Star, Trash2, ArrowUpDown, ArrowUp, ArrowDown,
  Eye, Calendar, Phone, Mail, Building, ShieldAlert
} from 'lucide-react';
import { fetchLeads, updateLeadStatus, deleteLead, searchLeads } from '../services/api';
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

const AdminDashboard = ({ onNavigate, isDemo, user, onLogout }) => {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({ total: 0, new: 0, contacted: 0, qualified: 0, closed: 0 });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  
  // Filtering, Searching, Sorting & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(8);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Sorting state
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');

  // Selected Lead for Details Modal
  const [selectedLead, setSelectedLead] = useState(null);

  // Deletion Confirmation Dialog State
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

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
        limit,
        sortBy,
        order
      };

      if (debouncedSearch) {
        response = await searchLeads(debouncedSearch, params);
      } else {
        response = await fetchLeads(params);
      }

      if (response.success) {
        setLeads(response.leads || []);
        // Adapt default stats structure to avoid undefined errors if backend doesn't return qualified
        const backendStats = response.stats || {};
        setStats({
          total: backendStats.total || 0,
          new: backendStats.new || 0,
          contacted: backendStats.contacted || 0,
          qualified: backendStats.qualified || 0,
          closed: backendStats.closed || 0
        });
        setTotalPages(response.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      setToast({ message: 'Failed to fetch leads from backend server', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Reload leads when search/filters/pages/sorting changes
  useEffect(() => {
    loadLeads();
  }, [debouncedSearch, statusFilter, currentPage, sortBy, order]);

  const handleSort = (field) => {
    if (sortBy === field) {
      // Toggle order
      setOrder(prev => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortBy(field);
      setOrder('desc');
    }
    setCurrentPage(1);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await updateLeadStatus(id, newStatus);
      if (response.success) {
        // Update leads array locally for seamless user experience
        setLeads(prevLeads =>
          prevLeads.map(lead => (lead._id === id ? { ...lead, status: newStatus } : lead))
        );
        
        // If updating the selected lead, sync details modal
        if (selectedLead && selectedLead._id === id) {
          setSelectedLead(prev => ({ ...prev, status: newStatus }));
        }

        // Reload data to sync all counters
        loadLeads();
        setToast({ message: 'Lead status updated successfully', type: 'success' });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setToast({ message: 'Failed to update lead status', type: 'error' });
    }
  };

  const handleDeleteClick = (id, e) => {
    e.stopPropagation(); // Avoid triggering row details click
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      const response = await deleteLead(deleteConfirmId);
      if (response.success) {
        setToast({ message: 'Lead deleted successfully', type: 'success' });
        // Close modal if deleted lead was open
        if (selectedLead && selectedLead._id === deleteConfirmId) {
          setSelectedLead(null);
        }
        setDeleteConfirmId(null);
        loadLeads();
      }
    } catch (error) {
      console.error('Error deleting lead:', error);
      setToast({ message: 'Failed to delete lead', type: 'error' });
    }
  };

  const formatDate = (dateStr) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

  const renderSortIcon = (field) => {
    if (sortBy !== field) return <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 opacity-40 group-hover:opacity-100 transition-opacity" />;
    return order === 'desc' 
      ? <ArrowDown className="w-3.5 h-3.5 text-indigo-400" />
      : <ArrowUp className="w-3.5 h-3.5 text-indigo-400" />;
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
              onClick={() => setToast({ message: 'Starred filter is a demonstration placeholder', type: 'success' })}
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
          
          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={loadLeads}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-900 border border-indigo-950/40 text-slate-300 hover:text-white transition-all cursor-pointer hover:bg-slate-800 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Dashboard Statistics Cards Grid - 5 cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { label: 'Total Leads', val: stats.total, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20', icon: ArrowRightLeft },
            { label: 'New Leads', val: stats.new, color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20', icon: CircleDot },
            { label: 'Contacted', val: stats.contacted, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: UserCheck },
            { label: 'Qualified', val: stats.qualified, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', icon: TrendingUp },
            { label: 'Closed', val: stats.closed, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle }
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`glass-card p-4 rounded-2xl border flex flex-col justify-between ${card.bg}`}
            >
              <div className="flex items-center justify-between text-slate-500 mb-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider">{card.label}</span>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <div>
                <span className="text-xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
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
                placeholder="Search name, company, message..."
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
                <option value="Qualified" className="bg-slate-950">Qualified</option>
                <option value="Closed" className="bg-slate-950">Closed</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            {loading ? (
              // Loading skeletons
              <div className="p-6 space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex gap-4 items-center animate-pulse">
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
                  <tr className="border-b border-indigo-950/20 text-slate-400 font-medium bg-slate-950/20 select-none">
                    <th onClick={() => handleSort('name')} className="p-4 pl-6 cursor-pointer hover:text-white transition-colors group">
                      <div className="flex items-center gap-1.5">
                        Name {renderSortIcon('name')}
                      </div>
                    </th>
                    <th className="p-4">Contact Info</th>
                    <th onClick={() => handleSort('company')} className="p-4 cursor-pointer hover:text-white transition-colors group">
                      <div className="flex items-center gap-1.5">
                        Company {renderSortIcon('company')}
                      </div>
                    </th>
                    <th className="p-4">Message</th>
                    <th onClick={() => handleSort('createdAt')} className="p-4 cursor-pointer hover:text-white transition-colors group">
                      <div className="flex items-center gap-1.5">
                        Submitted At {renderSortIcon('createdAt')}
                      </div>
                    </th>
                    <th onClick={() => handleSort('status')} className="p-4 cursor-pointer hover:text-white transition-colors group">
                      <div className="flex items-center gap-1.5">
                        Status {renderSortIcon('status')}
                      </div>
                    </th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-950/10">
                  {leads.map((lead) => (
                    <tr 
                      key={lead._id}
                      onClick={() => setSelectedLead(lead)}
                      className="hover:bg-indigo-950/5 transition-colors group text-slate-300 cursor-pointer"
                    >
                      <td className="p-4 pl-6 font-semibold text-slate-200">{lead.name}</td>
                      <td className="p-4 font-mono text-slate-400">
                        <div className="flex flex-col gap-0.5">
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-500" /> {lead.email}</span>
                          <span className="flex items-center gap-1 text-[11px] text-slate-500"><Phone className="w-3 h-3 text-slate-600" /> {lead.phone}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 text-slate-300 bg-slate-900 border border-indigo-950 rounded-lg text-xs font-semibold">
                          {lead.company}
                        </span>
                      </td>
                      <td className="p-4 max-w-xs truncate text-slate-400" title={lead.message}>
                        {lead.message}
                      </td>
                      <td className="p-4 text-slate-500 whitespace-nowrap">
                        {formatDate(lead.createdAt)}
                      </td>
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors outline-none cursor-pointer ${
                            lead.status === 'New'
                              ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                              : lead.status === 'Contacted'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : lead.status === 'Qualified'
                              ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}
                        >
                          <option value="New" className="bg-slate-950 text-slate-200">New</option>
                          <option value="Contacted" className="bg-slate-950 text-slate-200">Contacted</option>
                          <option value="Qualified" className="bg-slate-950 text-slate-200">Qualified</option>
                          <option value="Closed" className="bg-slate-950 text-slate-200">Closed</option>
                        </select>
                      </td>
                      <td className="p-4 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteClick(lead._id, e)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                            title="Delete Lead"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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

      {/* LEAD DETAILS MODAL */}
      <AnimatePresence>
        {selectedLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl glass-card rounded-3xl border border-indigo-500/30 shadow-2xl overflow-hidden"
            >
              {/* Decorative top header color bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600"></div>

              {/* Close Button */}
              <button 
                onClick={() => setSelectedLead(null)}
                className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 border border-indigo-950/20 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="p-6 md:p-8 space-y-6">
                {/* Header Title Info */}
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-100">{selectedLead.name}</h2>
                  <div className="flex flex-wrap gap-2 items-center mt-2.5">
                    <span className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {formatDate(selectedLead.createdAt)}
                    </span>
                    <span className="text-slate-700">•</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Status:</span>
                      <select
                        value={selectedLead.status}
                        onChange={(e) => handleStatusChange(selectedLead._id, e.target.value)}
                        className={`px-2.5 py-0.5 rounded-md text-xs font-bold border transition-colors outline-none cursor-pointer ${
                          selectedLead.status === 'New'
                            ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                            : selectedLead.status === 'Contacted'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : selectedLead.status === 'Qualified'
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}
                      >
                        <option value="New" className="bg-slate-950 text-slate-200">New</option>
                        <option value="Contacted" className="bg-slate-950 text-slate-200">Contacted</option>
                        <option value="Qualified" className="bg-slate-950 text-slate-200">Qualified</option>
                        <option value="Closed" className="bg-slate-950 text-slate-200">Closed</option>
                      </select>
                    </div>
                  </div>
                </div>

                <hr className="border-indigo-950/20" />

                {/* Main grid fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column Fields */}
                  <div className="space-y-4">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <Building className="w-3 h-3 text-indigo-400" />
                        Company
                      </span>
                      <div className="px-4 py-3 rounded-xl bg-slate-950/40 border border-indigo-950/30 text-sm font-semibold text-slate-200">
                        {selectedLead.company}
                      </div>
                    </div>

                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-indigo-400" />
                        Phone Number
                      </span>
                      <div className="px-4 py-3 rounded-xl bg-slate-950/40 border border-indigo-950/30 text-sm font-mono text-slate-200">
                        {selectedLead.phone}
                      </div>
                    </div>
                  </div>

                  {/* Right Column Fields */}
                  <div className="space-y-4">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-indigo-400" />
                        Email Address
                      </span>
                      <div className="px-4 py-3 rounded-xl bg-slate-950/40 border border-indigo-950/30 text-sm font-mono text-slate-200 select-all">
                        {selectedLead.email}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Message detail (full width) */}
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Proposal Message / Details
                  </span>
                  <div className="px-4 py-4 rounded-2xl bg-slate-950/40 border border-indigo-950/30 text-sm leading-relaxed text-slate-300 max-h-48 overflow-y-auto whitespace-pre-wrap">
                    {selectedLead.message}
                  </div>
                </div>

                {/* Bottom dialog actions */}
                <div className="flex justify-between items-center pt-4 border-t border-indigo-950/20">
                  <button
                    onClick={(e) => {
                      setSelectedLead(null);
                      handleDeleteClick(selectedLead._id, e);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl text-rose-400 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 hover:border-rose-500/25 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Lead
                  </button>
                  <button
                    onClick={() => setSelectedLead(null)}
                    className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-slate-900 border border-indigo-950 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION DIALOG */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md glass-card rounded-2xl border border-rose-500/30 p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-500/10 rounded-xl border border-rose-500/20 text-rose-400">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">Delete Inbound Lead</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Please confirm this permanent action.</p>
                </div>
              </div>
              
              <p className="text-xs text-slate-300 leading-relaxed font-light">
                Are you sure you want to delete this lead? All associated customer contact details and proposal notes will be permanently removed from MongoDB. This action cannot be undone.
              </p>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 border border-indigo-950 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-500/10 transition-colors cursor-pointer"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
