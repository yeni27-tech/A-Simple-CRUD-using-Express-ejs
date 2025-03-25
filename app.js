const express = require("express");
const multer = require("multer");
const path = require("path");
const expresslayout = require("express-ejs-layouts");
const { body, validationResult, check } = require("express-validator");
require("./connection/db"); // Pastikan Anda sudah menghubungkan database
const Contact = require("./model/contact"); // Model untuk kontak
const Feedback = require("./model/feedback"); //db feedback
// const path = require("path");
// const fs = require("fs");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");

const app = express();
const port = 3040;



// Setup EJS
app.set("view engine", "ejs");
app.use(expresslayout);
app.use(express.static("public"));
app.use(express.static("layouts"));
app.use(express.static("image"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.urlencoded({ extended: true }));


//Time Zone
const moment = require('moment-timezone');

// Konfigurasi flash messages
app.use(cookieParser("secret"));
app.use(
    session({
        cookie: { maxAge: 60000 },
        secret: "secret",
        saveUninitialized: false,
    })
);
app.use(flash());


// Konfigurasi storage multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads"); // Folder tempat menyimpan file
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname); // Nama file unik
    },
});

// Middleware upload file
const upload = multer({ storage: storage });




// HALAMAN HOME
app.get("/", (req, res) => {
    res.render("index", {
        layout: "layouts/mainlayout", // Menggunakan layout utama
        nama: "yeni", // Mengirimkan variabel nama ke template
        title: "Halaman Home", // Mengirimkan variabel title ke template
    });
    console.log("Ini halaman Home");
});

// HALAMAN ABOUT
app.get("/about", (req, res) => {
    res.render("about", {
        nama: "khalila", // Mengirimkan variabel nama ke template
        layout: "layouts/mainlayout", // Menggunakan layout utama
        title: "Halaman About", // Mengirimkan variabel title ke template
    });
    console.log("Ini halaman About");
});

// HALAMAN KONTAK
app.get("/contact", async (req, res) => {
    const Contacts = await Contact.find(); // Mengambil semua kontak dari database
    res.render("contact", {
        title: "Daftar Contact", // Mengirimkan variabel title ke template
        layout: "layouts/mainlayout", // Menggunakan layout utama
        Contacts, // Data kontak yang dikirim ke ejs
    });
});

// CREATE: Menambahkan kontak baru
app.get("/add", (req, res) => {
    res.render("add", {
        title: "Tambah Contact", // Mengirimkan variabel title ke template
        layout: "layouts/mainlayout", // Menggunakan layout utama
    });
});

// POST untuk menambahkan kontak baru
app.post(
    "/add",
    [
        // Validasi data nama
        body("nama").custom(async (value) => {
            const duplicate = await Contact.findOne({ nama: value });
            if (duplicate) {
                throw new Error("Nama contact sudah ada"); // Menangani duplikasi nama
            }
            return true;
        }),
        // Validasi email
        check("email", "Email tidak valid").isEmail(),
        // Validasi nomor HP
        check("nohp", "Nomor HP harus terdiri dari 10-15 digit").isMobilePhone("id-ID"),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render("add", {
                title: "Tambah Contact", // Mengirimkan variabel title ke template
                layout: "layouts/mainlayout", // Menggunakan layout utama
                errors: errors.array(), // Mengirimkan daftar error validasi
                contact: req.body, // Mengirimkan data yang telah diinputkan
            });
        }

        // Simpan kontak baru ke database
        await Contact.create({
            nama: req.body.nama,
            email: req.body.email,
            nohp: req.body.nohp,
        });

        req.flash("msg", "Data kontak berhasil ditambahkan"); // Flash message
        res.redirect("/contact"); // Redirect ke halaman daftar kontak
    }
);

// UPDATE: Mengedit kontak berdasarkan nama
app.get("/contact/:nama/edit", async (req, res) => {
    const contact = await Contact.findOne({ nama: req.params.nama }); // Mencari berdasarkan nama
    if (!contact) {
        req.flash("msg", "Kontak tidak ditemukan");
        return res.redirect("/contact");
    }
    res.render("edit", {
        title: "Edit Contact", // Mengirimkan variabel title ke template
        layout: "layouts/mainlayout", // Menggunakan layout utama
        contact, // Mengirimkan data kontak yang ingin diedit
    });
});

// POST untuk menyimpan perubahan data kontak
app.post(
    "/contact/:nama/edit",
    [
        body("nama").custom(async (value, { req }) => {
            // Validasi jika nama sudah ada
            const duplicate = await Contact.findOne({ nama: value });
            if (duplicate && duplicate.nama !== req.params.nama) {
                throw new Error("Nama contact sudah ada");
            }
            return true;
        }),
        // Validasi email
        check("email", "Email tidak valid").isEmail(),
        // Validasi nomor HP
        check("nohp", "Nomor HP harus terdiri dari 10-15 digit").isMobilePhone("id-ID"),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render("edit", {
                title: "Edit Contact", // Mengirimkan variabel title ke template
                layout: "layouts/mainlayout", // Menggunakan layout utama
                errors: errors.array(), // Mengirimkan daftar error validasi
                contact: req.body, // Mengirimkan data kontak yang sedang diedit
            });
        }

        // Update kontak di database berdasarkan nama
        await Contact.updateOne(
            { nama: req.params.nama }, // Cari berdasarkan nama
            {
                $set: {
                    nama: req.body.nama,
                    email: req.body.email,
                    nohp: req.body.nohp,
                },
            }
        );

        req.flash("msg", "Data kontak berhasil diubah"); // Flash message
        res.redirect("/contact"); // Redirect ke halaman daftar kontak
    }
);

// DELETE: Menghapus kontak berdasarkan nama
app.get("/contact/:nama/delete", async (req, res) => {
    const contact = await Contact.findOne({ nama: req.params.nama }); // Mencari berdasarkan nama

    if (!contact) {
        req.flash("msg", "Kontak tidak ditemukan");
        return res.redirect("/contact");
    }

    await Contact.deleteOne({ nama: req.params.nama }); // Menghapus berdasarkan nama
    req.flash("msg", "Data kontak berhasil dihapus"); // Flash message
    res.redirect("/contact"); // Redirect ke halaman daftar kontak
});

// HALAMAN DETAIL KONTAK
app.get("/contact/:nama", async (req, res) => {
    const contact = await Contact.findOne({ nama: req.params.nama }); // Mencari berdasarkan nama
    if (!contact) {
        req.flash("msg", "Kontak tidak ditemukan"); // Jika kontak tidak ditemukan
        return res.redirect("/contact");
    }
    res.render("detail", {
        title: "Detail Contact", // Mengirimkan variabel title ke template
        layout: "layouts/mainlayout", // Menggunakan layout utama
        contact, // Mengirimkan data kontak untuk ditampilkan
    });
});


//BAPAKMUUUUU

// Halaman Feedback
app.get("/feedbacklist", async (req, res) => {
    const feedbacks = await Feedback.find();
    res.render("feedbackList", {
        title: "Halaman Feedback",
        layout: "layouts/mainlayout",
        feedbacks,
        msg: req.flash("msg"),
    });
});

// Halaman Tambah Feedback
// Halaman Tambah Feedback
app.get("/feedbackForm", (req, res) => {
    res.render("feedbackForm", {
        title: "Form Tambah Feedback",
        layout: "layouts/mainlayout",
        errors: [], // Tambahkan errors sebagai array kosong
        feedback: {}, // Tambahkan feedback sebagai objek kosong
    });
});

app.get("/feedbackForm", (req, res) => {
    res.render("feedbackForm", {
        layout: "layouts/mainlayout",
        title: "Form Feedback",
    });
});

// POST TAMBAH FEEDBACK
// Menambahkan feedback baru
app.post(
    "/feedbackForm",
    upload.single("profile"),
    [
        // Validasi data nama
        body("nama").custom(async (value) => {
            const duplicate = await Feedback.findOne({ nama: value });
            if (duplicate) {
                throw new Error("Nama feedback sudah ada"); // Menangani duplikasi nama
            }
            return true;
        }),
        body("email").custom(async (value) => {
            const duplicate = await Feedback.findOne({ email: value });
            if (duplicate) {
                throw new Error("Email sudah ada"); // Menangani duplikasi email
            }
            return true;
        }),
        // Validasi tanggal (pastikan sesuai dengan kebutuhan)
        check("date", "Tanggal tidak valid").not().isEmpty(), // Jika ingin validasi tanggal
    ],

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render("feedbackForm", {
                layout: "layouts/mainlayout",
                title: "Form Feedback",
                errors: errors.array(),
                feedback: req.body,
            });
        }

        // Simpan feedback baru ke database
        await Feedback.create({
            profile: req.file ? `/uploads/${req.file.filename}` : "profile-deafult.jpeg",
            nama: req.body.nama,
            email: req.body.email,
            message: req.body.message, // Asumsi message adalah isi dari feedback
            rating: req.body.rating, // Pastikan rating dikirimkan dari form
            date: moment(req.body.date).tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss'),  // Pastikan tanggal juga dikirimkan jika diperlukan
        });

        req.flash("msg", "Feedback berhasil ditambahkan"); // Flash message
        res.redirect("/feedbackList"); // Redirect ke halaman daftar feedback
    }
);
// app.post(
//     "/feedbackForm",
//     [
//         // Validasi data
//         body("nama", "Nama tidak boleh kosong").not().isEmpty(),
//         body("nama", "Nama harus memiliki minimal 3 karakter").isLength({ min: 3 }),
//         check("email", "Email tidak boleh kosong").not().isEmpty(),
//         check("email", "Format email tidak valid").isEmail(),
//         check("message", "Pesan tidak boleh kosong").not().isEmpty(),
//         check("message", "Pesan harus memiliki minimal 10 karakter").isLength({ min: 10 }),
//         check("rating", "Rating tidak boleh kosong").not().isEmpty(),
//         check("rating", "Rating harus bernilai antara 1 hingga 5").isInt({ min: 1, max: 5 }),
//         check("date", "Tanggal tidak boleh kosong").not().isEmpty(),
//         check("date", "Format tanggal tidak valid").isISO8601(),
//     ],
//     (req, res) => {
//         const errors = validationResult(req);
//         console.log("Data yang diterima:", req.body); // Debugging
//         console.log("Errors:", errors.array()); // Debugging

//         if (!errors.isEmpty()) {
//             return res.render("feedbackForm", {
//                 title: "Form Feedback",
//                 layout: "layouts/mainlayout",
//                 errors: errors.array(),
//                 feedback: req.body, // Mengembalikan input ke form
//             });
//         }

//         // Simpan feedback ke array
//         feedbacks.push({
//             profile: req.body.profile || "default.jpg", // Tambahkan gambar default jika tidak ada
//             nama: req.body.nama,
//             email: req.body.email,
//             message: req.body.message,
//             rating: req.body.rating,
//             date: req.body.date,
//         });

//         req.flash("msg", "Feedback berhasil ditambahkan!");
//         res.redirect("/feedbackList");
//     }
// );



// 404 Error
// app.use((req, res) => {
//     res.status(404);
//     res.send('<h1>Error 404: Halaman Tidak Ditemukan</h1>');
// });


// DETAIL FEEDBACK
app.get("/feedbackList/:nama", async (req, res) => {
    const feedback = await Feedback.findOne({ nama: req.params.nama }); // Mencari berdasarkan nama
    if (!feedback) {
        req.flash("msg", "feedback tidak ditemukan"); // Jika kontak tidak ditemukan
        return res.redirect("/feedbackList");
    }
    res.render("feedbackDetail", {
        title: "Detail feedback", // Mengirimkan variabel title ke template
        layout: "layouts/mainlayout", // Menggunakan layout utama
        feedback, // Mengirimkan data kontak untuk ditampilkan
    });
});

// EDIT FEEDBACK
app.get("/feedbackDetail/:nama/feedbackEdit", async (req, res) => {
    try {
        const feedback = await Feedback.findOne({ nama: req.params.nama });
        if (!feedback) {
            req.flash("msg", "Feedback tidak ditemukan");
            return res.redirect("/feedbackDetail");
        }
        res.render("feedbackEdit", {
            layout: "layouts/mainlayout",
            title: "Edit Feedback",
            feedback,
        });
    } catch (error) {
        console.error("Error fetching feedback for edit:", error);
        req.flash("msg", "Terjadi kesalahan saat mengambil feedback untuk diedit");
        res.redirect("/feedbackList");
    }
});

// // POST untuk menyimpan perubahan feedback
// app.post("/feedbackDetail/:nama/feedbackEdit", async (req, res) => {
//     try {
//         const feedback = await Feedback.findOne({ nama: req.params.nama });
//         if (!feedback) {
//             req.flash("msg", "Feedback tidak ditemukan");
//             return res.redirect("/feedbackDetail");
//         }

//         // Update feedback di database
//         await Feedback.updateOne(
//             { nama: req.params.nama },
//             {
//                 $set: {
//                     nama: req.body.nama,
//                     email: req.body.email,
//                     message: req.body.message,
//                     rating: parseInt(req.body.rating),
//                     date: req.body.date,
//                 },
//             }
//         );

//         req.flash("msg", "Feedback berhasil diubah");
        
//         res.redirect("/feedbackDetail");
//     } catch (error) {
//         console.error("Error updating feedback:", error);
//         req.flash("msg", "Terjadi kesalahan saat mengubah feedback");
//         res.redirect("/feedbackDetail");
//     }
// });

app.post(
    "/feedbackDetail/:nama/feedbackEdit",
    upload.single("profile"), // Middleware untuk menangani file upload
    async (req, res) => {
        try {
            const feedback = await Feedback.findOne({ nama: req.params.nama });
            if (!feedback) {
                req.flash("msg", "Feedback tidak ditemukan");
                return res.redirect("/feedbackList");
            }

            // Update data feedback, termasuk file profil baru jika ada
            const updatedFeedback = {
                nama: req.body.nama,
                email: req.body.email,
                message: req.body.message,
                rating: parseInt(req.body.rating),
                date: moment(req.body.date).tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss'),
            };

            if (req.file) {
                updatedFeedback.profile = `/uploads/${req.file.filename}`; // Path file profil baru
            }

            await Feedback.updateOne({ nama: req.params.nama }, { $set: updatedFeedback });

            req.flash("msg", "Feedback berhasil diubah");
            res.redirect("/feedbackList");
        } catch (error) {
            console.error("Error updating feedback:", error);
            req.flash("msg", "Terjadi kesalahan saat mengubah feedback");
            res.redirect("/feedbackList");
        }
    }
);



// // DELETE FEEDBACK
// app.get("/feedbackList/:name/deletef", async (req, res) => {
//     try {
//         const feedback = await Feedback.findOne({ nama: req.params.nama });
//         if (!feedback) {
//             req.flash("msg", "Feedback tidak ditemukan");
//             return res.redirect("/feedbackList");
//         }

//         await Feedback.deleteOne({ nama: req.params.nama });
//         req.flash("msg", "Feedback berhasil dihapus");
//         res.redirect("/feedbackList");
//     } catch (error) {
//         console.error("Error deleting feedback:", error);
//         req.flash("msg", "Terjadi kesalahan saat menghapus feedback");
//         res.redirect("/feedbackList");
//     }
// });


// DELETE Feedback berdasarkan nama
// app.get("/feedbackDetail/:name/delete", async (req, res) => {
//     try {
//         const feedback = await Feedback.findOne({ nama: req.params.nama });
//         if (!feedback) {
//             req.flash("msg", "Feedback tidak ditemukan");
//             return res.redirect("/feedbackList");
//         }

//         // Hapus feedback dari database
//         await Feedback.deleteOne({ nama: req.params.nama });
//         req.flash("msg", "Feedback berhasil dihapus");
//         res.redirect("/feedbackList");
//     } catch (error) {
//         console.error("Error deleting feedback:", error);
//         req.flash("msg", "Terjadi kesalahan saat menghapus feedback");
//         res.redirect("/feedbackList");
//     }
// });


app.get("/feedbackDetail/:nama/delete", async (req, res) => {
    const contact = await Feedback.findOne({ nama: req.params.nama }); // Mencari berdasarkan nama

    if (!contact) {
        req.flash("msg", "Feedback tidak ditemukan");
        return res.redirect("/feedbackList");
    }

    await Feedback.deleteOne({ nama: req.params.nama }); // Menghapus berdasarkan nama
    req.flash("msg", "Feedback berhasil dihapus"); // Flash message
    res.redirect("/feedbackList"); // Redirect ke halaman daftar kontak
});





// Jalankan Server
app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
});
