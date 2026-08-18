const express = require('express');
const BoardMember = require('../models/BoardMember');
const Card = require('../models/Card');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/boards/:boardId/lists/:listId/cards - Create a new card
router.post('/:boardId/lists/:listId/cards', authMiddleware, async (req, res) => {
  try {
    const { boardId, listId } = req.params;
    const { title, description } = req.body;
    const userId = req.user.userId;

    // Validate title
    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    // Check permission (BoardMember)
    const member = await BoardMember.findOne({ boardId, userId });
    if (!member || member.role !== 'owner') {
        return res.status(403).json({ error: 'Only board owner can create a card' });
    }

    // Create the card
    const newCard = await Card.create({
        listId,
        title,
        description,
        position: 0
    })

    res.status(201).json(newCard);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// GET /api/boards/:boardId/lists/:listId/cards - Get all cards in a list
router.get('/:boardId/lists/:listId/cards', authMiddleware, async (req, res) => {
    try {
        const { boardId, listId } = req.params;
        const userId = req.user.userId;

        // Check permission (BoardMember)
        const member = await BoardMember.findOne({ boardId, userId });
        if (!member || member.role !== 'owner') {
            return res.status(403).json({ error: 'Only board owner can view cards' });
        }
        
        // Query all cards for this list, sorted by position
        const cards = await Card.find({ listId }).sort({ position: 1 })
        
        res.json(cards)
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

// PUT /api/boards/:boardId/lists/:listId/cards/:cardId - Update a card
router.put('/:boardId/lists/:listId/cards/:cardId', authMiddleware, async (req, res) => {
    try {
        const { boardId, cardId } = req.params;
        const userId = req.user.userId;
        const { title, description, position } = req.body;

        // Check permission (BoardMember)
        const member = await BoardMember.findOne({ boardId, userId });
        if (!member || member.role !== 'owner') {
            return res.status(403).json({ error: 'Only board owner can edit cards' });
        }
        
        // Update the card
        const updatedCard = await Card.findByIdAndUpdate(
            cardId,
            { title, description, position },
            { new: true } // Return the updated document
        );

        res.json(updatedCard)
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

// DELETE /api/boards/:boardId/lists/:listId/cards/:cardId - Delete a card
router.delete('/:boardId/lists/:listId/cards/:cardId', authMiddleware, async (req, res) => {
    try {
        const { boardId, cardId } = req.params;
        const userId = req.user.userId;

        // Check permission (BoardMember)
        const member = await BoardMember.findOne({ boardId, userId });
        if (!member || member.role !== 'owner') {
            return res.status(403).json({ error: 'Only board owner can delete cards' });
        }
        
        // Delete the card
        await Card.findByIdAndDelete(cardId);
        
        res.json({ message: 'Card deleted'})
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

module.exports = router;