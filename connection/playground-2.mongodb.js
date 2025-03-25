/* global use, db */
// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

const database = 'contact';
const collection = 'contact';

// Create a new database.
use(database);

// Create a new collection.
db.createCollection(collection);

db[collection].insertMany([
    {
        nama: "Yeni Faturohmah",
        email: "yeni.faturohmah@example.com",
        nohp: "081234567890",
    },
    {
        nama: "Khalila Puspita",
        email: "khalila.puspita@example.com",
        nohp: "081234567891",
    },
    {
        nama: "Dinda Ulfadiani",
        email: "dinda.ulfadiani@example.com",
        nohp: "081234567892",
    }
]);

db[collection].find().pretty();

// More information on the `createCollection` command can be found at:
// https://www.mongodb.com/docs/manual/reference/method/db.createCollection/
