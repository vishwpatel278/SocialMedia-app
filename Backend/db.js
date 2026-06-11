const mongoose = require('mongoose');
require('dotenv').config();

const mongourl = process.env.DB_URL;

mongoose.connect(mongourl)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

const db = mongoose.connection;

// db.on('connected', () => {
//     console.log("connected to MongoDB server");
// })

module.exports = db;