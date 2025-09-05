import React, { useState, useEffect } from 'react';
import { testConnection, authAPI, systemAPI, handleApiError } from '../services/api';

const ConnectionTest: React.FC = () => {
  const [results, setResults] = useState<Array<{
    id: string;
    test: string;
    status: 'loading' | 'success' | 'error';
    message: string;
    timestamp: string;
  }>>([]);

  const addResult = (test: string, status: 'success' | 'error', message: string) => {
    const result = {
      id: Date.now().toString(),
      test,
      status,
      message,
      timestamp: new Date().toLocaleTimeString(),
    };
    setResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results
  };

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    addResult(testName, 'loading' as any, 'Running...');
    try {
      const response = await testFn();
      addResult(testName, 'success', `✅ ${response.data?.message || 'Success'}`);
    } catch (error) {
      const errorMessage = handleApiError(error);
      addResult(testName, 'error', `❌ ${errorMessage}`);
    }
  };

  const tests = [
    {
      name: 'Backend Connection',
      fn: () => authAPI.test(),
    },
    {
      name: 'Health Check',
      fn: () => systemAPI.getHealth(),
    },
    {
      name: 'System Status',
      fn: () => fetch('http://localhost:5000/').then(r => r.json()),
    },
  ];

  useEffect(() => {
    // Auto-run basic connection test on mount
    runTest('Auto Connection Test', testConnection);
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          🔍 Backend Connection Diagnostics
        </h2>
        
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Quick Fix for "ERR_BLOCKED_BY_CLIENT":</h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Disable ad blockers (uBlock Origin, AdBlock Plus)</li>
            <li>• Add localhost:5000 to your ad blocker whitelist</li>
            <li>• Try incognito/private browsing mode</li>
            <li>• Check Windows Firewall settings</li>
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {tests.map((test, index) => (
            <button
              key={index}
              onClick={() => runTest(test.name, test.fn)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
            >
              Test {test.name}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-800">Test Results:</h3>
          {results.length === 0 ? (
            <p className="text-gray-500 italic">No tests run yet...</p>
          ) : (
            results.map((result) => (
              <div
                key={result.id}
                className={`p-3 rounded-lg border-l-4 ${
                  result.status === 'success'
                    ? 'bg-green-50 border-green-400 text-green-800'
                    : result.status === 'error'
                    ? 'bg-red-50 border-red-400 text-red-800'
                    : 'bg-yellow-50 border-yellow-400 text-yellow-800'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-medium">{result.test}</span>
                    <p className="text-sm mt-1">{result.message}</p>
                  </div>
                  <span className="text-xs opacity-75">{result.timestamp}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-2">Backend URLs to Test:</h4>
          <ul className="text-sm space-y-1 text-blue-600">
            <li>
              <a
                href="http://localhost:5000/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                http://localhost:5000/ (Root endpoint)
              </a>
            </li>
            <li>
              <a
                href="http://localhost:5000/test"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                http://localhost:5000/test (Connection test page)
              </a>
            </li>
            <li>
              <a
                href="http://localhost:5000/api/health"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                http://localhost:5000/api/health (Health check)
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ConnectionTest;
