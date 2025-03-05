const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
const path = require("path");
const { googleApiKey } = require("../config/env");

const genAI = new GoogleGenerativeAI(googleApiKey);
const fileManager = new GoogleAIFileManager(googleApiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

const processImage = async (filePath, mimeType) => {
  const uploadResult = await fileManager.uploadFile(filePath, {
    mimeType,
    displayName: path.basename(filePath),
  });

  const file = uploadResult.file;
  console.log(`Uploaded file ${file.displayName} as: ${file.name}`);

  const chatSession = model.startChat({
    generationConfig,
    history: [
      {
        role: "user",
        parts: [
          {
            fileData: { mimeType: file.mimeType, fileUri: file.uri },
          },
          { text: "Extract text from the following image." },
        ],
      },
    ],
  });

  const result = await chatSession.sendMessage("Extract text from the image.");
  return await result.response.text();
};

module.exports = { processImage };
