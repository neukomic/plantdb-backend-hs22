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
        database = db.db('CarRentalDB');
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
    res.send("Welcome to the Car Rental Database API");
})


//--------------------------------------------------------------------------------------------------
// Get all cars
//--------------------------------------------------------------------------------------------------
app.get('/api/cars', async (req, res) => {
    try {
        const collection = database.collection('cars');
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
// Get a car by their id
//----------------------------------------------------------------------------
app.get('/api/cars/:id', async (req, res) => {
    // read the path parameter :id
    let id = req.params.id;
    try {
        const collection = database.collection('cars');
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
// Create a new car
//----------------------------------------------------------------------------
app.post('/api/cars', async (req, res) => {
    try {
        const collection = database.collection('cars');
        var car = {
            make: req.body.make,
            model: req.body.model,
            year: req.body.year,
            automatic: req.body.automatic
        };
        const result = await collection.insertOne(car);
        res.status(201).send({ _id: result.insertedId });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
})

//----------------------------------------------------------------------------
// Update an existing car
//----------------------------------------------------------------------------
app.put('/api/cars/:id', async (req, res) => {
    // read the path parameter :id
    let id = req.params.id;
    let car = req.body;
    delete car._id; // delete the _id from the object, because the _id cannot be updated
    try {
        const collection = database.collection('cars');
        const query = { _id: ObjectId(id) }; // filter by id
        const result = await collection.updateOne(query, { $set: car });
        if (result.matchedCount === 0) {
            let responseBody = {
                status: "No car with id " + id
            }
            res.status(404).send(responseBody);
        }
        else {
            res.send({ status: "Car with id " + id + " has been updated." });
        }
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
})

//----------------------------------------------------------------------------
// Delete an existing car
//----------------------------------------------------------------------------
app.delete('/api/cars/:id', async (req, res) => {
    // read the path parameter :id
    let id = req.params.id;
    try {
        const collection = database.collection('cars');
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
// Get all users
//--------------------------------------------------------------------------------------------------
app.get('/api/users', async (req, res) => {
    try {
        const collection = database.collection('users');
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
// Get a user by their id
//----------------------------------------------------------------------------
app.get('/api/users/:id', async (req, res) => {
    // read the path parameter :id
    let id = req.params.id;
    try {
        const collection = database.collection('users');
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
// Create a new user
//----------------------------------------------------------------------------
app.post('/api/users', async (req, res) => {
    try {
        const collection = database.collection('users');
        var user = {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            phone: req.body.phone,
            email: req.body.email,
            postalZip: req.body.postalZip,
            region: req.body.region,
            country: req.body.country
        };
        const result = await collection.insertOne(user);
        res.status(201).send({ _id: result.insertedId });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
})

//----------------------------------------------------------------------------
// Update an existing user
//----------------------------------------------------------------------------
app.put('/api/users/:id', async (req, res) => {
    // read the path parameter :id
    let id = req.params.id;
    let user = req.body;
    delete user._id; // delete the _id from the object, because the _id cannot be updated
    try {
        const collection = database.collection('users');
        const query = { _id: ObjectId(id) }; // filter by id
        const result = await collection.updateOne(query, { $set: user });
        if (result.matchedCount === 0) {
            let responseBody = {
                status: "No user with id " + id
            }
            res.status(404).send(responseBody);
        }
        else {
            res.send({ status: "User with id " + id + " has been updated." });
        }
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
})

//----------------------------------------------------------------------------
// Delete an existing user
//----------------------------------------------------------------------------
app.delete('/api/users/:id', async (req, res) => {
    // read the path parameter :id
    let id = req.params.id;
    try {
        const collection = database.collection('users');
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
// Start the server
//--------------------------------------------------------------------------------------------------
server.listen(port, () => console.log("app listening on port " + port));
