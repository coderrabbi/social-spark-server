const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
// midleware
app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.e40en03.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const postCollection = client.db("socialSpark").collection("socialPost");
    const userCollection = client.db("socialSpark").collection("users");

    app.get("/", (req, res) => {
      res.send("query server is running");
    });

    app.get("/allpost", async (req, res) => {
      const sortPost = { createdAt: -1 };
      const query = {};
      const cursor = postCollection.find(query).sort(sortPost);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/allpost", async (req, res) => {
      const userPost = req.body;
      const result = await postCollection.insertOne(userPost);
      res.send(result);
    });
    app.post("/users", async (req, res) => {
      const allUsers = req.body;
      const result = await userCollection.insertOne(allUsers);
      res.send(result);
    });
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      res.send(user);
    });
    app.put("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const updateInfo = req.body;
      const updateProfile = {
        $set: {
          name: updateInfo.name,
          address: updateInfo.address,
          university: updateInfo.university,
        },
      };
      const result = await userCollection.updateOne(query, updateProfile);
      console.log(updateInfo);

      res.send(result);
    });
    app.post("/allpost/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const likes = req.body;
      const updateLikes = {
        $set: {
          userLikes: likes.likeCount,
        },
      };
      console.log(likes);
      const result = await postCollection.updateOne(query, updateLikes);

      res.send(result);
    });

    app.put("");
  } finally {
  }
}
run().catch((err) => console.log(err));

app.listen(port, console.log("listing on port " + port));
