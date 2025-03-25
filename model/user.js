const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Membuat schema untuk User
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true, // username harus unik
        minlength: 3, // panjang minimal username
        maxlength: 20 // panjang maksimal username
    },
    email: {
        type: String,
        required: true,
        unique: true, // email harus unik
        match: [/\S+@\S+\.\S+/, 'Please use a valid email address'] // validasi email
    },
    password: {
        type: String,
        required: true,
        minlength: 6 // panjang minimal password
    }
});

// Pre-save hook untuk mengenkripsi password sebelum disimpan
userSchema.pre('save', async function (next) {
    // Jika password tidak diubah, lewati proses hashing
    if (!this.isModified('password')) {
        return next();
    }

    // Enkripsi password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method untuk memeriksa password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Membuat model User dari schema yang sudah dibuat
const User = mongoose.model('User', userSchema);

module.exports = User;
