import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Plus, 
  FileText, 
  Blocks, 
  Settings,
  ChevronRight
} from 'lucide-react';

const AdminSidebar: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Plus, label: 'Add Certificate', path: '/admin/add' },
    { icon: FileText, label: 'All Certificates', path: '/admin/certificates' },
    { icon: Blocks, label: 'Blockchain Viewer', path: '/admin/blockchain' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Admin Panel</h2>
        
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive(item.path)
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </div>
              {isActive(item.path) && (
                <ChevronRight className="h-4 w-4" />
              )}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default AdminSidebar;