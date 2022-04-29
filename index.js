const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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

    // get all products
    app.get("/products", async (req, res) => {
      const query = {};
      const cursor = productCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });

    // delete a product
    app.delete("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      res.send(result);
    });
    app.get("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productCollection.findOne(query);
      res.send(result);
    });

    // add quantity added
    app.put("/delivered/:id", async (req, res) => {
      const id = req?.params?.id;
      const updateProduct = req?.body;
      console.log(typeof updateProduct.quantity);
      const filter = { _id: ObjectId(id) };
      const option = { upsert: true };
      const update = {
        $set: {
          quantity: updateProduct.quantity,
        },
      };

      const result = await productCollection.updateOne(filter, update, option);
      res.send(result);
    });

    // add new item
    app.post("/additem", async (req, res) => {
      const product = req.body;
      const result = await productCollection.insertOne(product);
      res.send(result);
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
