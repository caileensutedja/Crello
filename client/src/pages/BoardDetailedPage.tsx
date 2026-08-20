import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function BoardDetailedPage() {
    const { boardId } = useParams();
    const { token } = useAuth();
    const navigate = useNavigate();

    // State for the lists and the cards
    const [lists, setLists] = useState<{_id: string; title: string; position: number}[]>([]);    const [cards, setCards] = useState<{[key: string]: any}>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // List modal states
    const [isCreateListModalOpen, setIsCreateListModalOpen] = useState(false);
    const [newListTitle, setNewListTitle] = useState('');
    const [isCreatingList, setIsCreatingList] = useState(false);
    const [createListError, setCreateListError] = useState<string | null>(null);

    useEffect(() => { 
        fetchLists();
    }, [])

    // Fetch lists for this board on mount
    const fetchLists = async () => {
        try {
            setIsLoading(true);
            // GET /api/boards/:boardId/lists
            const response = await fetch(`${import.meta.env.VITE_API_URL}/boards/${boardId}/lists`, 
            { 
                method: 'GET',
                headers: {'Authorization': `Bearer ${token}`}
            }
        );

        if (!response.ok) throw new Error('Failed to fetch lists');

        const data = await response.json();
        setLists(data);
        setError(null);

        // Fetch cards for all lists in parallel
        await Promise.all(
            data.map((list: { _id: any; }) => fetchCardsForList(list._id))
        )
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch cards for each list
    const fetchCardsForList = async (listId: string) => {
        try {
            // GET /api/boards/:boardId/lists/:listId/cards
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/boards/${boardId}/lists/${listId}/cards`,
            {
                method: 'GET',
                headers: {'Authorization': `Bearer ${token}`}
            }
        );
            
        if (!response.ok) throw new Error('Failed to fetch cards');

        const data = await response.json();
        // Update cards state
        setCards(prev => ({...prev, [listId]: data}));
        } catch (err) {
            console.error('Error fetching cards:', err)
        }
    };

    const handleCreateList = async () => {
        // Step 1: Validate input
        // - Check if newListTitle is empty or too short
        if (!newListTitle.trim() || newListTitle.trim().length < 1) {
            setCreateListError('List title cannot be empty');
            return;
        }
        // - If invalid, setCreateListError with a message and return

        // Set loading state
        setIsCreatingList(true);
        setCreateListError(null);

        try {
            // Step 3: Make the POST request
            const response = await fetch(`${import.meta.env.VITE_API_URL}/boards/${boardId}/lists`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title: newListTitle})
            });
            
            if (!response.ok) throw new Error('Failed to create list');

            // Step 4: Get the created list from response
            const newList = await response.json();

            // Step 5: Add to state (optimistic update)
            setLists(prev => [...prev, newList]);

            // Step 6: Reset form and close modal
            setNewListTitle('');
            setIsCreateListModalOpen(false);
        } catch (err) {
            setCreateListError((err as Error).message);
        } finally {
            setIsCreatingList(false);
        }
    };

    // Render
    return (
        <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">Board Detail</h1>

        <button 
            onClick={() => setIsCreateListModalOpen(true)}
            className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
            + New List
        </button>
        {/* Loading states */}
        { isLoading && <p>Loading lists and cards...</p>}

        {/* Error states */}
        { error && <p className='text-red-500'>Error: {error}</p>}
        
        {/* Render lists and cards here */}
        { !isLoading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lists.map((list: any) => (
                    <div key={list._id} className='bg-gray-100 p-4 rounded'>
                    {/* List title */}
                    <h2 className="font-bold text-lg mb-4">{list.title}</h2>

                    {/* Cards in this list */}
                    <div className="space-y-2">
                        {/* Map each into individual cards */}
                        {cards[list._id]?.map((card: any) => (
                            <div key={card._id} className="bg-white p-2 rounded shadow">
                                {/* Card title */}
                                <h3>{card.title}</h3>
                                {/* Card description */}
                                {card.description && <p className="text-sm text-gray-600">{card.description}</p>}
                            </div>
                        ))}
                    </div>
                    </div>
                ))}
            </div>
        )}

        {/* modal */}
        {isCreateListModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white p-6 rounded shadow-lg w-96">
                    <h2 className="text-xl font-bold mb-4">Create New List</h2>
                    
                    {/* Form inputs */}
                    <input
                        type="text"
                        placeholder="List title"
                        value={newListTitle}
                        onChange={(e) => setNewListTitle(e.target.value)}
                        className="w-full px-3 py-2 border rounded mb-4"
                        disabled={isCreatingList}
                    />
                    
                    {/* Error message */}
                    {createListError && (
                        <p className="text-red-500 text-sm mb-4">{createListError}</p>
                    )}
                    
                    {/* Buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={handleCreateList}
                            disabled={isCreatingList}
                            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
                        >
                            {isCreatingList ? 'Creating...' : 'Create'}
                        </button>
                        <button
                            onClick={() => setIsCreateListModalOpen(false)}
                            disabled={isCreatingList}
                            className="flex-1 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:bg-gray-200"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        )}
        </div>
    );
}