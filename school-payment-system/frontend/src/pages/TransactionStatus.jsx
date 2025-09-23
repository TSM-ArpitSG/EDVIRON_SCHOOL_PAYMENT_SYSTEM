import { useState } from 'react';
import axiosInstance from '../config/axios';
import { format } from 'date-fns';
import { CheckCircleIcon, XCircleIcon, ClockIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid';

export default function TransactionStatus() {
  const [orderId, setOrderId] = useState('');
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Copy to clipboard function
  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text).then(() => {
      setToast({ show: true, message: `${fieldName} copied!`, type: 'success' });
      setTimeout(() => setToast({ show: false, message: '', type: '' }), 1000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
      setToast({ show: true, message: 'Copy failed!', type: 'error' });
      setTimeout(() => setToast({ show: false, message: '', type: '' }), 1000);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!orderId.trim()) {
      setError('Please enter an Order ID');
      return;
    }

    setLoading(true);
    setError('');
    try {
      console.log('Checking transaction status for:', orderId);
      const response = await axiosInstance.get(`/orders/transaction-status/${orderId}`);
      console.log('Full API Response:', response);
      console.log('Response data:', response.data);
      console.log('Response data.transaction:', response.data.transaction);
      
      // The API returns data at response.data.transaction, not response.data.data
      let transactionData = response.data.transaction;
      console.log('Transaction data to set:', transactionData);
      
      if (!transactionData) {
        throw new Error('No transaction data found in response');
      }
      
      setTransaction(transactionData);
    } catch (err) {
      console.error('API Error:', err);
      console.error('Error response:', err.response);
      const errorMessage = err.response?.data?.message || err.message || 'Transaction not found';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'success':
        return <CheckCircleIcon className="h-8 w-8 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="h-8 w-8 text-red-500" />;
      case 'pending':
        return <ClockIcon className="h-8 w-8 text-yellow-500" />;
      default:
        return null;
    }
  };

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
      {/* Toast Notification */}
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

      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
            🔍 Transaction Status
          </h1>
          <p className="text-xl text-white/80 font-medium">
            Track and verify your payment status in real-time
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/10 shadow-2xl">
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-white/50" />
              </div>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Enter Order ID..."
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {error && (
                <p className="mt-2 text-sm text-red-400">{error}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin h-5 w-5 border-2 border-white/50 border-t-white rounded-full"></span>
                  Searching...
                </>
              ) : (
                <>
                  <MagnifyingGlassIcon className="h-5 w-5" />
                  Search
                </>
              )}
            </button>
          </form>
        </div>

        {/* Transaction Details */}
        {transaction && (
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl overflow-hidden mx-auto max-w-4xl">
            <div className="bg-gray-600/50 backdrop-blur-sm border-b border-white/10 px-8 py-5">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                📋 Transaction Details
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <tbody className="bg-white/5 backdrop-blur-sm">
                  {/* Order ID */}
                  <tr className="border-b border-white/10 hover:bg-white/10 transition-all duration-200">
                    <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-white/80 border-r border-white/10 w-2/5">
                      <div className="flex items-center gap-3">
                        <span className="text-orange-400">🔍</span>
                        Order ID
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-sm text-orange-300">
                      <button 
                        onClick={() => copyToClipboard(transaction.custom_order_id, 'Order ID')}
                        className="inline-flex items-center gap-2 font-medium hover:text-orange-200 transition-colors"
                        title="Click to copy"
                      >
                        <span className="font-mono">{transaction.custom_order_id}</span>
                        <span className="text-xs">📋</span>
                      </button>
                    </td>
                  </tr>

                  {/* School ID */}
                  <tr className="border-b border-white/10 hover:bg-white/10 transition-all duration-200">
                    <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-white/80 border-r border-white/10 w-2/5">
                      <div className="flex items-center gap-3">
                        <span className="text-green-400">🏫</span>
                        School ID
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-sm text-green-300">
                      <button 
                        onClick={() => copyToClipboard(transaction.school_id, 'School ID')}
                        className="inline-flex items-center gap-2 font-medium hover:text-green-200 transition-colors"
                        title="Click to copy"
                      >
                        <span className="font-mono">{transaction.school_id}</span>
                        <span className="text-xs">📋</span>
                      </button>
                    </td>
                  </tr>

                  {/* Student Info */}
                  <tr className="border-b border-white/10 hover:bg-white/10 transition-all duration-200">
                    <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-white/80 border-r border-white/10 w-2/5">
                      <div className="flex items-center gap-3">
                        <span className="text-blue-400">👤</span>
                        Student
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-sm text-white">
                      {transaction.student_info?.name || 'N/A'}
                    </td>
                  </tr>

                  {/* Amounts */}
                  <tr className="border-b border-white/10 hover:bg-white/10 transition-all duration-200">
                    <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-white/80 border-r border-white/10 w-2/5">
                      <div className="flex items-center gap-3">
                        <span className="text-yellow-400">💰</span>
                        Order Amount
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-sm font-semibold text-yellow-300">
                      ₹{transaction.order_amount?.toLocaleString()}
                    </td>
                  </tr>

                  <tr className="border-b border-white/10 hover:bg-white/10 transition-all duration-200">
                    <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-white/80 border-r border-white/10 w-2/5">
                      <div className="flex items-center gap-3">
                        <span className="text-green-400">💳</span>
                        Transaction Amount
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-sm font-semibold text-green-300">
                      ₹{transaction.transaction_amount?.toLocaleString()}
                    </td>
                  </tr>

                  {/* Status */}
                  <tr className="border-b border-white/10 hover:bg-white/10 transition-all duration-200">
                    <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-white/80 border-r border-white/10 w-2/5">
                      <div className="flex items-center gap-3">
                        <span className="text-purple-400">📊</span>
                        Status
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex items-center gap-1 text-xs leading-5 font-bold rounded-full border ${getStatusColor(transaction.status)}`}>
                        {getStatusIcon(transaction.status)}
                        {transaction.status?.toUpperCase()}
                      </span>
                    </td>
                  </tr>

                  {/* Payment Details */}
                  <tr className="border-b border-white/10 hover:bg-white/10 transition-all duration-200">
                    <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-white/80 border-r border-white/10 w-2/5">
                      <div className="flex items-center gap-3">
                        <span className="text-indigo-400">💳</span>
                        Payment Mode
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-sm text-white capitalize">
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-md text-xs font-medium">
                        {transaction.payment_mode || 'N/A'}
                      </span>
                    </td>
                  </tr>

                  <tr className="border-b border-white/10 hover:bg-white/10 transition-all duration-200">
                    <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-white/80 border-r border-white/10 w-2/5">
                      <div className="flex items-center gap-3">
                        <span className="text-cyan-400">📅</span>
                        Payment Time
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-sm text-white/70">
                      <div className="flex items-center gap-2">
                        {transaction.payment_time ? format(new Date(transaction.payment_time), 'dd MMM yyyy HH:mm') : 'N/A'}
                      </div>
                    </td>
                  </tr>

                  {/* Additional Info */}
                  {transaction.bank_reference && transaction.bank_reference !== 'NA' && (
                    <tr className="border-b border-white/10 hover:bg-white/10 transition-all duration-200">
                      <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-white/80 border-r border-white/10 w-2/5">
                        <div className="flex items-center gap-3">
                          <span className="text-pink-400">🏦</span>
                          Bank Reference
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-sm text-white/70">
                        {transaction.bank_reference}
                      </td>
                    </tr>
                  )}

                  {transaction.payment_message && transaction.payment_message !== 'NA' && (
                    <tr className="hover:bg-white/10 transition-all duration-200">
                      <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-white/80 border-r border-white/10 w-2/5">
                        <div className="flex items-center gap-3">
                          <span className="text-amber-400">💬</span>
                          Payment Message
                        </div>
                      </td>
                      <td className="px-8 py-5 text-sm text-white/70">
                        {transaction.payment_message}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center">
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
