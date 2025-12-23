chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "analyzeText",
    title: "Analyze with SYMPOSIUM",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "analyzeText") {
    chrome.storage.session.set({ highlightedText: info.selectionText });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "insertPrompt") {
    chrome.storage.session.set({ question: request.prompt });
  } else if (request.action === "insertHighlighted") {
    chrome.storage.session.get("highlightedText", (result) => {
      if (result.highlightedText) {
        chrome.storage.session.set({ question: result.highlightedText });
        chrome.storage.session.remove("highlightedText");
      }
    });
  }
});
