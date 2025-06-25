const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: ["http://localhost:5173"], // production site
  credentials: true // যদি future-এ cookies/token লাগে
}));
app.use(express.json());

console.log(process.env.DB_USER);
console.log(process.env.DB_PASSWORD);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.mojyanw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    const tipsCollection = client.db("gardeningDB").collection("tips");

    app.post('/garden-tips', async (req, res) => {
      const newTips = req.body;
      const result = await tipsCollection.insertOne(newTips);
      res.send(result);
    });

    app.get('/garden-tips', async (req, res) => {
      const difficulty = req.query.difficulty;
      const query = { availability: "Public" };
      if (difficulty) query.difficulty = difficulty;
      const tips = await tipsCollection.find(query).toArray();
      res.send(tips);
    });

    app.get("/garden-tips/:id", async (req, res) => {
      const id = req.params.id;
      const resultShow = await tipsCollection.findOne({ _id: new ObjectId(id) });
      res.send(resultShow);
    });

    app.patch('/garden-tips/:id/like', async (req, res) => {
      const { id } = req.params;
      try {
        const result = await tipsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $inc: { totalLiked: 1 } }
        );
        res.json(result);
      } catch (err) {
        res.status(500).send({ error: "Failed to update like count" });
      }
    });

    app.get('/my-tips', async (req, res) => {
      const userEmail = req.query.email;
      const result = await tipsCollection.find({ userEmail }).toArray();
      res.send(result);
    });

    app.delete("/garden-tips/:id", async (req, res) => {
      const id = req.params.id;
      const resultShow = await tipsCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(resultShow);
    });

    app.put("/garden-tips/:id", async (req, res) => {
      const id = req.params.id;
      const resultShows = req.body;
      const results = await tipsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: resultShows },
        { upsert: true }
      );
      res.send(results);
    });

    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Do nothing here for now
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('gardening-resource-hub-server');
});

app.listen(port, () => {
  console.log(`gardening-resource-hub-server is running on port ${port}`);
});
