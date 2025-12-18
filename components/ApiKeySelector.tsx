
import React, { useCallback } from 'react';

interface ApiKeySelectorProps {
  onKeySelected: () => void;
}

const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onKeySelected }) => {

  const handleSelectKey = useCallback(async () => {
    if (window.aistudio) {
        try {
            await window.aistudio.openSelectKey();
            // Optimistically update the state assuming the user selected a key.
            onKeySelected();
        } catch (error) {
            console.error("Error opening API key selection:", error);
        }
    } else {
        alert("API key selection is not available in this environment.");
    }
  }, [onKeySelected]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="text-center bg-gray-800 p-10 rounded-lg shadow-2xl max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-white mb-4">Welcome to the AI Ad Generator</h1>
        <p className="text-gray-400 mb-6">
          To generate videos and images, you need to select a Gemini API key. 
          This will be used for all requests made by the application.
        </p>
        <button
          onClick={handleSelectKey}
          className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800"
        >
          Select API Key
        </button>
        <p className="text-xs text-gray-500 mt-4">
          By using this service, you agree to the associated costs. Please review the 
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-indigo-400 hover:underline ml-1"
          >
            billing documentation
          </a>.
        </p>
      </div>
    </div>
  );
};

export default ApiKeySelector;
