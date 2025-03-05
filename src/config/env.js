require("dotenv").config();

module.exports = {
  port: process.env.PORT || 3000,
  googleApiKey: process.env.GOOGLE_API_KEY,
  chatGptApiKey: process.env.CHATGPT_API_KEY,
  extensionOrigin: "chrome-extension://dmkoobmkmcfokohdkehkinbpalnhbkpe",
};
