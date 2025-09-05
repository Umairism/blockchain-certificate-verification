import React, { useState } from 'react';
import { Search, QrCode, CheckCircle, XCircle, Calendar, User, GraduationCap, Hash } from 'lucide-react';
import { certificateAPI } from '../services/api';
import { VerificationResult } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';

const VerifyCertificate: React.FC = () => {
  const [certificateId, setCertificateId] = useState('');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false
  });

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!certificateId.trim()) {
      setToast({
        message: 'Please enter a certificate ID',
        type: 'error',
        isVisible: true
      });
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    
    try {
      const response = await certificateAPI.verifyPublic(certificateId.trim());
      
      // Type check the response data
      const data = response.data as any;
      
      // Transform the API response to match the VerificationResult type
      const result: VerificationResult = {
        isValid: data.valid || false,
        message: data.valid ? 'Certificate verified successfully' : (data.message || 'Certificate not found'),
        certificate: data.valid ? {
          id: data.certificate_id || '',
          studentName: data.student_name || '',
          degreeTitle: data.degree || '',
          issueDate: data.issue_date || '',
          status: 'active' as const,
          createdAt: new Date().toISOString()
        } : undefined
      };
      
      setVerificationResult(result);
    } catch (error) {
      console.error('Verification error:', error);
      const result: VerificationResult = {
        isValid: false,
        message: 'Certificate not found or invalid',
        certificate: undefined
      };
      setVerificationResult(result);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQRScan = () => {
    setToast({
      message: 'QR code scanning feature coming soon!',
      type: 'success',
      isVisible: true
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Verify Certificate
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Enter a certificate ID to verify its authenticity on the blockchain
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="certificateId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Certificate ID
                </label>
                <input
                  type="text"
                  id="certificateId"
                  value={certificateId}
                  onChange={(e) => setCertificateId(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter certificate ID (e.g., CERT_123456789_ABC)"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Search className="h-5 w-5" />
                  )}
                  <span className="hidden sm:inline">Verify</span>
                </button>
                <button
                  type="button"
                  onClick={handleQRScan}
                  className="px-4 py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-200 flex items-center"
                  title="Scan QR Code"
                >
                  <QrCode className="h-5 w-5" />
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Verification Results */}
        {hasSearched && !isLoading && verificationResult && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Status Header */}
            <div className={`px-6 py-4 ${
              verificationResult.isValid
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-200 dark:border-emerald-700'
                : 'bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-700'
            }`}>
              <div className="flex items-center space-x-3">
                {verificationResult.isValid ? (
                  <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                )}
                <div>
                  <h2 className={`text-xl font-bold ${
                    verificationResult.isValid
                      ? 'text-emerald-800 dark:text-emerald-200'
                      : 'text-red-800 dark:text-red-200'
                  }`}>
                    {verificationResult.isValid ? 'Certificate Valid' : 'Certificate Invalid'}
                  </h2>
                  <p className={`text-sm ${
                    verificationResult.isValid
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {verificationResult.message}
                  </p>
                </div>
              </div>
            </div>

            {/* Certificate Details */}
            {verificationResult.isValid && verificationResult.certificate && (
              <div className="p-6 space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
                      <Hash className="h-4 w-4 mr-2" />
                      Certificate ID
                    </label>
                    <p className="text-lg font-mono text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-md">
                      {verificationResult.certificate.id}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
                      <User className="h-4 w-4 mr-2" />
                      Student Name
                    </label>
                    <p className="text-lg text-gray-900 dark:text-white">
                      {verificationResult.certificate.studentName}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
                      <GraduationCap className="h-4 w-4 mr-2" />
                      Degree Title
                    </label>
                    <p className="text-lg text-gray-900 dark:text-white">
                      {verificationResult.certificate.degreeTitle}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
                      <Calendar className="h-4 w-4 mr-2" />
                      Issue Date
                    </label>
                    <p className="text-lg text-gray-900 dark:text-white">
                      {formatDate(verificationResult.certificate.issueDate)}
                    </p>
                  </div>
                </div>

                {/* Blockchain Hash */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Blockchain Hash
                  </label>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <p className="text-sm font-mono text-gray-700 dark:text-gray-300 break-all">
                      {verificationResult.certificate.blockHash}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* No Results Message */}
        {hasSearched && !isLoading && !verificationResult?.isValid && verificationResult && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Certificate Not Found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The certificate ID you entered could not be found or verified on the blockchain.
            </p>
            <button
              onClick={() => {
                setCertificateId('');
                setVerificationResult(null);
                setHasSearched(false);
              }}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
};

export default VerifyCertificate;