import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import LoadingSpinner from './LoadingSpinner';
// Fix: Import VideoIcon to resolve "Cannot find name 'VideoIcon'" error.
import { UploadIcon, VideoIcon } from './icons';

interface VideoGeneratorProps {
    onKeyError: () => void;
}

const loadingMessages = [
    "Warming up the virtual cameras...",
    "Adjusting the lighting and focus...",
    "Directing the digital actors...",
    "Compositing the scenes...",
    "Rendering the final cut...",
    "Adding special effects...",
    "This might take a few minutes, great art takes time!",
];

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // remove the "data:mime/type;base64," prefix
            resolve(result.split(',')[1]);
        };
        reader.onerror = (error) => reject(error);
    });
};

const VideoGenerator: React.FC<VideoGeneratorProps> = ({ onKeyError }) => {
    const [prompt, setPrompt] = useState<string>("Generate a professional video ad for this cappuccino frappe. The style should be vertical, modern, and energetic, like a McDonald's or Starbucks commercial. Show dynamic shots of the drink, with coffee beans and ice splashing in slow motion.");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9'>('9:16');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setGeneratedVideoUrl(null);
            setError(null);
        }
    };

    const generateVideo = useCallback(async () => {
        if (!imageFile || !prompt) {
            setError("Please upload an image and provide a prompt.");
            return;
        }

        setIsLoading(true);
        setGeneratedVideoUrl(null);
        setError(null);

        let messageInterval: NodeJS.Timeout;
        try {
            let messageIndex = 0;
            setLoadingMessage(loadingMessages[messageIndex]);
            messageInterval = setInterval(() => {
                messageIndex = (messageIndex + 1) % loadingMessages.length;
                setLoadingMessage(loadingMessages[messageIndex]);
            }, 5000);

            const base64Image = await fileToBase64(imageFile);
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            let operation = await ai.models.generateVideos({
                model: 'veo-3.1-fast-generate-preview',
                prompt,
                image: {
                    imageBytes: base64Image,
                    mimeType: imageFile.type,
                },
                config: {
                    numberOfVideos: 1,
                    resolution: '720p',
                    aspectRatio: aspectRatio,
                }
            });

            while (!operation.done) {
                await new Promise(resolve => setTimeout(resolve, 10000));
                operation = await ai.operations.getVideosOperation({ operation: operation });
            }
            
            const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
            if (downloadLink) {
                 const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
                 const videoBlob = await videoResponse.blob();
                 const videoUrl = URL.createObjectURL(videoBlob);
                 setGeneratedVideoUrl(videoUrl);
            } else {
                throw new Error("Video generation completed, but no download link was found.");
            }

        } catch (err: any) {
            console.error(err);
            const errorMessage = err.message || "An unknown error occurred.";
            setError(errorMessage);
            if (errorMessage.includes("Requested entity was not found")) {
                setError("API Key validation failed. Please select a valid API key and try again.");
                onKeyError();
            }
        } finally {
            setIsLoading(false);
            clearInterval(messageInterval);
        }
    }, [imageFile, prompt, aspectRatio, onKeyError]);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Left Column: Controls */}
                <div className="space-y-6 bg-gray-800 p-6 rounded-lg shadow-lg">
                    <div>
                        <label htmlFor="image-upload" className="block text-sm font-medium text-gray-300 mb-2">1. Upload Product Image</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="mx-auto h-40 w-auto object-contain rounded-md" />
                                ) : (
                                    <>
                                        <UploadIcon className="mx-auto h-12 w-12 text-gray-500" />
                                        <div className="flex text-sm text-gray-400">
                                            <label htmlFor="file-upload" className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-indigo-400 hover:text-indigo-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-800 focus-within:ring-indigo-500">
                                                <span>Upload a file</span>
                                                <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                                            </label>
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                    </>
                                )}
                            </div>
                        </div>
                         {imagePreview && (
                            <button onClick={() => {setImageFile(null); setImagePreview(null);}} className="mt-2 text-sm text-red-400 hover:text-red-300">
                                Remove Image
                            </button>
                        )}
                    </div>
                    <div>
                        <label htmlFor="prompt" className="block text-sm font-medium text-gray-300">2. Describe your ad</label>
                        <textarea
                            id="prompt"
                            rows={4}
                            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white p-2"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                        />
                    </div>
                     <div>
                        <h3 className="text-sm font-medium text-gray-300">3. Select Aspect Ratio</h3>
                        <div className="mt-2 flex space-x-4">
                            <button onClick={() => setAspectRatio('9:16')} className={`px-4 py-2 rounded-md text-sm font-medium ${aspectRatio === '9:16' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                                9:16 (Portrait)
                            </button>
                             <button onClick={() => setAspectRatio('16:9')} className={`px-4 py-2 rounded-md text-sm font-medium ${aspectRatio === '16:9' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                                16:9 (Landscape)
                            </button>
                        </div>
                    </div>
                     <button
                        onClick={generateVideo}
                        disabled={!imageFile || isLoading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? 'Generating...' : 'Generate Video'}
                    </button>
                </div>

                {/* Right Column: Output */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg min-h-[30rem] flex items-center justify-center">
                    {isLoading && (
                        <div className="text-center">
                            <LoadingSpinner />
                            <p className="mt-4 text-lg font-medium text-gray-300">Creating your video...</p>
                             <p className="mt-2 text-sm text-gray-400">{loadingMessage}</p>
                        </div>
                    )}
                    {error && <p className="text-red-400 text-center">{error}</p>}
                    {generatedVideoUrl && (
                        <div className="w-full">
                            <h3 className="text-lg font-semibold mb-4 text-center">Your Video Ad is Ready!</h3>
                            <video
                                src={generatedVideoUrl}
                                controls
                                autoPlay
                                loop
                                className="w-full rounded-lg shadow-xl"
                                style={{ aspectRatio: aspectRatio.replace(':', ' / ') }}
                            />
                             <a href={generatedVideoUrl} download="generated-video.mp4" className="mt-4 w-full inline-block text-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700">
                                Download Video
                            </a>
                        </div>
                    )}
                    {!isLoading && !error && !generatedVideoUrl && (
                         <div className="text-center text-gray-500">
                            <VideoIcon className="mx-auto h-24 w-24" />
                            <p className="mt-4">Your generated video will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VideoGenerator;