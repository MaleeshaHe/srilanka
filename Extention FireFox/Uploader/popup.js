document.addEventListener("DOMContentLoaded", async () => {
  const uploadButton = document.getElementById("uploadButton");
  const clearButton = document.getElementById("clearButton");
  const responseElement = document.getElementById("response");
  const loader = document.getElementById("loader");

  // Display saved response (if available) on popup open
  chrome.storage.local.get("response", (data) => {
    if (data.response) {
      responseElement.textContent = data.response;
    }
  });

  // Upload button event listener
  uploadButton.addEventListener("click", () => {
    loader.style.display = "inline-block"; // Show loader
    responseElement.textContent = ""; // Clear previous response
    chrome.runtime.sendMessage({ action: "uploadImage" }, () => {
      // Hide loader after a delay to simulate processing time
      setTimeout(() => {
        loader.style.display = "none";
      }, 500);
    });
  });

  // Clear button event listener
  clearButton.addEventListener("click", () => {
    chrome.storage.local.remove("response", () => {
      responseElement.textContent = ""; // Clear the response display
    });
  });

  // Check for updated response after uploading
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.response?.newValue) {
      responseElement.textContent = changes.response.newValue;
      loader.style.display = "none"; // Hide loader once the response is ready
    }
  });
});
