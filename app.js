require("dotenv").config(); // Load environment variables from .env
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
const cors = require("cors");
const axios = require("axios"); // Import axios for making HTTP requests

// Setup Express
const app = express();
const port = process.env.PORT || 3000;

// Serve static files (like the HTML, CSS, and JS) from the 'public' folder
app.use(express.static(path.join(__dirname, "public")));

// Route to serve the index.html page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// CORS configuration
const corsOptions = {
  origin: "chrome-extension://dmkoobmkmcfokohdkehkinbpalnhbkpe", // Replace with your extension ID
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
};
app.use(cors(corsOptions));

// Clear uploads folder on server start
const clearUploadsFolder = () => {
  const directory = path.join(__dirname, "uploads");

  fs.readdir(directory, (err, files) => {
    if (err) throw err;

    for (const file of files) {
      fs.unlink(path.join(directory, file), (err) => {
        if (err) throw err;
      });
    }
  });
};

// Call clearUploadsFolder when the server starts
clearUploadsFolder();

// Setup multer for file uploads
const upload = multer({ dest: "uploads/" });

// Load API keys from environment variables
const googleApiKey = process.env.GOOGLE_API_KEY;
const chatGptApiKey = process.env.CHATGPT_API_KEY; // Add your ChatGPT API key here
const genAI = new GoogleGenerativeAI(googleApiKey);
const fileManager = new GoogleAIFileManager(googleApiKey);

// Setup the generation model
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash", // Ensure this model supports text extraction from images
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

// Function to send extracted text to ChatGPT and get the best answer
const sendToChatGpt = async (extractedText) => {
  const prompt = `${extractedText} \n\n Provide the best answer to the question. No need any explanation.`;

  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4o", // Use ChatGPT-4
      messages: [{ role: "user", content: prompt }],
      temperature: 1,
      max_tokens: 2048,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      response_format: {
        type: "text",
      },
    },
    {
      headers: {
        Authorization: `Bearer ${chatGptApiKey}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.choices[0].message.content; // Return the response from ChatGPT
};

// Endpoint to handle file uploads and GoogleGenerativeAI interaction
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const mimeType = req.file.mimetype;

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(400).json({ error: "File not found" });
    }

    // Upload file to Google AI
    const uploadResult = await fileManager.uploadFile(filePath, {
      mimeType,
      displayName: path.basename(filePath),
    });

    const file = uploadResult.file;
    console.log(`Uploaded file ${file.displayName} as: ${file.name}`);

    // Start GoogleGenerativeAI session
    const chatSession = model.startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [
            {
              fileData: {
                mimeType: file.mimeType,
                fileUri: file.uri,
              },
            },
            {
              text: "Extract text from the following image.",
            },
          ],
        },
      ],
    });

    // Send message to analyze the image and extract text
    const result = await chatSession.sendMessage(
      "Please extract the text from the image."
    );

    // Extract the text from the result
    const extractedText = await result.response.text();

    // Send the extracted text to ChatGPT
    const answer = await sendToChatGpt(extractedText);

    // Optionally, clear the uploaded file after processing it
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(`Error deleting file ${filePath}:`, err);
      } else {
        console.log(`Successfully deleted ${filePath}`);
      }
    });

    // Return the extracted text and ChatGPT's response to the client
    return res.json({ response: answer });
  } catch (error) {
    console.error(
      "Error uploading file or interacting with Google Generative AI:",
      error
    );
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start Express server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
