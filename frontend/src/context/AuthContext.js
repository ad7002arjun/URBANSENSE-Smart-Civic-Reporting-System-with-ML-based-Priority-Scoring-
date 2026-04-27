import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load user from localStorage on mount
    useEffect(() => {
        const savedToken = localStorage.getItem('urbansense_token');
        const savedUser = localStorage.getItem('urbansense_user');

        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await authAPI.login({ email, password });
            const { data } = response.data;

            setUser(data);
            setToken(data.token);
            localStorage.setItem('urbansense_token', data.token);
            localStorage.setItem('urbansense_user', JSON.stringify(data));

            return { success: true, data };
        } catch (error) {
            const message =
                error.response?.data?.message || 'Login failed';
            return { success: false, message };
        }
    };

    const register = async (userData) => {
        try {
            const response = await authAPI.register(userData);
            const { data } = response.data;

            setUser(data);
            setToken(data.token);
            localStorage.setItem('urbansense_token', data.token);
            localStorage.setItem('urbansense_user', JSON.stringify(data));

            return { success: true, data };
        } catch (error) {
            const message =
                error.response?.data?.message || 'Registration failed';
            return { success: false, message };
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('urbansense_token');
        localStorage.removeItem('urbansense_user');
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!token,
        isAuthority: user?.role === 'authority' || user?.role === 'admin',
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export default AuthContext;