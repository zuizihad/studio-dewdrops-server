const express = require('express')
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000
require('dotenv').config();
app.use(cors());
app.use(bodyParser.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.es1zz.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const collection = client.db("studioDewDrops").collection("services");
    const OrderCollection = client.db("studioDewDrops").collection("orders");
    const ReviewCollection = client.db("studioDewDrops").collection("reviews");
    const AdminCollection = client.db("studioDewDrops").collection("admin");

    console.log('db connected')

    app.get('/', (req, res) => {
        res.send('working')
    })
    app.get('/services', (req, res) => {
        collection.find()
            .toArray((err, items) => {
                res.send(items)
            })
    })
    app.post('/addService', (req, res) => {
        const service = req.body;
        collection.insertOne(service)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })
    app.delete('/deleteService/:id', (req, res) => {
        console.log(req.params.id)
        const id = ObjectID(req.params.id);
        collection.findOneAndDelete({ _id: id })
            .then(documents => res.send(documents))
    })
    app.get('/service/:id', (req, res) => {
        const id = ObjectID(req.params.id);
        collection.find({ _id: id })
            .toArray((err, documents) => {
                res.send(documents[0])
            })
    })

    app.post('/checkout', (req, res) => {
        const newCheckout = req.body;
        OrderCollection.insertOne(newCheckout)
            .then((result) => {
                res.status(200).send('inserted')
            })
    })

    app.get('/orders', (req, res) => {
        OrderCollection.find()
            .toArray((err, documents) => {
                res.send(documents);
            })
    })
    app.get('/bookingList', (req, res) => {
        // const email = req.body.email;
        OrderCollection.find({ email: req.query.email })
            .toArray((err, documents) => {
                res.send(documents);
            })
    })
    app.patch('/update:id', (req, res) => {
        OrderCollection.updateOne({ _id: ObjectID(req.params.id) },
            { $set: { status: req.body.status } })
            .then((result) => {
                console.log(result)
            })
    })
    app.post('/addReview', (req, res) => {
        const newReview = req.body;
        ReviewCollection.insertOne(newReview)
            .then((result) => {
                res.send(result.insertedCount > 0)
            })
    })

    app.get('/getReview', (req, res) => {
        ReviewCollection.find()
            .toArray((err, items) => {
                res.send(items)
            })
    })

    app.post('/addAdmin', (req, res) => {
        const email = req.body.email;
        const role = req.body.role;
        AdminCollection.insertOne({ email: email, role: role })
            .then((result) => {
                res.send(result.insertedCount > 0)
            })
    })

    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        AdminCollection.find({ email: email })
            .toArray((err, documents) => {
                res.send(documents.length > 0)
            })
    })


});

app.listen(port, () => {
    console.log('server running on port', port);
});

