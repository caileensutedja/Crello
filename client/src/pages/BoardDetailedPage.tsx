import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function BoardDetailPage() {
    const { boardId } = useParams();
    const { token } = useAuth();
    const navigate = useNavigate();

    // State for the lists and the cards
    const [lists, setLists] = useState([]);
    const [cards, setCards] = useState({}); // { listId: [cards] }
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
        {/* TODO: Render lists and cards here */}
        </div>
    );
}