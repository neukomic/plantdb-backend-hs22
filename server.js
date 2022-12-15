// Imports
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb'); // See https://www.mongodb.com/docs/drivers/node/current/quick-start/
const cors = require('cors')
const http = require('http');
const bodyParser = require('body-parser');
const config = require('./config');

// Set up App
const app = express();
app.use(cors()); // Allow all cross-origing requests. More information: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
app.use(express.static('public')); // Host all static files in the folder /public
app.use(bodyParser.json()); // Support json encoded bodies
const port = process.env.PORT || '3001'; // Use the PORT variable if set (e.g., when deploying to Heroku)
app.set('port', port);

const server = http.createServer(app);


// Create the client and connect to the database
let database;
const client = new MongoClient(config.mongodb_connection_string);
client.connect((error, db) => {
    if (error || !db) {
        console.log("Could not connect to MongoDB:")
        console.log(error.message);
    }
    else {
        database = db.db('plantDB');
        console.log("Successfully connected to MongoDB.");
    }
})

//##################################################################################################
// ENDPOINTS 
//##################################################################################################

//--------------------------------------------------------------------------------------------------
// Welcome message
//--------------------------------------------------------------------------------------------------
app.get('/api', async (req, res) => {
    res.send("Welcome to the Plant Database API");
})


//--------------------------------------------------------------------------------------------------
// Get all plants
//--------------------------------------------------------------------------------------------------
app.get('/api/plants', async (req, res) => {
    try {
        const collection = database.collection('plants');
        // You can specify a query/filter here
        // See https://www.mongodb.com/docs/drivers/node/current/fundamentals/crud/query-document/
        const query = {};
        // Get all objects that match the query
        const result = await collection.find(query).toArray();
        res.send(result);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
})

//----------------------------------------------------------------------------
// Get a plant by their id
//----------------------------------------------------------------------------
app.get('/api/plants/:id', async (req, res) => {
    // read the path parameter :id
    let id = req.params.id;
    try {
        const collection = database.collection('plants');
        const query = { _id: ObjectId(id) }; // filter by id
        const result = await collection.findOne(query);
        if (!result) {
            let responseBody = {
                status: "No object with id " + id
            }
            res.status(404).send(responseBody);
        }
        else {
            res.send(result);
        }
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
})


//----------------------------------------------------------------------------
// Create a new plant
//----------------------------------------------------------------------------
app.post('/api/plants', async (req, res) => {
    try {
        const collection = database.collection('plants');
        var plant = {
            common_name: req.body.common_name,
            scientific_name: req.body.scientific_name
        };
        const result = await collection.insertOne(plant);
        res.status(201).send({ _id: result.insertedId });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
})

//----------------------------------------------------------------------------
// Update an existing plant
//----------------------------------------------------------------------------
app.put('/api/plants/:id', async (req, res) => {
    // read the path parameter :id
    let id = req.params.id;
    let plant = req.body;
    delete plant._id; // delete the _id from the object, because the _id cannot be updated
    try {
        const collection = database.collection('plants');
        const query = { _id: ObjectId(id) }; // filter by id
        const result = await collection.updateOne(query, { $set: plant });
        if (result.matchedCount === 0) {
            let responseBody = {
                status: "No plant with id " + id
            }
            res.status(404).send(responseBody);
        }
        else {
            res.send({ status: "Plant with id " + id + " has been updated." });
        }
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
})

//----------------------------------------------------------------------------
// Delete an existing plant
//----------------------------------------------------------------------------
app.delete('/api/plants/:id', async (req, res) => {
    // read the path parameter :id
    let id = req.params.id;
    try {
        const collection = database.collection('plants');
        const query = { _id: ObjectId(id) }; // filter by id
        const result = await collection.deleteOne(query);
        if (result.deletedCount === 0) {
            let responseBody = {
                status: "No object with id " + id
            }
            res.status(404).send(responseBody);
        }
        else {
            let responseBody = {
                status: "Object with id " + id + " has been successfully deleted."
            }
            res.send(responseBody);
        }
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
})

//--------------------------------------------------------------------------------------------------
// Get all families
//--------------------------------------------------------------------------------------------------
app.get('/api/families', async (req, res) => {
    try {
        const collection = database.collection('families');
        // You can specify a query/filter here
        // See https://www.mongodb.com/docs/drivers/node/current/fundamentals/crud/query-document/
        const query = {};
        // Get all objects that match the query
        const result = await collection.find(query).toArray();
        res.send(result);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
})

//----------------------------------------------------------------------------
// Get a family by their id
//----------------------------------------------------------------------------
app.get('/api/families/:id', async (req, res) => {
    // read the path parameter :id
    let id = req.params.id;
    try {
        const collection = database.collection('families');
        const query = { _id: ObjectId(id) }; // filter by id
        const result = await collection.findOne(query);
        if (!result) {
            let responseBody = {
                status: "No object with id " + id
            }
            res.status(404).send(responseBody);
        }
        else {
            res.send(result);
        }
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
})

//----------------------------------------------------------------------------
// Update an existing family
//----------------------------------------------------------------------------
app.put('/api/families/:id', async (req, res) => {
    // read the path parameter :id
    let id = req.params.id;
    let family = req.body;
    delete family._id; // delete the _id from the object, because the _id cannot be updated
    try {
        const collection = database.collection('families');
        const query = { _id: ObjectId(id) }; // filter by id
        const result = await collection.updateOne(query, { $set: family });
        if (result.matchedCount === 0) {
            let responseBody = {
                status: "No family with id " + id
            }
            res.status(404).send(responseBody);
        }
        else {
            res.send({ status: "Family with id " + id + " has been updated." });
        }
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
})

//--------------------------------------------------------------------------------------------------
// Start the server
//--------------------------------------------------------------------------------------------------
server.listen(port, () => console.log("app listening on port " + port));
