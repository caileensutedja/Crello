const express = require('express');
const Board = require('../models/Board');
const BoardMember = require('../models/BoardMember');
const List = require('../models/List');
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

module.exports = router;