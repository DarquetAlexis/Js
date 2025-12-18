
import React from 'react';

interface TabButtonProps {
    isActive: boolean;
    onClick: () => void;
    children: React.ReactNode;
    icon: React.ReactNode;
}

const TabButton: React.FC<TabButtonProps> = ({ isActive, onClick, children, icon }) => {
    const baseClasses = "flex items-center space-x-2 text-sm font-medium py-3 px-6 -mb-px border-b-2 transition-colors duration-200 ease-in-out focus:outline-none";
    const activeClasses = "border-indigo-500 text-indigo-400";
    const inactiveClasses = "border-transparent text-gray-400 hover:text-white hover:border-gray-500";
    
    return (
        <button onClick={onClick} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
            {icon}
            <span>{children}</span>
        </button>
    );
};

export default TabButton;
