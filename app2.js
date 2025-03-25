
// HALAMAN FEEDBACK LIST
// Menampilkan daftar feedback
app.get("/feedbackList", async (req, res) => {
    try {
        const feedbacks = await Feedback.find(); // Ambil semua feedback dari database
        const msg = req.flash("msg"); // Ambil pesan flash (bisa kosong jika tidak ada)
        res.render("feedbackList", {
            layout: "layouts/mainlayout",
            title: "Daftar Feedback",
            feedbacks, // Kirim data feedback ke template
            msg, // Kirim pesan flash ke template
        });
    } catch (error) {
        console.error("Error fetching feedbacks:", error.message);
        res.status(500).send("Terjadi kesalahan saat mengambil data feedback");
    }
});

// FORM TAMBAH FEEDBACK
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
    [
        // Validasi data nama
        body("nama").custom(async (value) => {
            const duplicate = await Feedback.findOne({ nama: value });
            if (duplicate) {
                throw new Error("Nama feedback sudah ada"); // Menangani duplikasi nama
            }
            return true;
        }),
        // Validasi email
        check("email", "Email tidak valid").isEmail(),
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
            nama: req.body.nama,
            email: req.body.email,
            message: req.body.message, // Asumsi message adalah isi dari feedback
            rating: req.body.rating, // Pastikan rating dikirimkan dari form
            date: req.body.date, // Pastikan tanggal juga dikirimkan jika diperlukan
        });

        req.flash("msg", "Feedback berhasil ditambahkan"); // Flash message
        res.redirect("/feedbackList"); // Redirect ke halaman daftar feedback
    }
);

// DETAIL FEEDBACK
app.get("/feedbackList/:name", async (req, res) => {
    try {
        const feedback = await Feedback.findOne({ nama: req.params.name }); // Cari feedback berdasarkan nama
        if (!feedback) {
            req.flash("msg", "Feedback tidak ditemukan");
            return res.redirect("/feedbackList");
        }
        res.render("feedbackDetail", {
            layout: "layouts/mainlayout",
            title: `Detail Feedback - ${feedback.nama}`,
            feedback,
        });
    } catch (error) {
        console.error("Error fetching feedback details:", error);
        req.flash("msg", "Terjadi kesalahan saat mengambil detail feedback");
        res.redirect("/feedbackList");
    }
});

// EDIT FEEDBACK
app.get("/feedbackList/:name/feedbackEdit", async (req, res) => {
    try {
        const feedback = await Feedback.findOne({ nama: req.params.name });
        if (!feedback) {
            req.flash("msg", "Feedback tidak ditemukan");
            return res.redirect("/feedbackList");
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

// POST untuk menyimpan perubahan feedback
app.post("/feedbackList/:name/edit", async (req, res) => {
    try {
        const feedback = await Feedback.findOne({ nama: req.params.name });
        if (!feedback) {
            req.flash("msg", "Feedback tidak ditemukan");
            return res.redirect("/feedbackList");
        }

        // Update feedback di database
        await Feedback.updateOne(
            { nama: req.params.name },
            {
                $set: {
                    nama: req.body.nama,
                    email: req.body.email,
                    message: req.body.message,
                    rating: parseInt(req.body.rating),
                    date: req.body.date,
                },
            }
        );

        req.flash("msg", "Feedback berhasil diubah");
        res.redirect("/feedbackList");
    } catch (error) {
        console.error("Error updating feedback:", error);
        req.flash("msg", "Terjadi kesalahan saat mengubah feedback");
        res.redirect("/feedbackList");
    }
});

// DELETE FEEDBACK
app.get("/feedbackList/:name/delete", async (req, res) => {
    try {
        const feedback = await Feedback.findOne({ nama: req.params.name });
        if (!feedback) {
            req.flash("msg", "Feedback tidak ditemukan");
            return res.redirect("/feedbackList");
        }

        await Feedback.deleteOne({ nama: req.params.name });
        req.flash("msg", "Feedback berhasil dihapus");
        res.redirect("/feedbackList");
    } catch (error) {
        console.error("Error deleting feedback:", error);
        req.flash("msg", "Terjadi kesalahan saat menghapus feedback");
        res.redirect("/feedbackList");
    }
});

