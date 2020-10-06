const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();
const ObjectId = require("mongodb").ObjectID;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mypty.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();
app.use(bodyParser.json());
app.use(cors());

const port = 5000;

const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

client.connect((err) => {
    const eventsCollections = client
        .db(process.env.DB_NAME)
        .collection("events");
    const chosenEventCollections = client
        .db(process.env.DB_NAME)
        .collection("chosenEventCollection");

    // Post
    app.post("/addEvents", (req, res) => {
        const event = req.body;
        console.log(event);
        eventsCollections.insertMany(event).then((result) => {
            res.send(result);
        });
    });

    app.post("/addChosenEvent", (req, res) => {
        const chosenEvent = req.body;
        chosenEventCollections.insertOne(chosenEvent).then((result) => {
            res.send(result);
        });
    });

    //Get
    app.get("/chosenEvent", (req, res) => {
        chosenEventCollections.find({}).toArray((err, documents) => {
            res.send(documents);
        });
    });

    app.get("/events", (req, res) => {
        eventsCollections.find({}).toArray((err, documents) => {
            res.send(documents);
        });
    });

    app.get("/event/:id", (req, res) => {
        eventsCollections
            .find({ _id: ObjectId(req.params.id) })
            .toArray((err, documents) => {
                res.send(documents[0n]);
            });
    });

    app.get("/", (req, res) => {
        res.send("Welcome to Volunteer network");
    });

    // Delete
    app.delete("/cancelEvent/:id", (req, res) => {
        chosenEventCollections
            .deleteOne({ _id: ObjectId(req.params.id) })
            .then((result) => {
                console.log(result);
            });
    });
});

app.listen(port);
