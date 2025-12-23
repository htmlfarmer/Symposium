const form = document.getElementById("api-key-form");
const geminiKeyInput = document.getElementById("gemini-key");
const openaiKeyInput = document.getElementById("openai-key");
const anthropicKeyInput = document.getElementById("anthropic-key");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const geminiKey = geminiKeyInput.value;
  const openaiKey = openaiKeyInput.value;
  const anthropicKey = anthropicKeyInput.value;

  chrome.storage.sync.set({
    geminiKey,
    openaiKey,
    anthropicKey,
  }, () => {
    console.log("API keys saved");
  });
});

function loadApiKeys() {
  chrome.storage.sync.get(["geminiKey", "openaiKey", "anthropicKey"], (result) => {
    geminiKeyInput.value = result.geminiKey || "";
    openaiKeyInput.value = result.openaiKey || "";
    anthropicKeyInput.value = result.anthropicKey || "";
  });
}

const promptLibraryButton = document.getElementById("prompt-library-button");
const insertHighlightedButton = document.getElementById("insert-highlighted-button");
const historyButton = document.getElementById("history-button");

promptLibraryButton.addEventListener("click", () => {
  chrome.windows.create({
    url: "popup/prompt-library/prompt-library.html",
    type: "popup",
    width: 320,
    height: 240,
  });
});

insertHighlightedButton.addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "insertHighlighted" });
});

historyButton.addEventListener("click", () => {
  chrome.windows.create({
    url: "popup/history/history.html",
    type: "popup",
    width: 420,
    height: 400,
  });
});

loadApiKeys();

