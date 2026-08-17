import React, {createContext, useContext, useState, useEffect } from 'react';

// User interface
interface User {
    id: string;
    name: string;
    email: string;
}

// AuthContext provision definition
interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    // functions to manage auth
    signup: (name: string, email: string, password: string) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

// Auth Context creation
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider Component
export function AuthProvider({children}: { children: React.ReactNode }) {
    // State variables
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // useEffect: to check if the token exists after app launch
    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        if (savedToken) {
            setToken(savedToken);
        }
        setIsLoading(false); // Finished checking
    }, []) // only runs when we first open the app

    // Signup function
    const signup = async (name: string, email: string, password: string) => {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
        });

        if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Signup failed');
        }

        const data = await response.json();
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('token', data.token);
    };

    // Login function
    const login = async (email: string, password: string) => {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
        }

        const data = await response.json();
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('token', data.token);
    };

    // Logout function
    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
    };
    
    // Wraps the app components and provides auth data
    return (
    <AuthContext.Provider value={{ user, token, isLoading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}