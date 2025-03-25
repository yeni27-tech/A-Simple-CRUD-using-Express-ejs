// // mengimpor modul mongoose untuk mengelola MongoDB dengan lebih mudah di Node.js
// const mongoose = require('mongoose');

// // Menghubungkan aplikasi ke MongoDB dengan database bernama 'db_contact'
// // 'mongodb:/127.0.0.1:27017/db_contact' adalah URL lokal untuk MangoDB
// mongoose.connect('mongodb://localhost:27017/feedback');

const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/feedback', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Koneksi ke MongoDB berhasil'))
    .catch(err => console.error('Koneksi ke MongoDB gagal:', err));
