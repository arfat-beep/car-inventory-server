const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();

// middlewares
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("This port is running by localhost 5000");
});
app.listen(port, () => {
  console.log("Running port ", port);
});