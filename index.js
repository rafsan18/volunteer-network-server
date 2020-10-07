const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();
const ObjectId = require("mongodb").ObjectID;
const admin = require("firebase-admin");

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mypty.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();
app.use(bodyParser.json());
app.use(cors());

var serviceAccount = require("./configs/volunteer-network-b020a-firebase-adminsdk-q1apy-fe00324409.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIRE_DB,
});

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
        eventsCollections.insertOne(event).then((result) => {
            res.redirect("/");
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
        const bearer = req.headers.authorization;
        if (bearer && bearer.startsWith("Bearer ")) {
            const idToken = bearer.split(" ")[1];
            admin
                .auth()
                .verifyIdToken(idToken)
                .then(function (decodedToken) {
                    const tokenEmail = decodedToken.email;
                    const queryEmail = req.query.email;

                    if (tokenEmail === queryEmail) {
                        chosenEventCollections
                            .find({ email: queryEmail })
                            .toArray((err, documents) => {
                                res.status(200).send(documents);
                            });
                    } else {
                        res.status(401).send("un-authorized access");
                    }
                })
                .catch(function (error) {
                    res.status(401).send("un-authorized access");
                });
        } else {
            res.status(401).send("un-authorized access");
        }
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
                res.send(result.deletedCount > 0);
            });
    });
});

app.listen(port);
