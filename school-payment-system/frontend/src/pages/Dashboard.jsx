import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axiosInstance from '../config/axios';
import { ChevronDownIcon, ChevronUpIcon, FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_records: 0,
    records_per_page: 10
  });
  
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    school_id: searchParams.get('school_id') || '',
    start_date: searchParams.get('start_date') || '',
    end_date: searchParams.get('end_date') || '',
    sort_by: searchParams.get('sort_by') || 'payment_time',
    sort_order: searchParams.get('sort_order') || 'desc'
  });

  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', x: 0, y: 0 });

  // Fetch transactions
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
params.append('page', searchParams.get('page') || '1');
params.append('limit', '10');

let apiUrl;

// If school_id is provided, use school-specific endpoint like SchoolTransactions
if (filters.school_id && filters.school_id.trim() !== '') {
  // Add other filters except school_id
  Object.entries(filters).forEach(([key, value]) => {
    if (key !== 'school_id' && value && value.trim() !== '') {
      params.append(key, value.trim());
    }
  });
  apiUrl = `/orders/transactions/school/${filters.school_id.trim()}?${params}`;
} else {
  // Use general endpoint
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value.trim() !== '') {
      params.append(key, value.trim());
    }
  });
  apiUrl = `/orders/transactions?${params}`;
}

const response = await axiosInstance.get(apiUrl);
      setTransactions(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      console.error('Error details:', error.response?.data);
      
      // Set empty array on error, just like school transactions page
      setTransactions([]);
      setPagination({
        current_page: 1,
        total_pages: 1,
        total_records: 0,
        records_per_page: 10
      });
    } finally {
      setLoading(false);
    }
  }, [searchParams, filters]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Update URL when filters change
  const updateFilters = (newFilters) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    setSearchParams(params);
    setFilters(newFilters);
  };

  // Handle pagination
  const changePage = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    setSearchParams(params);
  };

  // Handle sort
  const handleSort = (column) => {
    const newOrder = filters.sort_by === column && filters.sort_order === 'desc' ? 'asc' : 'desc';
    updateFilters({
      ...filters,
      sort_by: column,
      sort_order: newOrder
    });
  };

  // Copy to clipboard function with toast notification
  const copyToClipboard = (text, fieldName, event) => {
    navigator.clipboard.writeText(text).then(() => {
      const rect = event.target.getBoundingClientRect();
      setToast({ 
        show: true, 
        message: `${fieldName} copied!`, 
        x: rect.left + rect.width / 2, 
        y: rect.top - 10 
      });
      setTimeout(() => setToast({ show: false, message: '', x: 0, y: 0 }), 1000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
      const rect = event.target.getBoundingClientRect();
      setToast({ 
        show: true, 
        message: 'Copy failed!', 
        x: rect.left + rect.width / 2, 
        y: rect.top - 10 
      });
      setTimeout(() => setToast({ show: false, message: '', x: 0, y: 0 }), 1000);
    });
  };

  // Status badge colors
  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      {/* Toast Notification - Always Visible Everywhere */}
      {toast.show && (
        <div 
          className="fixed inset-0 flex items-center justify-center pointer-events-none z-[99999]"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <div className="bg-black text-white px-8 py-4 rounded-2xl shadow-2xl border-4 border-white backdrop-blur-lg pointer-events-auto">
            <div className="flex items-center gap-3">
              <div className="relative">
                <span className="text-2xl animate-bounce">✅</span>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
              </div>
              <div className="flex flex-col">
                <span className="font-black text-2xl tracking-wide text-white">{toast.message}</span>
                <span className="text-lg text-white font-bold">Ready to paste anywhere!</span>
              </div>
              <div className="ml-2">
                <span className="text-2xl animate-spin text-white">✨</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
            📊 Transactions Dashboard
          </h1>
          <p className="text-xl text-blue-200 font-medium tracking-wide">
            ✨ Manage and view all payment transactions with ease
          </p>
        </div>

        {/* Filters Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl mb-8">
          <div className="p-6 border-b border-white/20">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">🔍 Filter Transactions</h2>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 text-white font-bold rounded-2xl transition-all duration-500 transform hover:scale-110 hover:rotate-1 shadow-2xl hover:shadow-purple-500/50 ${
                  showFilters ? 'ring-4 ring-yellow-400/50 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-500' : ''
                }`}
                style={{
                  boxShadow: showFilters 
                    ? '0 20px 40px rgba(168, 85, 247, 0.4), 0 0 20px rgba(251, 191, 36, 0.3)' 
                    : '0 10px 30px rgba(139, 92, 246, 0.3)',
                  background: showFilters 
                    ? 'linear-gradient(135deg, #ec4899, #8b5cf6, #3b82f6)' 
                    : 'linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <div className="relative flex items-center gap-3">
                  <div className={`p-2 rounded-full bg-white/20 backdrop-blur-sm transition-all duration-300 ${showFilters ? 'rotate-180 bg-yellow-400/30' : ''}`}>
                    <FunnelIcon className="h-5 w-5" style={{width: '20px', height: '20px', minWidth: '20px', minHeight: '20px', maxWidth: '20px', maxHeight: '20px'}} />
                  </div>
                  <span className="text-lg font-black tracking-wide">
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                  </span>
                  <div className={`p-1 rounded-full bg-white/20 backdrop-blur-sm transition-all duration-500 ${showFilters ? 'rotate-180 bg-yellow-400/30' : ''}`}>
                    <ChevronDownIcon className={`h-4 w-4 transform transition-transform duration-500 ${showFilters ? 'rotate-180' : ''}`} style={{width: '16px', height: '16px', minWidth: '16px', minHeight: '16px', maxWidth: '16px', maxHeight: '16px'}} />
                  </div>
                </div>
                {showFilters && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                )}
                {showFilters && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"></div>
                )}
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="p-8 pt-40 bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-pink-900/20 backdrop-blur-sm">
              <div style={{display: 'flex', justifyContent: 'center'}}>
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 pt-20 border border-white/10 shadow-2xl" style={{marginTop: '60px'}}>
                  <div style={{display: 'grid', gridTemplateColumns: '200px 24px 320px', alignItems: 'center', marginBottom: '40px'}}>
                    <label className="text-white/90 text-sm font-bold flex items-center justify-end gap-2" style={{textAlign: 'right'}} htmlFor="status">
                      <span className="text-blue-400">📊</span> Status
                    </label>
                    <div></div>
                    <div className="relative group">
                      <select
                        id="status"
                        value={filters.status}
                        onChange={(e) => updateFilters({ ...filters, status: e.target.value })}
                        className="px-6 py-4 bg-gradient-to-r from-white/10 to-white/5 border-2 border-white/20 rounded-xl text-white font-medium focus:outline-none focus:ring-4 focus:ring-blue-400/50 focus:border-blue-400 transition-all duration-300 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20"
                        style={{width: '320px', background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))'}}
                      >
                        <option value="" className="bg-gray-800 text-white">🔍 All Status</option>
                        <option value="success" className="bg-gray-800 text-white">✅ Success</option>
                        <option value="pending" className="bg-gray-800 text-white">⏳ Pending</option>
                        <option value="failed" className="bg-gray-800 text-white">❌ Failed</option>
                      </select>
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/10 group-hover:via-purple-500/10 group-hover:to-pink-500/10 transition-all duration-300 pointer-events-none"></div>
                    </div>
                  </div>
                  
                  <div style={{display: 'grid', gridTemplateColumns: '200px 24px 320px', alignItems: 'center', marginBottom: '40px'}}>
                    <label className="text-white/90 text-sm font-bold flex items-center justify-end gap-2" style={{textAlign: 'right'}} htmlFor="school_id">
                      <span className="text-green-400">🏫</span> School ID
                    </label>
                    <div></div>
                    <div className="relative group">
                      <input
                        id="school_id"
                        type="text"
                        value={filters.school_id}
                        onChange={(e) => updateFilters({ ...filters, school_id: e.target.value })}
                        placeholder="🔍 Enter school ID..."
                        className="px-6 py-4 bg-gradient-to-r from-white/10 to-white/5 border-2 border-white/20 rounded-xl text-white font-medium placeholder-white/50 focus:outline-none focus:ring-4 focus:ring-green-400/50 focus:border-green-400 transition-all duration-300 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20"
                        style={{width: '320px', background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))'}}
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-500/0 via-blue-500/0 to-purple-500/0 group-hover:from-green-500/10 group-hover:via-blue-500/10 group-hover:to-purple-500/10 transition-all duration-300 pointer-events-none"></div>
                    </div>
                  </div>

                  <div style={{display: 'grid', gridTemplateColumns: '200px 24px 320px', alignItems: 'center', marginBottom: '40px'}}>
                    <label className="text-white/90 text-sm font-bold flex items-center justify-end gap-2" style={{textAlign: 'right'}} htmlFor="start_date">
                      <span className="text-yellow-400">📅</span> Start Date
                    </label>
                    <div></div>
                    <div className="relative group">
                      <input
                        id="start_date"
                        type="date"
                        value={filters.start_date}
                        onChange={(e) => updateFilters({ ...filters, start_date: e.target.value })}
                        className="px-6 py-4 bg-gradient-to-r from-white/10 to-white/5 border-2 border-white/20 rounded-xl text-white font-medium focus:outline-none focus:ring-4 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all duration-300 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20"
                        style={{width: '320px', background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))'}}
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-yellow-500/0 via-orange-500/0 to-red-500/0 group-hover:from-yellow-500/10 group-hover:via-orange-500/10 group-hover:to-red-500/10 transition-all duration-300 pointer-events-none"></div>
                    </div>
                  </div>

                  <div style={{display: 'grid', gridTemplateColumns: '200px 24px 320px 24px 200px', alignItems: 'center', marginBottom: '40px'}}>
                    <label className="text-white/90 text-sm font-bold flex items-center justify-end gap-2" style={{textAlign: 'right'}} htmlFor="end_date">
                      <span className="text-red-400">📅</span> End Date
                    </label>
                    <div></div>
                    <div className="relative group">
                      <input
                        id="end_date"
                        type="date"
                        value={filters.end_date}
                        onChange={(e) => updateFilters({ ...filters, end_date: e.target.value })}
                        className="px-6 py-4 bg-gradient-to-r from-white/10 to-white/5 border-2 border-white/20 rounded-xl text-white font-medium focus:outline-none focus:ring-4 focus:ring-red-400/50 focus:border-red-400 transition-all duration-300 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20"
                        style={{width: '320px', background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))'}}
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/0 via-pink-500/0 to-purple-500/0 group-hover:from-red-500/10 group-hover:via-pink-500/10 group-hover:to-purple-500/10 transition-all duration-300 pointer-events-none"></div>
                    </div>
                    <div></div>
                    <button 
                      onClick={() => updateFilters({
                        status: '',
                        school_id: '',
                        start_date: '',
                        end_date: '',
                        sort_by: 'payment_time',
                        sort_order: 'desc'
                      })}
                      className="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white font-black rounded-2xl transition-all duration-500 transform hover:scale-105 hover:rotate-1 shadow-2xl hover:shadow-red-500/50"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 transform -skew-x-12 animate-pulse"></div>
                      <div className="relative flex items-center gap-2">
                        <span className="text-lg">🗑️</span>
                        <span className="text-sm tracking-wide">Clear All</span>
                        <span className="text-lg">✨</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Transactions Table */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-white/20">
            <h2 className="text-2xl font-bold text-white">📊 Transaction Records</h2>
            <p className="text-white/70 mt-1">
              Showing {transactions.length} of {pagination.total_records} total records
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-600/50 backdrop-blur-sm border-b border-white/10">
                  <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider border-r border-white/10">
                    Sr No.
                  </th>
                  {[
                    { key: 'collect_id', label: 'Collect ID', copyable: true },
                    { key: 'school_id', label: 'School ID', copyable: true },
                    { key: 'gateway', label: 'Gateway', copyable: false },
                    { key: 'order_amount', label: 'Order Amount', copyable: false },
                    { key: 'transaction_amount', label: 'Transaction Amount', copyable: false },
                    { key: 'status', label: 'Status', copyable: false },
                    { key: 'custom_order_id', label: 'Order ID', copyable: true },
                    { key: 'payment_time', label: 'Payment Time', copyable: false }
                  ].map((column) => (
                    <th
                      key={column.key}
                      onClick={() => handleSort(column.key)}
                      className={`px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-all duration-200 border-r border-white/10 last:border-r-0 ${column.copyable ? 'min-w-[250px]' : ''}`}
                    >
                      <div className="flex items-center gap-2">
                        {column.copyable && <span className="text-blue-300">📋</span>}
                        {column.label}
                        {filters.sort_by === column.key && (
                          filters.sort_order === 'desc' ? 
                          <ChevronDownIcon className="h-4 w-4 text-yellow-400" /> : 
                          <ChevronUpIcon className="h-4 w-4 text-yellow-400" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white/5 backdrop-blur-sm divide-y divide-white/10">
                {loading ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center text-white/70">
                      <div className="flex items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        Loading transactions...
                      </div>
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center text-white/70">
                      <div className="flex flex-col items-center gap-3">
                        <span className="text-4xl">📭</span>
                        <span className="text-lg font-medium">No transactions found</span>
                        <span className="text-sm">Try adjusting your filters</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction, index) => (
                    <tr 
                      key={transaction.collect_id}
                      className="hover:bg-white/10 transition-all duration-200 group border-b border-white/5"
                    >
                      {/* Sr No Column */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-white border-r border-white/10">
                        {(pagination.current_page - 1) * pagination.records_per_page + index + 1}
                      </td>
                      
                      {/* Collect ID - Copyable */}
                      <td className="px-4 py-4 border-r border-white/10" style={{minWidth: '250px'}}>
                        <button 
                          onClick={(event) => copyToClipboard(transaction.collect_id, 'Collect ID', event)}
                          className="inline-flex items-center gap-1 text-sm font-medium text-blue-300 hover:text-blue-200 transition-colors whitespace-nowrap"
                          title="Click to copy"
                        >
                          <span className="font-mono">{transaction.collect_id?.substring(0, 8)}...</span>
                          <span className="text-xs">📋</span>
                        </button>
                      </td>
                      
                      {/* School ID - Copyable */}
                      <td className="px-4 py-4 border-r border-white/10" style={{minWidth: '250px'}}>
                        <button 
                          onClick={(event) => copyToClipboard(transaction.school_id, 'School ID', event)}
                          className="inline-flex items-center gap-1 text-sm text-green-300 hover:text-green-200 transition-colors whitespace-nowrap"
                          title="Click to copy"
                        >
                          <span className="font-mono">{transaction.school_id}</span>
                          <span className="text-xs">📋</span>
                        </button>
                      </td>
                      
                      {/* Gateway */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-white/80 border-r border-white/10">
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-md text-xs font-medium">
                          {transaction.gateway}
                        </span>
                      </td>
                      
                      {/* Order Amount */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-yellow-300 border-r border-white/10">
                        ₹{transaction.order_amount?.toLocaleString()}
                      </td>
                      
                      {/* Transaction Amount */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-green-300 border-r border-white/10">
                        ₹{transaction.transaction_amount?.toLocaleString()}
                      </td>
                      
                      {/* Status */}
                      <td className="px-4 py-4 whitespace-nowrap border-r border-white/10">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${getStatusColor(transaction.status)}`}>
                          {transaction.status === 'success' && '✅'} 
                          {transaction.status === 'pending' && '⏳'} 
                          {transaction.status === 'failed' && '❌'} 
                          {transaction.status?.toUpperCase()}
                        </span>
                      </td>
                      
                      {/* Order ID - Copyable */}
                      <td className="px-4 py-4 whitespace-nowrap border-r border-white/10" style={{minWidth: '250px'}}>
                        <button 
                          onClick={(event) => copyToClipboard(transaction.custom_order_id, 'Order ID', event)}
                          className="inline-flex items-center gap-1 text-sm text-orange-300 hover:text-orange-200 transition-colors whitespace-nowrap"
                          title="Click to copy"
                        >
                          <span className="font-mono">{transaction.custom_order_id}</span>
                          <span className="text-xs">📋</span>
                        </button>
                      </td>
                      
                      {/* Payment Time */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-white/70">
                        <div className="flex items-center gap-2">
                          <span>📅</span>
                          {transaction.payment_time ? format(new Date(transaction.payment_time), 'dd MMM yyyy HH:mm') : 'N/A'}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => changePage(pagination.current_page - 1)}
              disabled={pagination.current_page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => changePage(pagination.current_page + 1)}
              disabled={pagination.current_page === pagination.total_pages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing page <span className="font-medium">{pagination.current_page}</span> of{' '}
                <span className="font-medium">{pagination.total_pages}</span> ({pagination.total_records} total records)
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => changePage(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                {[...Array(Math.min(5, pagination.total_pages))].map((_, idx) => {
                  const page = idx + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => changePage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === pagination.current_page
                          ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => changePage(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.total_pages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-2xl">👨‍💻</span>
              <h3 className="text-xl font-bold text-white">Developed by</h3>
            </div>
            <p className="text-2xl font-black bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Arpit Singh
            </p>
            <p className="text-lg text-white/70 font-medium mt-1">
              Software Development Engineer
            </p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-sm text-white/60">Ready to build amazing things</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
