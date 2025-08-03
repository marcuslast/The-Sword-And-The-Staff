import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';

// Types
export interface User {
    id: string;
    username: string;
    email: string;
    displayName: string;
    avatar?: string;
    isOnline: boolean;
    lastSeen: Date;
    gameStats: {
        gamesPlayed: number;
        gamesWon: number;
        totalBattlesWon: number;
        totalGoldCollected: number;
    };
    friends?: string[];
}

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;
}

type AuthAction =
    | { type: 'AUTH_START' }
    | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
    | { type: 'AUTH_FAIL'; payload: string }
    | { type: 'AUTH_LOGOUT' }
    | { type: 'UPDATE_USER'; payload: User }
    | { type: 'CLEAR_ERROR' };

interface AuthContextType extends AuthState {
    login: (username: string, password: string) => Promise<void>;
    register: (userData: RegisterData) => Promise<void>;
    logout: () => void;
    updateProfile: (profileData: Partial<User>) => Promise<void>;
    clearError: () => void;
}

interface RegisterData {
    username: string;
    email: string;
    password: string;
    displayName: string;
}

// Initial state
const initialState: AuthState = {
    user: null,
    token: localStorage.getItem('token'),
    isLoading: false,
    isAuthenticated: false,
    error: null,
};

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case 'AUTH_START':
            return {
                ...state,
                isLoading: true,
                error: null,
            };

        case 'AUTH_SUCCESS':
            return {
                ...state,
                isLoading: false,
                isAuthenticated: true,
                user: action.payload.user,
                token: action.payload.token,
                error: null,
            };

        case 'AUTH_FAIL':
            return {
                ...state,
                isLoading: false,
                isAuthenticated: false,
                user: null,
                token: null,
                error: action.payload,
            };

        case 'AUTH_LOGOUT':
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
                error: null,
            };

        case 'UPDATE_USER':
            return {
                ...state,
                user: action.payload,
            };

        case 'CLEAR_ERROR':
            return {
                ...state,
                error: null,
            };

        default:
            return state;
    }
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Auth Provider
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // API helper function
    const apiCall = useCallback(async (
        endpoint: string,
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
        body?: any
    ) => {
        const config: RequestInit = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (state.token) {
            config.headers = {
                ...config.headers,
                Authorization: `Bearer ${state.token}`,
            };
        }

        if (body) {
            config.body = JSON.stringify(body);
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }

        return data;
    }, [state.token]);

    // Login function
    const login = useCallback(async (username: string, password: string): Promise<void> => {
        try {
            dispatch({ type: 'AUTH_START' });

            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Store token in localStorage
            localStorage.setItem('token', data.token);

            dispatch({
                type: 'AUTH_SUCCESS',
                payload: {
                    user: data.user,
                    token: data.token,
                },
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Login failed';
            dispatch({ type: 'AUTH_FAIL', payload: message });
            localStorage.removeItem('token');
            throw error;
        }
    }, []);

    // Register function
    const register = useCallback(async (userData: RegisterData): Promise<void> => {
        try {
            dispatch({ type: 'AUTH_START' });

            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            // Store token in localStorage
            localStorage.setItem('token', data.token);

            dispatch({
                type: 'AUTH_SUCCESS',
                payload: {
                    user: data.user,
                    token: data.token,
                },
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Registration failed';
            dispatch({ type: 'AUTH_FAIL', payload: message });
            localStorage.removeItem('token');
            throw error;
        }
    }, []);

    // Logout function
    const logout = useCallback(async (): Promise<void> => {
        try {
            // Call logout endpoint if user is authenticated
            if (state.token) {
                await apiCall('/auth/logout', 'POST');
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Always clear local state and storage
            localStorage.removeItem('token');
            dispatch({ type: 'AUTH_LOGOUT' });
        }
    }, [state.token]);

    // Update profile function
    const updateProfile = useCallback(async (profileData: Partial<User>): Promise<void> => {
        try {
            const data = await apiCall('/auth/profile', 'PUT', profileData);

            dispatch({
                type: 'UPDATE_USER',
                payload: data.user,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Profile update failed';
            dispatch({ type: 'AUTH_FAIL', payload: message });
            throw error;
        }
    }, []);

    // Clear error function
    const clearError = useCallback((): void => {
        dispatch({ type: 'CLEAR_ERROR' });
    }, []);

    // Check if user is logged in on app start
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    dispatch({ type: 'AUTH_START' });
                    const data = await apiCall('/auth/me');

                    dispatch({
                        type: 'AUTH_SUCCESS',
                        payload: {
                            user: data.user,
                            token,
                        },
                    });
                } catch (error) {
                    console.error('Auth check failed:', error);
                    localStorage.removeItem('token');
                    dispatch({ type: 'AUTH_LOGOUT' });
                }
            }
        };

        checkAuth();
    }, []);

    const value: AuthContextType = {
        ...state,
        login,
        register,
        logout,
        updateProfile,
        clearError,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
