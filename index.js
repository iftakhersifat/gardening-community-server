const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// gardening-community
// VzEpeoqZyG9jFbCJ

console.log(process.env.DB_USER)
console.log(process.env.DB_PASSWORD)


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.mojyanw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const tipsCollection = client.db("gardeningDB").collection("tips");
    // const userCollection = client.db("coffeeDB").collection("users");

    // POST garden tip
    app.post('/garden-tips', async (req, res) => {
    const newTips = req.body;
    console.log('Garden-Tips:', newTips);
    const result = await tipsCollection.insertOne(newTips)
    res.send(result)
    });

    // get garden tip
    app.get("/garden-tips/public", async(req,res)=>{
    const cursor = tipsCollection.find();
    const showResult = await cursor.toArray();
    res.send(showResult)
    })

    // single id show
    app.get("/garden-tips/public/:id", async(req, res)=>{
    const id= req.params.id;
    const query = {_id: new ObjectId(id)}
    const resultShow = await tipsCollection.findOne(query)
    res.send(resultShow)
    })

    // my tips
    app.get('/my-tips', async (req, res) => {
  const userEmail = req.query.email;
  const query = { userEmail }; // fetch tips for this user
  const result = await tipsCollection.find(query).toArray();
  res.send(result);
});
    
     // for delete
    app.delete("/garden-tips/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const resultShow = await tipsCollection.deleteOne(query);
    res.send(resultShow);
    });













    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
  res.send('gardening-community-server');
});


app.listen(port, () => {
  console.log(`gardening-community-server is running on port ${port}`);
});
