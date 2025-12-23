const promptList = document.getElementById("prompt-list");

promptList.addEventListener("click", (event) => {
  if (event.target.tagName === "LI") {
    const prompt = event.target.getAttribute("data-prompt");
    chrome.runtime.sendMessage({ action: "insertPrompt", prompt: prompt });
    window.close();
  }
});
