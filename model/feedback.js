const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    profile: { type: String, required: true },
    nama: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    date: { type: Date, default: Date.now },
});

const Feedback = mongoose.model('Feedback', feedbackSchema);
module.exports = Feedback;