console.log("Background script loaded.");

chrome.runtime.onInstalled.addListener(() => {
  console.log("AI Alignment Checker extension installed.");
});
