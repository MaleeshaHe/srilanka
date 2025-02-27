document.getElementById("pasteBtn").addEventListener("click", async () => {
  const loader = document.getElementById("loader");
  const resultDiv = document.getElementById("result");

  // Show loader
  loader.style.display = "block";
  resultDiv.innerText = ""; // Clear previous results

  try {
    // Attempt to read the clipboard
    const clipboardItems = await navigator.clipboard.read();
    const imageBlob = await getImageFromClipboard(clipboardItems);

    if (imageBlob) {
      const formData = new FormData();
      formData.append("file", imageBlob, "pasted-image.png");

      const response = await fetch("https://salford.site/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      loader.style.display = "none"; // Hide loader

      if (response.ok) {
        // Extract the answer letter from the response text
        const answerMatch = data.response; // Get the first character
        resultDiv.innerText = `Answer: ${answerMatch}`;
      } else {
        resultDiv.innerText = `Error: ${data.error}`;
      }
    } else {
      loader.style.display = "none"; // Hide loader
      resultDiv.innerText = "No image found in clipboard.";
    }
  } catch (error) {
    console.error("Error pasting image:", error);
    loader.style.display = "none"; // Hide loader
    resultDiv.innerText = "Pasting failed: " + error.message;
  }
});

// Helper function to get an image blob from clipboard items
async function getImageFromClipboard(clipboardItems) {
  try {
    for (const item of clipboardItems) {
      for (const type of item.types) {
        if (type.startsWith("image/")) {
          const blob = await item.getType(type);
          return blob; // Return the first image found
        }
      }
    }
  } catch (err) {
    console.error("Error accessing clipboard items:", err);
  }
  return null; // Return null if no image is found
}
