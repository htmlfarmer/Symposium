console.log("Content script loaded.");

function checkForAIKeywords() {
  const keywords = ["AGI", "superintelligence", "orthogonality thesis", "instrumental convergence"];
  const bodyText = document.body.innerText;

  keywords.forEach(keyword => {
    if (bodyText.includes(keyword)) {
      console.log(`Found AI keyword: ${keyword}`);
      // In a real extension, you would send a message to the background script
      // to update the popup or take other actions.
    }
  });
}

checkForAIKeywords();
