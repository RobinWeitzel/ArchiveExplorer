const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const bodyParser = require('body-parser');

const url = process.env.mongourl; // i.e. 'mongodb://localhost:27017'
const dbName = process.env.mongodb;
const port = process.env.port;

app.set('view engine', 'ejs')
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const listCollections = async db => {
    return new Promise((resolve, reject) => {
        db.listCollections().toArray((err, items) => {
            if (err) {
                reject(err);
            } else {
                resolve(items.filter(i => i.type === 'collection').map(i => i.name));
            }
        });
    });
}

const find = (collection, filter, options, data, end) => {
    const stream = collection.find(filter, options).stream();
    stream.on('end', end);
    stream.on('data', data);
}

const searchEmails = (db, filter, options, data, end) => {
    listCollections(db).then(async collections => {
        let counter = 0;
        for (let collection of collections) {
            find(db.collection(collection), filter, options, d => data({ collection: collection, value: d }), () => {
                counter++;

                if (counter === collections.length) {
                    end();
                }
            });
        }
    });
}

MongoClient.connect(`${url}/${dbName}`, { useNewUrlParser: true }, (err, database) => {
    if (err) throw err;

    const client = database;
    const db = client.db(dbName);

    io.on('connection', socket => {
        socket.on('search', searchterm => {

            const regex = new RegExp(searchterm);
            const htmlRegex = new RegExp(`${searchterm}(?![^<>]*(([\/\"']|]]|\b)>))`)

            searchEmails(db, { $or: [{ subject: regex }, { text: regex }, {html: htmlRegex}, { from: regex }, { to: regex }, { date: regex }] }, {}, data => io.emit('search result', {searchTerm: searchterm, data: data}), () => {});
        });
    });

    app.use((request, response, next) => {
        request.io = io;
        next();
    });

    app.get('/', function (req, res) {
        res.render('index');
    });

    server.listen(port);
});