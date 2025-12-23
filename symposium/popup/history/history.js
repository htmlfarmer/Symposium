const historyList = document.getElementById("history-list");

chrome.storage.local.get("conversationHistory", (result) => {
  const history = result.conversationHistory || [];
  history.forEach((conversation) => {
    const listItem = document.createElement("li");
    const questionDiv = document.createElement("div");
    questionDiv.classList.add("question");
    questionDiv.innerText = `Q: ${conversation.question}`;
    const answerDiv = document.createElement("div");
    answerDiv.classList.add("answer");
    answerDiv.innerText = `A: ${conversation.answer}`;
    listItem.appendChild(questionDiv);
    listItem.appendChild(answerDiv);
    historyList.appendChild(listItem);
  });
});
