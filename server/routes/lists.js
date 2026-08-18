const express = require('express');
const Board = require('../models/Board');
const BoardMember = require('../models/BoardMember');
const List = require('../models/List');
const Card = require('../models/Card');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router()

// POST /api/boards/:boardId/lists - Create new list
router.post('/:boardId/lists', authMiddleware, async (req, res) => {
    try {
        const boardId = req.params.boardId
        const { title } = req.body;
        const userId = req.user.userId;

        // Validate Input
        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        // Check if the user owns the board
        const owner = await BoardMember.findOne({ boardId, userId });
        if (!owner || owner.role !== 'owner') {
            return res.status(403).json({ error: 'Only board owner can create a list' });
        }

        // Create the list
        const newList = await List.create({
            boardId,
            title,
            position: 0
        })

        res.status(201).json(newList);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong'});
    }
});

// GET /api/boards/:boardId/lists - Get the list
router.get('/:boardId/lists', authMiddleware, async (req, res) => {
    try {
        const boardId = req.params.boardId
        const userId = req.user.userId;

        // Check if the user owns the board
        const owner = await BoardMember.findOne({ boardId, userId });
        if (!owner || owner.role !== 'owner') {
            return res.status(403).json({ error: 'Only board owner can view the list' });
        }

        // Find all listMembers for this user
        const lists = await List.find({ boardId }).sort({ position: 1 })

        res.json(lists);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

// PUT /api/boards/:boardId/lists/:listId - Update the list
router.put('/:boardId/lists/:listId', authMiddleware, async (req, res) => {
    try {
        const { boardId, listId } = req.params
        const userId = req.user.userId;
        const { title, position } = req.body;

        // Check if the user owns the board
        const owner = await BoardMember.findOne({ boardId, userId });
        if (!owner || owner.role !== 'owner') {
            return res.status(403).json({ error: 'Only board owner can view the list' });
        }

        // Update the board
        const updatedList = await List.findByIdAndUpdate(
            listId,
            { title, position },
            { new: true } // Return the updated document
        );

        res.json(updatedList);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

// DELETE /api/boards/:boardId/lists/:listId - Delete the list
router.delete('/:boardId/lists/:listId', authMiddleware, async (req, res) => {
    try {
        const { boardId, listId } = req.params;
        const userId = req.user.userId;

        // Check if the user owns the board
        const owner = await BoardMember.findOne({ boardId, userId });
        if (!owner || owner.role !== 'owner') {
            return res.status(403).json({ error: 'Only board owner can view the list' });
        }

        // Delete all cards in the list
        await Card.deleteMany({ listId });

        // Delete the list
        await List.findByIdAndDelete(listId);

        res.json({ message: 'List deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

module.exports = router;