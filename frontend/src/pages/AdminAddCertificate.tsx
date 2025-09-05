import React, { useState } from 'react';
import { Plus, Calendar, User, GraduationCap, Hash } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import { certificateAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';

const AdminAddCertificate: React.FC = () => {
  const [formData, setFormData] = useState({
    studentName: '',
    degreeTitle: '',
    issueDate: '',
    certificateId: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateId = () => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substr(2, 9).toUpperCase();
    const certificateId = `CERT_${timestamp}_${randomString}`;
    setFormData(prev => ({ ...prev, certificateId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.studentName || !formData.degreeTitle || !formData.issueDate) {
      setToast({
        message: 'Please fill in all required fields',
        type: 'error',
        isVisible: true
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Prepare data for backend API (snake_case format)
      const certificateData = {
        student_name: formData.studentName,
        degree: formData.degreeTitle,
        issue_date: formData.issueDate,
        certificate_id: formData.certificateId || `CERT_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      };

      const response = await certificateAPI.addCertificate(certificateData);
      
      // Log success for debugging
      console.log('Certificate created successfully:', response.data);
      
      setToast({
        message: `Certificate created successfully! ID: ${certificateData.certificate_id}`,
        type: 'success',
        isVisible: true
      });

      // Reset form
      setFormData({
        studentName: '',
        degreeTitle: '',
        issueDate: '',
        certificateId: ''
      });
    } catch (error) {
      console.error('Certificate creation error:', error);
      setToast({
        message: 'Failed to create certificate. Please try again.',
        type: 'error',
        isVisible: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="max-w-2xl">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Add New Certificate
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Create a new blockchain-verified academic certificate
              </p>
            </div>

            {/* Form Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Student Name */}
                  <div>
                    <label htmlFor="studentName" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <User className="h-4 w-4 mr-2" />
                      Student Name *
                    </label>
                    <input
                      type="text"
                      id="studentName"
                      name="studentName"
                      value={formData.studentName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter student's full name"
                      required
                    />
                  </div>

                  {/* Degree Title */}
                  <div>
                    <label htmlFor="degreeTitle" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <GraduationCap className="h-4 w-4 mr-2" />
                      Degree Title *
                    </label>
                    <input
                      type="text"
                      id="degreeTitle"
                      name="degreeTitle"
                      value={formData.degreeTitle}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="e.g., Bachelor of Science in Computer Science"
                      required
                    />
                  </div>

                  {/* Issue Date */}
                  <div>
                    <label htmlFor="issueDate" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Calendar className="h-4 w-4 mr-2" />
                      Issue Date *
                    </label>
                    <input
                      type="date"
                      id="issueDate"
                      name="issueDate"
                      value={formData.issueDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>

                  {/* Certificate ID */}
                  <div>
                    <label htmlFor="certificateId" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Hash className="h-4 w-4 mr-2" />
                      Certificate ID (Auto-generated)
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        id="certificateId"
                        name="certificateId"
                        value={formData.certificateId}
                        onChange={handleInputChange}
                        className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Auto-generated on submission"
                        readOnly
                      />
                      <button
                        type="button"
                        onClick={handleGenerateId}
                        className="px-4 py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-200 whitespace-nowrap"
                      >
                        Generate
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl disabled:shadow-md transform hover:scale-[1.02] disabled:scale-100 transition-all duration-200 flex items-center justify-center space-x-2 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>Creating Certificate...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-5 w-5" />
                        <span>Create Certificate</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
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

export default AdminAddCertificate;