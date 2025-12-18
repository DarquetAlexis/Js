
import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import LoadingSpinner from './LoadingSpinner';
import { ImageIcon } from './icons';

interface ImageGeneratorProps {
     onKeyError: () => void;
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ onKeyError }) => {
    const [prompt, setPrompt] = useState<string>("A professional, photorealistic shot of a cappuccino frappe with whipped cream and chocolate drizzle, in the style of a high-end cafe advertisement.");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const generateImage = useCallback(async () => {
        if (!prompt) {
            setError("Please provide a prompt.");
            return;
        }

        setIsLoading(true);
        setGeneratedImageUrl(null);
        setError(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: prompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/png',
                    aspectRatio: '1:1',
                },
            });

            if (response.generatedImages && response.generatedImages.length > 0) {
                const base64ImageBytes = response.generatedImages[0].image.imageBytes;
                const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
                setGeneratedImageUrl(imageUrl);
            } else {
                throw new Error("Image generation failed to produce an image.");
            }

        } catch (err: any) {
            console.error(err);
            const errorMessage = err.message || "An unknown error occurred.";
            setError(errorMessage);
             if (errorMessage.includes("API key not valid")) {
                setError("API Key validation failed. Please select a valid API key and try again.");
                onKeyError();
            }
        } finally {
            setIsLoading(false);
        }
    }, [prompt, onKeyError]);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Left Column: Controls */}
                <div className="space-y-6 bg-gray-800 p-6 rounded-lg shadow-lg">
                    <div>
                        <label htmlFor="image-prompt" className="block text-sm font-medium text-gray-300">1. Describe the image you want</label>
                        <textarea
                            id="image-prompt"
                            rows={4}
                            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white p-2"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                        />
                    </div>
                     <button
                        onClick={generateImage}
                        disabled={isLoading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? 'Generating...' : 'Generate Image'}
                    </button>
                </div>

                {/* Right Column: Output */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg min-h-[30rem] flex items-center justify-center">
                    {isLoading && (
                        <div className="text-center">
                            <LoadingSpinner />
                            <p className="mt-4 text-lg font-medium text-gray-300">Creating your image...</p>
                        </div>
                    )}
                    {error && <p className="text-red-400 text-center">{error}</p>}
                    {generatedImageUrl && (
                        <div className="w-full">
                             <h3 className="text-lg font-semibold mb-4 text-center">Your Image is Ready!</h3>
                            <img src={generatedImageUrl} alt="Generated" className="w-full rounded-lg shadow-xl" />
                             <a href={generatedImageUrl} download="generated-image.png" className="mt-4 w-full inline-block text-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700">
                                Download Image
                            </a>
                        </div>
                    )}
                    {!isLoading && !error && !generatedImageUrl && (
                        <div className="text-center text-gray-500">
                            <ImageIcon className="mx-auto h-24 w-24" />
                            <p className="mt-4">Your generated image will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImageGenerator;
