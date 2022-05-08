const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

//Middleware
app.use(cors());
app.use(express.json());

//Verify JWT
function verifyJWT(req, res, next) {
    const authHeader = req.headers?.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        req.decoded = decoded;
        next();
    });
};

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zlzuo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    await client.connect();
    const booksCollection = client.db('booksStocker').collection('books');

    try {
        //Auth
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            res.send({ accessToken });
        });

        //Books API
        app.get('/books', async (req, res) => {
            const query = {};
            const cursor = booksCollection.find(query);
            const books = await cursor.toArray();
            res.send(books);
        });

        app.get('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const book = await booksCollection.findOne(query);
            res.send(book);
        });

        //Put
        app.put('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const book = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedQuantity = {
                $set: {
                    quantity: book.quantity
                }
            };
            const result = await booksCollection.updateOne(filter, updatedQuantity, options);
            res.send(result);
        });

        //Post
        app.post('/books', async (req, res) => {
            const newBook = req.body;
            const result = await booksCollection.insertOne(newBook);
            res.send(result);
        });

        //MyItems page data
        app.get('/myItems', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            console.log(query);
            const cursor = booksCollection.find(query);
            const addedBooks = await cursor.toArray();
            res.send(addedBooks);
        })

        //Delete
        app.delete('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await booksCollection.deleteOne(query);
            res.send(result);
        });

    }
    finally {

    }
};
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Warehouse server is running')
});

app.listen(port, () => {
    console.log('Listening to port', port);
});