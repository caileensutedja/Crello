import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function BoardsPage() {
    // State for boards list
    const [boards, setBoards] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for create board form
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    // State for editing board
    const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');

    // Get auth data
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();

    // Fetch boards on component load - states
    useEffect(() => {
        fetchBoards();
    }, []); // empty dependency array to run the effect once when the component loads

    // Function to fetch boards
    const fetchBoards = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/boards`, { headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to fetch boards');

        const data = await response.json();
        setBoards(data);
        setError(null);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle create board
    const handleCreateBoard = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/boards`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title, description, type: 'personal' })
        });

        if (!response.ok) throw new Error('Failed to create board');

        // Clear form and refresh boards
        setTitle('');
        setDescription('');
        setShowCreateForm(false);
        await fetchBoards(); // reload
        } catch (err) {
            setError((err as Error).message);
        }
    };

    // Handle delete board
    const handleDeleteBoard = async (boardId: string) => {
    if (!confirm('Are you sure?')) return;

    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/boards/${boardId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
        });
        
        if (!response.ok) throw new Error('Failed to delete board');
        
        // Refresh boards list
        await fetchBoards();
    } catch (err) {
        setError((err as Error).message);
    }
    };

    // Handle edit board
    const handleEditBoard = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!editingBoardId) return;
        
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/boards/${editingBoardId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title: editTitle, description: editDescription })
            });
            
            if (!response.ok) throw new Error('Failed to update board');
            
            // Clear edit state and refresh
            setEditingBoardId(null);
            setEditTitle('');
            setEditDescription('');
            await fetchBoards();
        } catch (err) {
            setError((err as Error).message);
        }
    };

    const startEditing = (board: any) => {
        setEditingBoardId(board._id);
        setEditTitle(board.title);
        setEditDescription(board.description);
    };

    const cancelEditing = () => {
        setEditingBoardId(null);
        setEditTitle('');
        setEditDescription('');
    };

    // Handle log out
    const handleLogout = () => {
        logout();
        navigate('/login');
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
                <div>
                <h1 className="text-3xl font-bold text-gray-900">My Boards</h1>
                <p className="text-gray-600">Welcome, {user?.name}!</p>
                </div>
                <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                >
                Logout
                </button>
            </div>
            </div>

            {/* Main content */}
            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            {/* Create Board Button */}
            <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="mb-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
                {showCreateForm ? 'Cancel' : 'Create Board'}
            </button>

            {/* Create Board Form */}
            {showCreateForm && (
                <form onSubmit={handleCreateBoard} className="mb-6 bg-white p-6 rounded shadow">
                <input
                    type="text"
                    placeholder="Board title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded mb-3"
                />
                <textarea
                    placeholder="Description (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border rounded mb-3"
                />
                <button
                    type="submit"
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                >
                    Create
                </button>
                </form>
            )}

            {/* Error message */}
            {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
                {error}
                </div>
            )}

            {/* Loading state */}
            {isLoading ? (
                <div className="text-center text-gray-500">Loading boards...</div>
            ) : boards.length === 0 ? (
                <div className="text-center text-gray-500">No boards yet. Create one!</div>
            ) : (
                /* Boards grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {boards.map((board) => (
                    <div key={board._id} className="bg-white p-6 rounded shadow hover:shadow-lg transition">
                        {editingBoardId === board._id ? (
                        // Edit mode
                        <form onSubmit={handleEditBoard}>
                            <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            required
                            className="w-full px-3 py-2 border rounded mb-2"
                            />
                            <textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="w-full px-3 py-2 border rounded mb-2"
                            />
                            <button type="submit" className="px-3 py-1 bg-blue-500 text-white text-sm rounded mr-2">
                            Save
                            </button>
                            <button
                            type="button"
                            onClick={cancelEditing}
                            className="px-3 py-1 bg-gray-500 text-white text-sm rounded"
                            >
                            Cancel
                            </button>
                        </form>
                        ) : (
                        // View mode
                        <>
                            <h3 className="text-lg font-bold text-gray-900">{board.title}</h3>
                            <p className="text-gray-600 mb-4">{board.description}</p>
                            <p className="text-sm text-gray-500 mb-4">Type: {board.type}</p>
                            <button
                            onClick={() => startEditing(board)}
                            className="px-3 py-1 bg-blue-500 text-white text-sm rounded mr-2 hover:bg-blue-600"
                            >
                            Edit
                            </button>
                            <button
                            onClick={() => handleDeleteBoard(board._id)}
                            className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                            >
                            Delete
                            </button>
                        </>
                        )}
                    </div>
                    ))}
                </div>
            )}
            </div>
        </div>
        );
    }