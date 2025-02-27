chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "uploadImage") {
    try {
      const formData = request.formData; // Access the formData directly

      // Send the file to the Express.js backend
      const response = await fetch("https://salford.site/upload", {
        method: "POST",
        body: formData,
      });

      // Check if the response is okay
      if (!response.ok) {
        sendResponse({ error: "Failed to upload image." });
        return;
      }

      // Parse the response
      const result = await response.json();

      // Send the response back to the popup
      sendResponse(result);
    } catch (error) {
      console.error("Error uploading image:", error);
      sendResponse({ error: "Error uploading image." });
    }

    // Return true to indicate that we will send a response asynchronously
    return true;
  }
});
