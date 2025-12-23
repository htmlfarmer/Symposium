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

loadApiKeys();

