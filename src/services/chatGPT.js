const axios = require("axios");
const { chatGptApiKey } = require("../config/env");

const sendToChatGpt = async (extractedText) => {
  const prompt = `${extractedText} \n\n Provide the best answer to the question. No need any explanation.`;

  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 1,
      max_tokens: 2048,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    },
    {
      headers: {
        Authorization: `Bearer ${chatGptApiKey}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.choices[0].message.content;
};

module.exports = { sendToChatGpt };
