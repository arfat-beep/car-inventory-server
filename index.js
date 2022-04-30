const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const jwt = require("jsonwebtoken");
const verify = require("jsonwebtoken/verify");
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

// verifyJWT function
const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.auth;
  if (!authHeader) {
    return res.status(401).send({ message: "You are unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Forbidden Access" });
    }
    req.decoded = decoded;
    next();
  });
};

const run = async () => {
  try {
    await client.connect();

    // Create token for JWT
    app.post("/login", async (req, res) => {
      const email = req.body;
      const token = jwt.sign(email, process.env.ACCESS_TOKEN, {
        expiresIn: "1d",
      });
      res.send({ token });
    });

    // get all products
    app.get("/products", verifyJWT, async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.decoded.email;
      console.log(email, decodedEmail);
      if (email === decodedEmail) {
        const query = {};
        const cursor = productCollection.find(query);
        const products = await cursor.toArray();
        res.send(products);
      }
    });
    // add new item
    app.post("/additem", async (req, res) => {
      const product = req.body;
      const result = await productCollection.insertOne(product);
      res.send(result);
    });
    // get all products for my item
    app.get("/myItem", verifyJWT, async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.decoded.email;
      // console.log(email, decodedEmail);
      if (email === decodedEmail) {
        const query = { email };
        const cursor = productCollection.find(query);
        const products = await cursor.toArray();
        res.send(products);
      } else {
        res.status(403).send({ message: "Forbidden access" });
      }
      // res.send(email);
      // console.log(email);

      // console.log(products);
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
      // console.log(typeof updateProduct.quantity);
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
