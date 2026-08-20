import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function BoardDetailedPage() {
    const { boardId } = useParams();
    const { token } = useAuth();
    const navigate = useNavigate();

    // State for the lists and the cards
    const [lists, setLists] = useState([]);
    const [cards, setCards] = useState<{[key: string]: any}>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
    }

    // TODO: Render
    // - Show board title (get from props or state)
    // - Map over lists
    // - For each list, show its cards
    // - Loading/error states

    return (
        <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">Board Detail</h1>

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
        </div>
    );
}