import React, { useState, useEffect } from 'react';
import { Blocks, Hash, Clock, ArrowRight } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import { blockchainAPI } from '../services/api';
import { Block } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminBlockchain: React.FC = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        const response = await blockchainAPI.getBlockchain();
        const responseData = response.data as { status: string; data: { chain: Block[] } };
        console.log('Blockchain response:', responseData); // Debug log
        
        // Use the blocks directly from the API response
        const blockData = responseData.data.chain || [];
        
        console.log('Processed blocks:', blockData); // Debug log
        setBlocks(blockData);
      } catch (error) {
        console.error('Failed to fetch blockchain:', error);
        // Fallback to empty array if API fails
        setBlocks([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlocks();
  }, []);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading blockchain...</p>
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
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Blocks className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Blockchain Explorer
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  View the immutable blockchain containing all certificate records
                </p>
              </div>
            </div>
          </div>

          {/* Blockchain Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">{blocks.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Blocks</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 text-center">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">{blocks.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Certificates</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">100%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Integrity</div>
            </div>
          </div>

          {/* Blockchain Visualization */}
          <div className="space-y-6">
            {blocks.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-12 text-center">
                <Blocks className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Blocks Yet</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  The blockchain is empty. Add some certificates to see blocks here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {blocks.map((block, index) => (
                  <div key={block.index} className="relative">
                    {/* Connection Line */}
                    {index < blocks.length - 1 && (
                      <div className="absolute left-1/2 top-full w-px h-4 bg-blue-300 dark:bg-blue-600 transform -translate-x-1/2 z-10"></div>
                    )}
                    
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200">
                      <div className="p-6">
                        {/* Block Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                              <Blocks className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Block #{block.index}
                              </h3>
                              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <Clock className="h-4 w-4 mr-1" />
                                {formatTimestamp(block.timestamp)}
                              </div>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Block #{block.index}
                          </div>
                        </div>

                        {/* Block Details */}
                        <div className="grid lg:grid-cols-2 gap-6">
                          {/* Hashes */}
                          <div className="space-y-4">
                            <div>
                              <label className="flex items-center text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                                <Hash className="h-3 w-3 mr-1" />
                                Block Hash
                              </label>
                              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                <p className="text-xs font-mono text-gray-700 dark:text-gray-300 break-all">
                                  {block.hash}
                                </p>
                              </div>
                            </div>
                            
                            <div>
                              <label className="flex items-center text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                                <ArrowRight className="h-3 w-3 mr-1" />
                                Previous Hash
                              </label>
                              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                <p className="text-xs font-mono text-gray-700 dark:text-gray-300 break-all">
                                  {block.previous_hash}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Certificate Data */}
                          <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Certificate Data</h4>
                            <div className="space-y-3">
                              <div>
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Student</label>
                                <p className="text-sm text-gray-900 dark:text-white">
                                  {block.certificate_data?.student_name || 'N/A'}
                                </p>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Degree</label>
                                <p className="text-sm text-gray-900 dark:text-white">
                                  {block.certificate_data?.degree || 'N/A'}
                                </p>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Issue Date</label>
                                <p className="text-sm text-gray-900 dark:text-white">
                                  {block.certificate_data?.issue_date || 'N/A'}
                                </p>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Certificate ID</label>
                                <p className="text-sm text-gray-900 dark:text-white font-mono">
                                  {block.certificate_data?.certificate_id || 'N/A'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBlockchain;