import React, { useState, useEffect, useCallback } from 'react';
import VideoGenerator from './components/VideoGenerator';
import ImageGenerator from './components/ImageGenerator';
import ApiKeySelector from './components/ApiKeySelector';
import Header from './components/Header';
import TabButton from './components/TabButton';
import { VideoIcon, ImageIcon } from './components/icons';

type ActiveTab = 'video' | 'image';

// Fix: Removed global declaration for window.aistudio to resolve redeclaration errors. The type is expected to be provided by the host environment.
const App: React.FC = () => {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isKeyChecked, setIsKeyChecked] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('video');

  const checkApiKey = useCallback(async () => {
    if (window.aistudio) {
      const keyStatus = await window.aistudio.hasSelectedApiKey();
      setHasApiKey(keyStatus);
    } else {
        // Fallback for local dev when aistudio is not present
        console.warn("window.aistudio is not available. Assuming API key is set via environment variable.");
        setHasApiKey(true);
    }
    setIsKeyChecked(true);
  }, []);

  useEffect(() => {
    checkApiKey();
  }, [checkApiKey]);

  const handleKeySelected = () => {
    setHasApiKey(true);
    setIsKeyChecked(true);
  };
  
  const handleKeyError = () => {
    setHasApiKey(false);
    setIsKeyChecked(true);
  }

  if (!isKeyChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <p className="text-xl text-gray-300">Checking API Key status...</p>
        </div>
      </div>
    );
  }

  if (!hasApiKey) {
    return <ApiKeySelector onKeySelected={handleKeySelected} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-center border-b border-gray-700 mb-8">
                <TabButton 
                    isActive={activeTab === 'video'} 
                    onClick={() => setActiveTab('video')}
                    icon={<VideoIcon />}
                >
                    Video Generator
                </TabButton>
                <TabButton 
                    isActive={activeTab === 'image'} 
                    onClick={() => setActiveTab('image')}
                    icon={<ImageIcon />}
                >
                    Image Generator
                </TabButton>
            </div>

            {activeTab === 'video' && <VideoGenerator onKeyError={handleKeyError} />}
            {activeTab === 'image' && <ImageGenerator onKeyError={handleKeyError} />}
        </div>
      </main>
    </div>
  );
};

export default App;