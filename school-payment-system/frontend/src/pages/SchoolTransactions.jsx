import { useState, useEffect } from 'react';
import axiosInstance from '../config/axios';
import { format } from 'date-fns';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

export default function SchoolTransactions() {
  const [schoolId, setSchoolId] = useState('65b0e6293e9f76a9694d84b4'); // Default school ID from assessment
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_records: 0,
    records_per_page: 10
  });
  const [toast, setToast] = useState({ show: false, message: '' });

  const fetchTransactions = async (page = 1) => {
    if (!schoolId) return;
    
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/orders/transactions/school/${schoolId}?page=${page}&limit=10`);
      setTransactions(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch school transactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (schoolId) {
      fetchTransactions();
    }
  }, [schoolId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchTransactions();
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text).then(() => {
      setToast({ show: true, message: `${fieldName} copied!` });
      setTimeout(() => setToast({ show: false, message: '' }), 1000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      {/* Toast Notification - Same as Dashboard */}
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
            🏫 School Transactions
          </h1>
          <p className="text-lg text-white/70">
            View all transactions for a specific school
          </p>
        </div>

        {/* Search Form */}
        <div className="max-w-2xl mx-auto mb-8">
          <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-white/90 text-sm font-bold mb-3 flex items-center gap-2">
                  <span className="text-green-400">🏫</span>
                  Enter School ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={schoolId}
                    onChange={(e) => setSchoolId(e.target.value)}
                    placeholder="65b0e6293e9f76a9694d84b4"
                    className="w-full px-6 py-4 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-4 focus:ring-blue-400/50 focus:border-blue-400 transition-all duration-300"
                  />
                  <MagnifyingGlassIcon className="absolute right-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-white/50" />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                <MagnifyingGlassIcon className="h-6 w-6" />
                {loading ? 'Searching...' : 'Search Transactions'}
              </button>
            </div>
          </form>
        </div>

        {/* Transactions Table */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl overflow-hidden mx-auto max-w-6xl">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-600/50 backdrop-blur-sm border-b border-white/10">
                  <th className="px-6 py-5 text-left text-xs font-bold text-white uppercase tracking-wider border-r border-white/10">
                    Sr No.
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-white uppercase tracking-wider border-r border-white/10 min-w-[280px]">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-300">📋</span>
                      Order ID
                    </div>
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-white uppercase tracking-wider border-r border-white/10">
                    Amount
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-white uppercase tracking-wider border-r border-white/10">
                    Status
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/5 backdrop-blur-sm divide-y divide-white/10">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-white/70">
                      <div className="flex items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        Loading transactions...
                      </div>
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-white/70">
                      <div className="flex flex-col items-center gap-3">
                        <span className="text-4xl">📭</span>
                        <span className="text-lg font-medium">No transactions found</span>
                        <span className="text-sm">Try searching with a different School ID</span>
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
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-white border-r border-white/10">
                        {(pagination.current_page - 1) * pagination.records_per_page + index + 1}
                      </td>
                      
                      {/* Order ID - Copyable */}
                      <td className="px-6 py-5 border-r border-white/10" style={{minWidth: '280px'}}>
                        <button 
                          onClick={() => copyToClipboard(transaction.collect_id, 'Order ID')}
                          className="inline-flex items-center gap-2 text-sm font-medium text-blue-300 hover:text-blue-200 transition-colors whitespace-nowrap"
                          title="Click to copy"
                        >
                          <span className="font-mono">{transaction.collect_id?.substring(0, 8)}...</span>
                          <span className="text-xs">📋</span>
                        </button>
                      </td>
                      
                      {/* Amount */}
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-semibold text-green-300 border-r border-white/10">
                        ₹{transaction.transaction_amount?.toLocaleString()}
                      </td>
                      
                      {/* Status */}
                      <td className="px-6 py-5 whitespace-nowrap border-r border-white/10">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${getStatusColor(transaction.status)}`}>
                          {transaction.status === 'success' && '✅'} 
                          {transaction.status === 'pending' && '⏳'} 
                          {transaction.status === 'failed' && '❌'} 
                          {transaction.status?.toUpperCase()}
                        </span>
                      </td>
                      
                      {/* Date */}
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-white/70">
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

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div className="px-6 py-4 flex items-center justify-between border-t border-white/10">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => fetchTransactions(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-white/20 text-sm font-medium rounded-md text-white bg-white/10 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => fetchTransactions(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.total_pages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-white/20 text-sm font-medium rounded-md text-white bg-white/10 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-white/70">
                    Showing <span className="font-medium">{(pagination.current_page - 1) * pagination.records_per_page + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(pagination.current_page * pagination.records_per_page, pagination.total_records)}
                    </span>{' '}
                    of <span className="font-medium">{pagination.total_records}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => fetchTransactions(pagination.current_page - 1)}
                      disabled={pagination.current_page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-white/20 bg-white/5 text-sm font-medium text-white hover:bg-white/10 disabled:opacity-50"
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                    {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                      let pageNum;
                      if (pagination.total_pages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.current_page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.current_page >= pagination.total_pages - 2) {
                        pageNum = pagination.total_pages - 4 + i;
                      } else {
                        pageNum = pagination.current_page - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => fetchTransactions(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pagination.current_page === pageNum
                              ? 'bg-indigo-500 border-indigo-500 text-white'
                              : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => fetchTransactions(pagination.current_page + 1)}
                      disabled={pagination.current_page === pagination.total_pages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-white/20 bg-white/5 text-sm font-medium text-white hover:bg-white/10 disabled:opacity-50"
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center">
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
