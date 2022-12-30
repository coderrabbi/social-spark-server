const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
var jwt = require("jsonwebtoken");
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
    const commentsColllection = client.db("socialSpark").collection("comments");

    app.get("/", (req, res) => {
      res.send("server is running");
    });

    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
      res.send({ token });
      console.log(token);
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

      res.send(result);
    });
    app.put("/allpost/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const data = req.body;
      const post = data.activity.post.userLikes;
      const userEmail = data.activity.userEmail;
      const cursor = userCollection.find({});
      const users = await cursor.toArray();
      const matchUser = post.some((email) => email.userEmail === userEmail);
      const updateLikes = {
        $push: {
          userLikes: {
            userEmail: data.activity.userEmail,
            like: data.activity.likes,
          },
        },
      };
      if (!matchUser) {
        const result = await postCollection.findOneAndUpdate(
          query,
          updateLikes
        );
        res.send(result);
      }
      console.log(matchUser);
    });

    app.post("/allpost/:id", async (req, res) => {
      const comment = req.body;
      const result = await commentsColllection.insertOne(comment);
      res.send(result);
    });
    app.get("/allpost/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await postCollection.findOne(query);
      res.send(result);
    });
    app.get("/comments/", async (req, res) => {
      const sortPost = { timeStamp: -1 };
      const query = {};
      const cursor = commentsColllection.find(query).sort(sortPost);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/comments/:id", async (req, res) => {
      const id = req.params.id;
      const query = {};
      const cursor = commentsColllection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
  } finally {
  }
}
run().catch((err) => console.log(err));

app.listen(port, console.log("listing on port " + port));
