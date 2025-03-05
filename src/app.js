const express = require("express");
const path = require("path");
const cors = require("cors");
const routes = require("./routes");
const { clearUploadsFolder } = require("./utils/fileManager");
const { extensionOrigin } = require("./config/env");

const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, "../public")));

// CORS configuration
app.use(
  cors({
    origin: extensionOrigin,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

// Clear uploads folder on startup
clearUploadsFolder();

// Use routes
app.use("/", routes);

module.exports = app;
