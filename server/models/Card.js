const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
   listId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'List',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    position: {
        type: Number,
        default: 0 // used for ordering lists top to bottom
    }
}, { timestamps: true });

module.exports = mongoose.model('Card', cardSchema);