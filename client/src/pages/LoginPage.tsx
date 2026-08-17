import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
    // STATES
    // State for form inputs
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // State for error messages
    const [error, setError] = useState('');

    // State to show "Loging in..." while waiting
    const [isLoading, setIsLoading] = useState(false);

    // Get the signup function from AuthContext
    const { login } = useAuth();

    // useNavigate to redirect after successful login
    const navigate = useNavigate();


    // handleSubmit function
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // prevents refreshing the page
        setError(''); // clears previous errors
        setIsLoading(true); // disable clicking the signup button

        try {
        await login(email, password);
        navigate('/boards');
        } catch (err) {
        setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
        setIsLoading(false); // re-enables clicking the signup button
        }
    };

  // Return the JSX/form
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
            <h1 className="text-2xl font-bold mb-6 text-center">Log In</h1>
            
            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded"
                />
                
                <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded"
                />
                
                <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                {isLoading ? 'Logging in...' : 'Log In'}
                </button>
            </form>
            
            <p className="text-center mt-4">
                Don't have an account? <Link to="/signup" className="text-blue-600">Sign Up</Link>
            </p>
            </div>
        </div>
  );
}
