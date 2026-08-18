const express = require('express');
const Board = require('../models/Board');
const BoardMember = require('../models/BoardMember');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router()

// POST /api/boards - Create new board
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { title, description, type } = req.body;
        const userId = req.user.userId;

        // Validate Input
        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        // Create the board with ownerId from the verified token
        const board = await Board.create({
            title,
            description: description || '',
            ownerId: userId,
            type: type || 'personal'
        });

        // Create a BoardMember entry and make the user the owner
        await BoardMember.create({
            boardId: board._id,
            userId,
            role: 'owner'
        })

        res.status(201).json(board);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong'});
    }
});

// GET /api/boards - Get boards of the logged in user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;

        // Find all BoardMembers for this user
        const boardMembers = await BoardMember.find({ userId }).populate('boardId');

        // Extract just the board data
        const boards = boardMembers.map(member => member.boardId);

        res.json(boards);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

// PUT /api/boards/:id - Update a board (owner only)
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { title, description } = req.body;
        const boardId = req.params.id;
        const userId = req.user.userId;

        // Check if the user is the owner
        const membership = await BoardMember.findOne({ boardId, userId });
        if (!membership || membership.role !== 'owner') {
            return res.status(403).json({ error: 'Only board owner can update' });
        }

        // Update the board
        const board = await Board.findByIdAndUpdate(
            boardId,
            { title, description },
            { new: true } // Return the updated document
        );

        res.json(board);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

// DELETE /api/boards/:id - Delete a board (owner only)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const boardId = req.params.id;
        const userId = req.user.userId;

        // Check if the user is the owner
        const membership = await BoardMember.findOne({ boardId, userId });
        if (!membership || membership.role !== 'owner') {
            return res.status(403).json({ error: 'Only board owner can delete' });
        }
        
        // Delete the board
        await Board.findByIdAndDelete(boardId);

        // Delete all BoardMember entries for this board
        await BoardMember.deleteMany({ boardId });

        res.json({ message: 'Board deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

module.exports = router;