const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();

// middlewares
app.use(cors());
app.use(express.json());

// Db connection
const uri = `mongodb+srv://${process.env.DB_name}:${process.env.DB_pass}@cluster0.mahcw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
const productCollection = client.db("cars-inventory").collection("products");

const run = async () => {
  try {
    await client.connect();
    app.get("/products", async (req, res) => {
      const query = {};
      const cursor = productCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });
  } finally {
  }
};
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("This port is running by localhost 5000");
});
app.listen(port, () => {
  console.log("Running port ", port);
});
