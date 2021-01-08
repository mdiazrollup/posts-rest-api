const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const { graphqlHTTP } = require('express-graphql');
const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');
const auth = require('./middleware/auth');
const {clearImage} = require('./util/file');

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
    // To allow OPTIONS on graphql
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(auth);

app.put('/post-image', (req, res, next) => {
    if(!req.isAuth) {
        throw new Error('not authenticated');
    }
    if (!req.file) {
        return res.status(200).json({ message: 'No file provided' });
    }
    if(req.body.oldPath) {
        clearImage(req.body.oldPath);
    }
    return res.status(201).json({message: 'File Store', filePath: req.file.path});
});

app.use('/graphql', graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true, //api test console
    customFormatErrorFn(err) { //errors format
        if (!err.originalError) {
            return err;
        }
        const data = err.originalError.data;
        const message = err.message || 'An error ocurred';
        const code = err.code || 500;
        return {
            message: message,
            status: code,
            data: data
        }
    }
}));

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode | 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
})

mongoose.connect(MONGODB_URI)
    .then(result => {
        app.listen(8080);
    })
    .catch(err => console.log(err));