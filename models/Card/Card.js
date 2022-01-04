const mongoose = require('mongoose')

const cardSchema = new mongoose.Schema({
    question: String,
    answer: {
        type: String,
        required: true
    },
    tags: {
        type: Array
    },
    createdAt: {
        type: Date,
        default: () => Date.now()
    }
})

module.exports = mongoose.model("Card", cardSchema)