import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, User, Mail, Lock, Gamepad2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultTab?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
                                                        isOpen,
                                                        onClose,
                                                        defaultTab = 'login'
                                                    }) => {
    const { login, register, isLoading, error, clearError } = useAuth();
    const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        displayName: '',
    });

    // Reset form when modal opens/closes or tab changes
    useEffect(() => {
        if (isOpen) {
            setFormData({
                username: '',
                email: '',
                password: '',
                displayName: '',
            });
            setShowPassword(false);
        }
    }, [isOpen, activeTab]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log('Input change:', e.target.name, e.target.value); // Debug log
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form submitted:', formData); // Debug log

        try {
            if (activeTab === 'login') {
                await login(formData.username, formData.password);
            } else {
                await register({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    displayName: formData.displayName,
                });
            }
            onClose();
        } catch (error) {
            console.error('Auth error:', error);
        }
    };

    const handleTabChange = (tab: 'login' | 'register') => {
        setActiveTab(tab);
        setFormData({
            username: '',
            email: '',
            password: '',
            displayName: '',
        });
        clearError(); // Call clearError here instead of in useEffect
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                            <Gamepad2 size={24} className="text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {activeTab === 'login' ? 'Welcome Back!' : 'Join the Adventure!'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        type="button"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="flex p-1 m-6 bg-gray-100 rounded-xl">
                    <button
                        type="button"
                        onClick={() => handleTabChange('login')}
                        className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                            activeTab === 'login'
                                ? 'bg-white text-purple-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Login
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTabChange('register')}
                        className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                            activeTab === 'register'
                                ? 'bg-white text-purple-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Register
                    </button>
                </div>

                {/* Form */}
                <div className="px-6 pb-6">
                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <div className="text-sm text-red-800">
                                {error}
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Username Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Username
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Enter your username"
                                required
                                minLength={3}
                                maxLength={20}
                                disabled={isLoading}
                                autoComplete="username"
                            />
                        </div>

                        {/* Email Field (Register only) */}
                        {activeTab === 'register' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Enter your email"
                                    required
                                    disabled={isLoading}
                                    autoComplete="email"
                                />
                            </div>
                        )}

                        {/* Display Name Field (Register only) */}
                        {activeTab === 'register' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Display Name
                                </label>
                                <input
                                    type="text"
                                    name="displayName"
                                    value={formData.displayName}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Enter your display name"
                                    required
                                    maxLength={50}
                                    disabled={isLoading}
                                    autoComplete="name"
                                />
                            </div>
                        )}

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Enter your password"
                                    required
                                    minLength={6}
                                    disabled={isLoading}
                                    autoComplete={activeTab === 'login' ? 'current-password' : 'new-password'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    disabled={isLoading}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {activeTab === 'register' && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Password must be at least 6 characters long
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>{activeTab === 'login' ? 'Logging in...' : 'Creating account...'}</span>
                                </div>
                            ) : (
                                activeTab === 'login' ? 'Login' : 'Create Account'
                            )}
                        </button>

                        {/* Switch Tab Link */}
                        <div className="text-center pt-4">
                            <p className="text-gray-600">
                                {activeTab === 'login' ? "Don't have an account? " : 'Already have an account? '}
                                <button
                                    type="button"
                                    onClick={() => handleTabChange(activeTab === 'login' ? 'register' : 'login')}
                                    className="text-purple-600 hover:text-purple-700 font-medium"
                                    disabled={isLoading}
                                >
                                    {activeTab === 'login' ? 'Sign up' : 'Sign in'}
                                </button>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
