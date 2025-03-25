const express = require('express');
const { body, validationResult } = require('express-validator');
const Feedback = require('../models/feedback');
const router = express.Router();

// Halaman daftar feedback
router.get('/', async (req, res) => {
    try {
        const feedbacks = await Feedback.find();
        res.render('feedbackList', { feedbacks, title: 'Daftar Feedback' });
    } catch (error) {
        console.error(error);
        res.redirect('/');
    }
});

// Form tambah feedback
router.get('/new', (req, res) => {
    res.render('feedbackForm', { title: 'Tambah Feedback' });
});

// POST untuk menambahkan feedback baru
router.post('/new', [
    body('name').notEmpty().withMessage('Nama harus diisi'),
    body('email').isEmail().withMessage('Email tidak valid'),
    body('message').notEmpty().withMessage('Pesan harus diisi'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating harus antara 1 dan 5'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('feedbackForm', { title: 'Tambah Feedback', errors: errors.array() });
    }

    const { name, email, message, rating } = req.body;
    await Feedback.create({ name, email, message, rating });
    res.redirect('/feedback');
});

// Detail feedback
router.get('/:name', async (req, res) => {
    try {
        const feedback = await Feedback.findOne({ name: req.params.name });
        if (!feedback) return res.redirect('/feedback');
        res.render('feedbackDetail', { feedback, title: 'Detail Feedback' });
    } catch (error) {
        console.error(error);
        res.redirect('/feedback');
    }
});

// Edit feedback
router.get('/:name/edit', async (req, res) => {
    try {
        const feedback = await Feedback.findOne({ name: req.params.name });
        if (!feedback) return res.redirect('/feedback');
        res.render('feedbackEdit', { feedback, title: 'Edit Feedback' });
    } catch (error) {
        console.error(error);
        res.redirect('/feedback');
    }
});

// POST untuk menyimpan perubahan feedback
router.post('/:name/edit', async (req, res) => {
    const { name, email, message, rating } = req.body;
    await Feedback.updateOne({ name: req.params.name }, { name, email, message, rating });
    res.redirect('/feedback');
});

// DELETE feedback
router.post('/:name/delete', async (req, res) => {
    await Feedback.deleteOne({ name: req.params.name });
    res.redirect('/feedback');
});

module.exports = router;