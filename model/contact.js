const mongoose = require("mongoose");

// Mendefinisikan schema untuk model Contact
const contactSchema = new mongoose.Schema({
    nama: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'Format email tidak valid'],
        unique: true,
    },
    nohp: {
        type: String,
        required: true,
        trim: true,
        match: [/^\d{10,15}$/, 'Nomor HP harus terdiri dari 10-15 digit'],
    },
}, { timestamps: true }); // Menambahkan kolom 'createdAt' dan 'updatedAt'

// Membuat model Contact berdasarkan schema
const Contact = mongoose.model("Contact", contactSchema);

module.exports = Contact;
