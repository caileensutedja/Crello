const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId, // reference user's id
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['personal', 'team'],
        default: 'personal'
    },
    createdAt: {
        type: Date,
        default: Date.now // set to current time
    }
}, { timestamps: true }); // adds createdAt and updatedAt automatically

module.exports = mongoose.model('Board', boardSchema)