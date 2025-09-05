import React, { useState, useEffect } from 'react';
import { Search, FileText, Calendar, User, GraduationCap, Hash, Trash2, AlertTriangle, Filter, X, ChevronDown, Download, Info } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import { Certificate } from '../types';
import { certificateAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';

const AdminCertificates: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [filteredCertificates, setFilteredCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'revoked'>('all');
  const [searchType, setSearchType] = useState<'all' | 'student' | 'degree' | 'id'>('all');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [deletingCertId, setDeletingCertId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [quickFilters] = useState([
    { label: 'Recent (Last 30 days)', action: () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      setDateRange({ start: thirtyDaysAgo.toISOString().split('T')[0], end: new Date().toISOString().split('T')[0] });
    }},
    { label: 'This Year', action: () => {
      const year = new Date().getFullYear();
      setDateRange({ start: `${year}-01-01`, end: `${year}-12-31` });
    }},
    { label: 'Active Only', action: () => setStatusFilter('active') },
    { label: 'Revoked Only', action: () => setStatusFilter('revoked') }
  ]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false
  });

  useEffect(() => {
    fetchCertificates();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
      // Escape to clear search
      if (e.key === 'Escape' && (searchTerm || statusFilter !== 'all' || dateRange.start || dateRange.end)) {
        clearFilters();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [searchTerm, statusFilter, dateRange]);

  const exportSearchResults = () => {
    const dataToExport = filteredCertificates.map(cert => ({
      'Certificate ID': cert.id,
      'Student Name': cert.studentName,
      'Degree': cert.degreeTitle,
      'Issue Date': new Date(cert.issueDate).toLocaleDateString(),
      'Status': cert.status,
      'Valid': cert.isValid ? 'Yes' : 'No'
    }));

    const csvContent = [
      Object.keys(dataToExport[0] || {}).join(','),
      ...dataToExport.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `certificates-search-results-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const fetchCertificates = async () => {
    try {
      setIsLoading(true);
      const response = await certificateAPI.getAllCertificates();
      const responseData = response.data as { status: string; data: { certificates: any[] } };
      const certs = responseData.data.certificates.map((cert: any) => ({
        id: cert.certificate_id,
        studentName: cert.student_name,
        degreeTitle: cert.degree,
        issueDate: cert.issue_date,
        status: cert.status || 'active',
        createdAt: cert.issue_date,
        blockHash: cert.qr_code_path ? 'verified' : '',
        isValid: cert.status === 'active'
      }));
      setCertificates(certs);
      setFilteredCertificates(certs);
    } catch (error) {
      console.error('Failed to fetch certificates:', error);
      setToast({
        message: 'Failed to load certificates. Please try again.',
        type: 'error',
        isVisible: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let filtered = certificates;

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(cert => {
        switch (searchType) {
          case 'student':
            return cert.studentName.toLowerCase().includes(searchLower);
          case 'degree':
            return cert.degreeTitle.toLowerCase().includes(searchLower);
          case 'id':
            return cert.id.toLowerCase().includes(searchLower);
          case 'all':
          default:
            return (
              cert.studentName.toLowerCase().includes(searchLower) ||
              cert.degreeTitle.toLowerCase().includes(searchLower) ||
              cert.id.toLowerCase().includes(searchLower)
            );
        }
      });
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(cert => cert.status === statusFilter);
    }

    // Apply date range filter
    if (dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      filtered = filtered.filter(cert => {
        const certDate = new Date(cert.issueDate);
        return certDate >= startDate && certDate <= endDate;
      });
    }

    setFilteredCertificates(filtered);
  }, [certificates, searchTerm, searchType, statusFilter, dateRange]);

  const clearFilters = () => {
    setSearchTerm('');
    setSearchType('all');
    setStatusFilter('all');
    setDateRange({ start: '', end: '' });
  };

  const handleSearchSubmit = (term: string) => {
    if (term.trim() && !searchHistory.includes(term.trim())) {
      setSearchHistory(prev => [term.trim(), ...prev.slice(0, 4)]); // Keep last 5 searches
    }
  };

  const handleDeleteCertificate = async (certificateId: string) => {
    try {
      setDeletingCertId(certificateId);
      await certificateAPI.deleteCertificate(certificateId);
      
      // Update the certificates list by marking as revoked
      setCertificates(prev => prev.map(cert => 
        cert.id === certificateId 
          ? { ...cert, status: 'revoked' as const, isValid: false }
          : cert
      ));
      
      setToast({
        message: 'Certificate revoked successfully',
        type: 'success',
        isVisible: true
      });
      
      setShowDeleteModal(null);
    } catch (error) {
      console.error('Failed to delete certificate:', error);
      setToast({
        message: 'Failed to revoke certificate. Please try again.',
        type: 'error',
        isVisible: true
      });
    } finally {
      setDeletingCertId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading certificates...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  All Certificates
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Manage and view all issued certificates
                </p>
              </div>
              
              {/* Export and Search Tips */}
              <div className="flex items-center gap-3">
                {filteredCertificates.length > 0 && (
                  <button
                    onClick={exportSearchResults}
                    className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 font-medium"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Results ({filteredCertificates.length})
                  </button>
                )}
                
                <div className="relative group">
                  <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg">
                    <Info className="w-5 h-5" />
                  </button>
                  <div className="absolute right-0 top-8 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Search Tips</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• Use <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Ctrl+K</kbd> to focus search</li>
                      <li>• Press <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Esc</kbd> to clear filters</li>
                      <li>• Search by specific fields using the dropdown</li>
                      <li>• Use date range for time-based filtering</li>
                      <li>• Export filtered results as CSV</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex flex-col gap-4">
              {/* Main Search Row */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search Input */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder={searchType === 'all' ? "Search by name, degree, or certificate ID..." : 
                        searchType === 'student' ? "Search by student name..." :
                        searchType === 'degree' ? "Search by degree title..." :
                        "Search by certificate ID..."}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Search Type Filter */}
                <div className="sm:w-48">
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value as 'all' | 'student' | 'degree' | 'id')}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="all">All Fields</option>
                    <option value="student">Student Name</option>
                    <option value="degree">Degree</option>
                    <option value="id">Certificate ID</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div className="sm:w-48">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'revoked')}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="revoked">Revoked</option>
                  </select>
                </div>

                {/* Advanced Search Toggle */}
                <button
                  onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                  className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200 font-medium whitespace-nowrap"
                >
                  <Filter className="w-4 h-4 inline-block mr-2" />
                  Advanced
                  <ChevronDown className={`w-4 h-4 inline-block ml-1 transition-transform duration-200 ${showAdvancedSearch ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Advanced Search Section */}
              {showAdvancedSearch && (
                <div className="border-t border-gray-200 dark:border-gray-600 pt-4 mt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Date Range Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Issue Date Range
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="date"
                          value={dateRange.start}
                          onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Start Date"
                        />
                        <input
                          type="date"
                          value={dateRange.end}
                          onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="End Date"
                        />
                      </div>
                    </div>

                    {/* Search Actions */}
                    <div className="flex items-end">
                      <div className="flex gap-2 w-full">
                        <button
                          onClick={clearFilters}
                          className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors duration-200 font-medium"
                        >
                          <X className="w-4 h-4 inline-block mr-2" />
                          Clear Filters
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Quick Filters */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Quick Filters
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {quickFilters.map((filter, index) => (
                        <button
                          key={index}
                          onClick={filter.action}
                          className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                        >
                          {filter.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Search History */}
                  {searchHistory.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Recent Searches
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {searchHistory.map((term, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setSearchTerm(term);
                              handleSearchSubmit(term);
                            }}
                            className="px-3 py-1.5 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200"
                          >
                            {term}
                          </button>
                        ))}
                        <button
                          onClick={() => setSearchHistory([])}
                          className="px-2 py-1.5 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          Clear history
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Active Filters Display */}
              {(searchTerm || statusFilter !== 'all' || dateRange.start || dateRange.end) && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                  <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Active filters:</span>
                  
                  {searchTerm && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                      Search: "{searchTerm}"
                      <button 
                        onClick={() => setSearchTerm('')}
                        className="ml-2 hover:text-blue-900 dark:hover:text-blue-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  
                  {statusFilter !== 'all' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                      Status: {statusFilter}
                      <button 
                        onClick={() => setStatusFilter('all')}
                        className="ml-2 hover:text-green-900 dark:hover:text-green-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  
                  {(dateRange.start || dateRange.end) && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                      Date: {dateRange.start || '...'} to {dateRange.end || '...'}
                      <button 
                        onClick={() => setDateRange({ start: '', end: '' })}
                        className="ml-2 hover:text-purple-900 dark:hover:text-purple-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Certificates Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Search Results Summary */}
            {(searchTerm || statusFilter !== 'all' || dateRange.start || dateRange.end) && (
              <div className="bg-blue-50 dark:bg-blue-900/20 px-6 py-3 border-b border-blue-200 dark:border-blue-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-blue-700 dark:text-blue-300">
                    <Search className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">
                      Found {filteredCertificates.length} certificate{filteredCertificates.length !== 1 ? 's' : ''} 
                      {certificates.length > 0 && ` out of ${certificates.length} total`}
                    </span>
                  </div>
                  {filteredCertificates.length === 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              </div>
            )}

            {filteredCertificates.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {certificates.length === 0 ? 'No Certificates Yet' : 
                   (searchTerm || statusFilter !== 'all' || dateRange.start || dateRange.end) ? 'No Results Found' : 'No Certificates Available'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {certificates.length === 0 
                    ? 'Start by adding your first certificate to the system.'
                    : (searchTerm || statusFilter !== 'all' || dateRange.start || dateRange.end)
                      ? 'No certificates match your current search criteria.'
                      : 'No certificates are available at the moment.'
                  }
                </p>
                
                {/* Search Suggestions for No Results */}
                {(searchTerm || statusFilter !== 'all' || dateRange.start || dateRange.end) && certificates.length > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mt-4 text-left max-w-md mx-auto">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Search Suggestions:</h4>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• Try removing some filters or search terms</li>
                      <li>• Check spelling of student names or degree titles</li>
                      <li>• Use broader date ranges</li>
                      <li>• Search in "All Fields" instead of specific fields</li>
                    </ul>
                    <button
                      onClick={clearFilters}
                      className="mt-3 text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded font-medium transition-colors duration-200"
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Table Header */}
                <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                  <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <div className="flex items-center">
                      <Hash className="h-4 w-4 mr-2" />
                      Certificate ID
                    </div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Student Name
                    </div>
                    <div className="flex items-center">
                      <GraduationCap className="h-4 w-4 mr-2" />
                      Degree
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Issue Date
                    </div>
                    <div>Status</div>
                    <div>Actions</div>
                  </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredCertificates.map((cert) => (
                    <div key={cert.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-center">
                        <div>
                          <p className="text-sm font-mono text-gray-900 dark:text-white truncate">
                            {cert.id}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {cert.studentName}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {cert.degreeTitle}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(cert.issueDate)}
                          </p>
                        </div>
                        <div>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            cert.status === 'active'
                              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                          }`}>
                            {cert.status}
                          </span>
                        </div>
                        <div>
                          {cert.status === 'active' && (
                            <button
                              onClick={() => setShowDeleteModal(cert.id)}
                              disabled={deletingCertId === cert.id}
                              className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              {deletingCertId === cert.id ? 'Revoking...' : 'Revoke'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Summary */}
          {certificates.length > 0 && (
            <div className="mt-6 text-sm text-gray-600 dark:text-gray-400 text-center">
              Showing {filteredCertificates.length} of {certificates.length} certificates
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mt-5">
                Revoke Certificate
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Are you sure you want to revoke this certificate? This action cannot be undone and will mark the certificate as invalid on the blockchain.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={() => showDeleteModal && handleDeleteCertificate(showDeleteModal)}
                  disabled={deletingCertId === showDeleteModal}
                  className="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50 disabled:cursor-not-allowed mr-2"
                >
                  {deletingCertId === showDeleteModal ? 'Revoking...' : 'Yes, Revoke Certificate'}
                </button>
                <button
                  onClick={() => setShowDeleteModal(null)}
                  disabled={deletingCertId === showDeleteModal}
                  className="mt-3 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-400 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
};

export default AdminCertificates;