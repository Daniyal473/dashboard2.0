const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors()); // allow frontend requests
app.use(express.json());

// Simple test route
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from Backend 🚀" });
});

module.exports = app;
