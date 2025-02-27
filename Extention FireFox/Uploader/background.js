chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "uploadImage") {
    try {
      // Access the clipboard
      const clipboardItems = await navigator.clipboard.read();

      // Find the first image in the clipboard
      let imageItem = clipboardItems.find(
        (item) =>
          item.types.includes("image/png") || item.types.includes("image/jpeg")
      );

      if (!imageItem) {
        chrome.storage.local.set({
          response: "No image found in clipboard. Please copy an image first.",
        });
        return;
      }

      // Get the image file from the clipboard
      const blob = await imageItem.getType(imageItem.types[0]);

      // Prepare the form data
      const formData = new FormData();
      formData.append("file", blob, "clipboard-image.png"); // Name the file

      // Send the file to the Express.js backend
      const response = await fetch("https://salford.site/upload", {
        method: "POST",
        body: formData,
      });

      // Parse the response
      const result = await response.json();

      // Store the response in storage
      chrome.storage.local.set({ response: result.response });
    } catch (error) {
      console.error("Error uploading clipboard image:", error);
      chrome.storage.local.set({ response: "Error uploading clipboard image" });
    }
  }
});
