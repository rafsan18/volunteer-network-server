const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();

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
    const eventsCollection = client
        .db(process.env.DB_NAME)
        .collection("events");

    app.post("/addEvents", (req, res) => {
        const event = req.body;
        console.log(event);
        eventsCollection.insertMany(event).then((result) => {
            res.send(result);
        });
    });

    app.get("/events", (req, res) => {
        eventsCollection.find({}).toArray((err, documents) => {
            res.send(documents);
        });
    });
});

app.listen(port);
