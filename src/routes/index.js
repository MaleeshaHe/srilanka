const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { processImage } = require("../services/googleAI");
const { sendToChatGpt } = require("../services/chatGPT");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// File upload and processing route
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const mimeType = req.file.mimetype;

    if (!fs.existsSync(filePath)) {
      return res.status(400).json({ error: "File not found" });
    }

    const extractedText = await processImage(filePath, mimeType);
    const answer = await sendToChatGpt(extractedText);

    fs.unlink(filePath, (err) => {
      if (err) console.error(`Error deleting file:`, err);
    });

    res.json({ response: answer });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
