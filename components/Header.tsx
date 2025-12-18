
import React from 'react';
import { FilmIcon } from './icons';

const Header: React.FC = () => {
    return (
        <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
            <div className="container mx-auto px-4 py-4 flex items-center justify-center">
                <FilmIcon className="h-8 w-8 text-indigo-400 mr-3" />
                <h1 className="text-2xl font-bold text-white tracking-tight">AI Video Ad Generator</h1>
            </div>
        </header>
    );
};

export default Header;
