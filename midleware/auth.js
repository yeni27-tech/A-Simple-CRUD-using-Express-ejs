// Middleware untuk memeriksa apakah pengguna sudah login
const isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        return next(); // Jika sudah login, lanjutkan ke route berikutnya
    } else {
        res.redirect('/login'); // Jika belum login, arahkan ke halaman login
    }
};

module.exports = isAuthenticated;
