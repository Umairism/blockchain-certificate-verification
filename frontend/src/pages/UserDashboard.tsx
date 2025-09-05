import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, QrCode, Shield, CheckCircle, Users, Award } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const stats = [
    { icon: CheckCircle, label: 'Verifications Today', value: '24' },
    { icon: Users, label: 'Active Users', value: '1,250' },
    { icon: Award, label: 'Total Certificates', value: '10,000+' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Verify academic certificates with blockchain security
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-4">
                  <stat.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Verification Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 dark:bg-blue-700 px-6 py-8">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Certificate Verification</h2>
                <p className="text-blue-100 mt-1">Verify the authenticity of academic certificates</p>
              </div>
            </div>
          </div>

          {/* Verification Options */}
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Search by ID */}
              <div className="group">
                <button
                  onClick={() => navigate('/verify')}
                  className="w-full p-6 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all duration-200 text-left"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors duration-200">
                      <Search className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        Search by Certificate ID
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Enter a certificate ID to verify its authenticity
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              {/* QR Code Scanner */}
              <div className="group">
                <button
                  onClick={() => navigate('/verify')}
                  className="w-full p-6 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all duration-200 text-left"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50 transition-colors duration-200">
                      <QrCode className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        Scan QR Code
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Use your camera to scan a certificate QR code
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* How it Works */}
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">How It Works</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">1</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Enter certificate ID or scan QR code</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">2</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">System checks blockchain records</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">3</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Get instant verification results</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;