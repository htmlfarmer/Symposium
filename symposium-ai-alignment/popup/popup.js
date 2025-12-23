const form = document.getElementById("ask-form");
const questionInput = document.getElementById("question");
const responseDiv = document.getElementById("response");
const optionsLink = document.getElementById("options-link");
const apiSelect = document.getElementById("api-select");

// Restore state when the popup is opened
function restoreState() {
  chrome.storage.session.get(["question", "response", "selectedApi"], (result) => {
    if (result.question) {
      questionInput.value = result.question;
    }
    if (result.response) {
      responseDiv.innerText = result.response;
    }
    if (result.selectedApi) {
      apiSelect.value = result.selectedApi;
    }
  });
}

// Save question to session storage as the user types
questionInput.addEventListener("input", () => {
  chrome.storage.session.set({ question: questionInput.value });
});

// Save selected API to session storage when it changes
apiSelect.addEventListener("change", () => {
  chrome.storage.session.set({ selectedApi: apiSelect.value });
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const question = questionInput.value;
  const selectedApi = apiSelect.value;
  const apiKeyName = `${selectedApi}Key`;

  chrome.storage.sync.get(apiKeyName, async (result) => {
    const apiKey = result[apiKeyName];
    if (!apiKey) {
      const errorMessage = `Error: ${selectedApi} API key not found. Please set it in the options page.`;
      responseDiv.innerText = errorMessage;
      chrome.storage.session.set({ response: errorMessage });
      return;
    }

    const askingMessage = `Asking ${selectedApi}...`;
    responseDiv.innerText = askingMessage;
    chrome.storage.session.set({ response: askingMessage });

    try {
      if (selectedApi === "gemini") {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:streamGenerateContent?key=${apiKey}&alt=sse`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: question }] }] }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        responseDiv.innerText = "";
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = "";
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop();

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const jsonStr = line.substring(6);
                const jsonObj = JSON.parse(jsonStr);
                const text = jsonObj.candidates?.[0]?.content?.parts?.[0]?.text || "";
                if (text) {
                  fullResponse += text;
                  responseDiv.innerText = fullResponse;
                  chrome.storage.session.set({ response: fullResponse });
                }
              } catch (e) {
                console.error("Failed to parse SSE chunk:", line);
              }
            }
          }
        }
      } else { // Handle non-streaming APIs
        let response, data;
        if (selectedApi === "openai") {
          response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
            body: JSON.stringify({ model: "gpt-3.5-turbo", messages: [{ role: "user", content: question }] }),
          });
          if (!response.ok) {
             const errorData = await response.json();
             throw new Error(`API Error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
          }
          data = await response.json();
          const text = data.choices[0].message.content;
          responseDiv.innerText = text;
          chrome.storage.session.set({ response: text });
        } else if (selectedApi === "anthropic") {
          response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
            body: JSON.stringify({ model: "claude-3-opus-20240229", max_tokens: 1024, messages: [{ role: "user", content: question }] }),
          });
          if (!response.ok) {
             const errorData = await response.json();
             throw new Error(`API Error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
          }
          data = await response.json();
          const text = data.content[0].text;
          responseDiv.innerText = text;
          chrome.storage.session.set({ response: text });
        }
      }
    } catch (error) {
      console.error(`Error asking ${selectedApi}:`, error);
      const errorMessage = `Error: Could not get a response from ${selectedApi}.\n${error.message}`;
      responseDiv.innerText = errorMessage;
      chrome.storage.session.set({ response: errorMessage });
    }
  });
});

optionsLink.addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

// Restore the state when the popup loads
document.addEventListener("DOMContentLoaded", restoreState);


