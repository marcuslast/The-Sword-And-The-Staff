import React, { useState } from 'react';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthModal } from './AuthModal';

export const AuthButton: React.FC = () => {
    const { user, isAuthenticated, logout, clearError } = useAuth();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleLogout = async () => {
        await logout();
        setShowUserMenu(false);
    };

    const handleOpenModal = () => {
        clearError(); // Clear any previous errors
        setShowAuthModal(true);
    };

    if (!isAuthenticated || !user) {
        return (
            <>
                <button
                    onClick={handleOpenModal}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 shadow-lg transform hover:scale-105"
                >
                    Login / Register
                </button>

                <AuthModal
                    isOpen={showAuthModal}
                    onClose={() => setShowAuthModal(false)}
                />
            </>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 bg-white bg-opacity-20 backdrop-blur-lg rounded-lg px-3 py-2 hover:bg-opacity-30 transition-all duration-200"
            >
                {user.avatar ? (
                    <img
                        src={user.avatar}
                        alt={user.displayName}
                        className="w-8 h-8 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                        <User size={16} className="text-white" />
                    </div>
                )}
                <div className="text-left">
                    <p className="text-white font-medium text-sm">{user.displayName}</p>
                    <p className="text-purple-200 text-xs">@{user.username}</p>
                </div>
            </button>

            {showUserMenu && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="py-2">
                        <div className="px-4 py-2 border-b border-gray-200">
                            <p className="font-medium text-gray-900">{user.displayName}</p>
                            <p className="text-sm text-gray-500">@{user.username}</p>
                        </div>

                        <div className="px-4 py-2">
                            <div className="text-xs text-gray-500 mb-1">Game Stats</div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="text-gray-600">Games:</span>
                                    <span className="font-medium ml-1">{user.gameStats.gamesPlayed}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Wins:</span>
                                    <span className="font-medium ml-1">{user.gameStats.gamesWon}</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center space-x-2"
                        >
                            <LogOut size={16} />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
