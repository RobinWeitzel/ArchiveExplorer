const MongoClient = require('mongodb').MongoClient;
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const bodyParser = require('body-parser');

const url = process.env.mongourl;   // i.e. 'mongodb://localhost:27017'
const dbName = process.env.mongodb;

app.set('view engine', 'ejs')
//app.use(express.static('public'));
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

const find = (collection, filter, options, data) => {
    const stream = collection.find(filter, options).stream();
    stream.on('data', data);
}

const searchEmails = (db, collections, filter, options, data) => {
    for (let collection of collections) {
        find(db.collection(collection), filter, options, d => data({ collection: collection, value: d }));
    }
}

const countEmails = (db, collections, data) => {
    for (let collection of collections) {
        stream = db.collection(collection).aggregate([{$match: {date: {$gte: new Date((new Date().getTime() - (6 * 24 * 60 * 60 * 1000)))}}}, {"$group": {_id : { month: { $month: "$date" }, day: { $dayOfMonth: "$date" }, year: { $year: "$date" } }, count: { $sum: 1 }}}]).stream();
        stream.on('data', result => data([collection, result]));
    } 
}

MongoClient.connect(url, { useNewUrlParser: true }, (err, database) => {
    if (err) throw err;

    const client = database;
    const db = client.db(dbName);

    io.on('connection', socket => {
        socket.on('chart1', () => {
            listCollections(db).then(collections => {
                countEmails(db, collections, result => {
                    io.emit('chart1', result);
                });
            });
        });
        
        socket.on('search', query => {
            const searchTerm = query.value;
            const collections = query.collections;

            const fields = [];
            const regex = new RegExp(searchTerm);
            const htmlRegex = new RegExp(`${searchTerm}(?![^<>]*(([\/\"']|]]|\b)>))`)

            for(let field of query.fields) {
                switch(field) {
                    case "Subject":
                        fields.push({ subject: regex });
                        break;
                    case "Content":
                        fields.push({ text: regex });
                        fields.push({html: htmlRegex});
                        break;
                    case "Sender":
                        fields.push({ from: regex });
                        break;
                    case "Date":
                        fields.push({ date: regex });
                        break;
                }
            }

            if(fields.length === 0) {
                return;
            }

            searchEmails(db, collections, { $or: fields }, {}, data => io.emit('search result', {searchTerm: searchTerm, data: data}));
        });
    });

    app.use((request, response, next) => {
        request.io = io;
        next();
    });

    app.get('/', function (req, res) {
        listCollections(db).then(collections => {
            res.render('index', {collections: collections});
        });
    });

    app.get('/search', function (req, res) {
        listCollections(db).then(collections => {
            res.render('search', {collections: collections});
        });
    });

    server.listen(8081);
});