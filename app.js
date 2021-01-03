const express = require('express');
const path = require('path');
const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');

const MONGODB_URI = 'mongodb+srv://root:p4ssw0rd@cluster0.ymwtf.mongodb.net/feedsapp?authSource=admin&replicaSet=atlas-2kbbg6-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true';

const app = express();

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

app.use(bodyParser.json()); // application/json middleware
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));
app.use('/images', express.static(path.join(__dirname, 'images')));

// CORS Headers middleware
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode | 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data:data });
})

mongoose.connect(MONGODB_URI)
    .then(result => {
        const server = app.listen(8080);
        // Setting socket.io
        // Handling CORS https://socket.io/docs/v3/handling-cors/
        const io = require('./socket').init(server);
        io.on('connection', socket => {
            console.log('Connected');
        });
    })
    .catch(err => console.log(err));