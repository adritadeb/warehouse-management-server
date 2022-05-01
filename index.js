const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zlzuo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    await client.connect();
    const booksCollection = client.db('booksStocker').collection('books');

    app.get('/books', async (req, res) => {
        const query = {};
        const cursor = booksCollection.find(query);
        const books = await cursor.toArray();
        res.send(books);
    })
};
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Warehouse server is running')
});

app.listen(port, () => {
    console.log('Listening to port', port);
});