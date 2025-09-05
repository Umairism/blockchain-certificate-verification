import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  CheckCircle, 
  TrendingUp, 
  Calendar,
  Award,
  AlertCircle
} from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import { certificateAPI } from '../services/api';
import { Certificate } from '../types';

const AdminDashboard: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
      } catch (error) {
        console.error('Failed to fetch certificates:', error);
        // Fallback to localStorage if API fails
        const stored = localStorage.getItem('certificates');
        const certs = stored ? JSON.parse(stored) : [];
        setCertificates(certs);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  const stats = [
    { 
      icon: FileText, 
      label: 'Total Certificates', 
      value: certificates.length.toString(),
      change: '+12%',
      changeType: 'positive' as const
    },
    { 
      icon: CheckCircle, 
      label: 'Verified Today', 
      value: '47',
      change: '+8%',
      changeType: 'positive' as const
    },
    { 
      icon: Users, 
      label: 'Active Students', 
      value: certificates.length > 0 ? certificates.length.toString() : '0',
      change: '+5%',
      changeType: 'positive' as const
    },
    { 
      icon: TrendingUp, 
      label: 'Success Rate', 
      value: '99.8%',
      change: '+0.2%',
      changeType: 'positive' as const
    }
  ];

  const recentCertificates = certificates.slice(-5).reverse();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage certificates and monitor system activity
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                    <div className="flex items-center mt-2">
                      <span className={`text-xs font-medium ${
                        stat.changeType === 'positive' 
                          ? 'text-emerald-600 dark:text-emerald-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {stat.change}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">vs last month</span>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <stat.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Recent Certificates */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Certificates</h3>
              </div>
              <div className="p-6">
                {recentCertificates.length === 0 ? (
                  <div className="text-center py-8">
                    <Award className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No certificates yet</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">Add your first certificate to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentCertificates.map((cert) => (
                      <div key={cert.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">
                            {cert.studentName}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {cert.degreeTitle}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(cert.issueDate).toLocaleDateString()}
                          </p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            cert.status === 'active'
                              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                          }`}>
                            {cert.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System Status</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Blockchain Network</span>
                  </div>
                  <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Online</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Verification API</span>
                  </div>
                  <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Operational</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Database Sync</span>
                  </div>
                  <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Syncing</span>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4" />
                    <span>Last updated: {new Date().toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;