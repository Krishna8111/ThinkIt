const typingForm = document.querySelector(".typing-form");
const chatContainer = document.querySelector(".chat-list");
const suggestions = document.querySelectorAll(".suggestion");
const toggleThemeButton = document.querySelector("#theme-toggle-button");
const deleteChatButton = document.querySelector("#delete-chat-button");

// State variables
let userMessage = null;
let isResponseGenerating = false;

// API configuration
const API_KEY = "AIzaSyBghsHnpl1H77t6RZsRzLLktAXsilER2y0";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

// Load theme and chat data from local storage
const loadDataFromLocalstorage = () => {
  const savedChats = localStorage.getItem("saved-chats");
  const isLightMode = (localStorage.getItem("themeColor") === "light_mode");
  document.body.classList.toggle("light_mode", isLightMode);
  toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";
  chatContainer.innerHTML = savedChats || '';
  document.body.classList.toggle("hide-header", savedChats);
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
};

// Create a new message element
const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};

// Typing effect
const showTypingEffect = (text, textElement, incomingMessageDiv) => {
  const words = text.split(' ');
  let currentWordIndex = 0;
  const typingInterval = setInterval(() => {
    textElement.innerText += (currentWordIndex === 0 ? '' : ' ') + words[currentWordIndex++];
    incomingMessageDiv.querySelector(".icon").classList.add("hide");
    if (currentWordIndex === words.length) {
      clearInterval(typingInterval);
      isResponseGenerating = false;
      incomingMessageDiv.querySelector(".icon").classList.remove("hide");
      localStorage.setItem("saved-chats", chatContainer.innerHTML);
    }
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
  }, 75);
};

// Fetch response from API
const generateAPIResponse = async (incomingMessageDiv) => {
  const textElement = incomingMessageDiv.querySelector(".text");
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [{ text: userMessage }]
        }]
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);
    const apiResponse = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, '$1');
    showTypingEffect(apiResponse, textElement, incomingMessageDiv);
  } catch (error) {
    isResponseGenerating = false;
    textElement.innerText = error.message;
    textElement.parentElement.closest(".message").classList.add("error");
  } finally {
    incomingMessageDiv.classList.remove("loading");
  }
  localStorage.setItem("saved-chats", chatContainer.innerHTML);

};

// Show loading animation
const showLoadingAnimation = () => {
  const html = `
  <div class="message-content">
    <img class="avatar" src="https://i.ibb.co/B5Qt8mH1/wp5977885.png" alt="Gemini avatar">
    <p class="text"></p>
    <div class="loading-indicator">
      <div class="loading-bar"></div>
      <div class="loading-bar"></div>
      <div class="loading-bar"></div>
    </div>
  </div>
  <span onClick="copyMessage(this)" class="icon material-symbols-rounded">content_copy</span>
  <span onClick="speakMessage(this)" class="icon material-symbols-rounded">volume_up</span>`;

  const incomingMessageDiv = createMessageElement(html, "incoming", "loading");
  chatContainer.appendChild(incomingMessageDiv);
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
  generateAPIResponse(incomingMessageDiv);
};

// Copy message
const copyMessage = (copyButton) => {
  const messageText = copyButton.parentElement.querySelector(".text").innerText;
  navigator.clipboard.writeText(messageText);
  copyButton.innerText = "done";
  setTimeout(() => copyButton.innerText = "content_copy", 1000);
};

// Send message
const handleOutgoingChat = () => {
  userMessage = typingForm.querySelector(".typing-input").value.trim() || userMessage;
  if (!userMessage || isResponseGenerating) return;
  isResponseGenerating = true;
  const html = `<div class="message-content">
                  <img class="avatar" src="https://th.bing.com/th/id/R.c3631c652abe1185b1874da24af0b7c7?rik=XBP%2fc%2fsPy7r3HQ&riu=http%3a%2f%2fpluspng.com%2fimg-png%2fpng-user-icon-circled-user-icon-2240.png&ehk=z4ciEVsNoCZtWiFvQQ0k4C3KTQ6wt%2biSysxPKZHGrCc%3d&risl=&pid=ImgRaw&r=0" alt="User avatar">
                  <p class="text"></p>
                </div>`;
  const outgoingMessageDiv = createMessageElement(html, "outgoing");
  outgoingMessageDiv.querySelector(".text").innerText = userMessage;
  chatContainer.appendChild(outgoingMessageDiv);
  typingForm.reset();
  document.body.classList.add("hide-header");
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
  setTimeout(showLoadingAnimation, 500);
};

// Theme toggle
toggleThemeButton.addEventListener("click", () => {
  const isLightMode = document.body.classList.toggle("light_mode");
  localStorage.setItem("themeColor", isLightMode ? "light_mode" : "dark_mode");
  toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";
});

// Delete chat
deleteChatButton.addEventListener("click", () => {
  if (confirm("Are you sure you want to delete all the chats?")) {
    localStorage.removeItem("saved-chats");
    loadDataFromLocalstorage();
  }
});

// Suggestions
suggestions.forEach(suggestion => {
  suggestion.addEventListener("click", () => {
    userMessage = suggestion.querySelector(".text").innerText;
    handleOutgoingChat();
  });
});

// Submit form
typingForm.addEventListener("submit", (e) => {
  e.preventDefault();
  handleOutgoingChat();
});

// Initial load
loadDataFromLocalstorage();
const island = document.getElementById("dynamicIsland");

island.addEventListener("click", () => {
  island.classList.toggle("active");
});
function togglePanel() {
  document.getElementById("dynamicIsland").classList.toggle("expanded");
}

function comingSoon() {
  const content = document.getElementById("islandContent");
  content.innerHTML = `<p style="text-align:center; padding:10px;">🚧 Coming Soon 🙏</p>`;
  
  // Optionally collapse the island after 2.5 sec
  setTimeout(() => {
    document.getElementById("dynamicIsland").classList.remove("expanded");
    content.innerHTML = `
      <button onclick="togglePanel()">☰ Options</button>
      <div id="islandOptions" class="island-options">
        <button onclick="comingSoon()">🕉️ Set Meditation Alarm</button>
        <button onclick="comingSoon()">🎵 Play Bhajans</button>
        <button onclick="comingSoon()">🌸 Live Ram Mandir Darshan</button>
      </div>`;
  }, 2500);
}
function comingSoon() {
  const content = document.getElementById("islandContent");
  content.innerHTML = `<p style="text-align:center; padding:10px;">🚧 Coming Soon 🙏</p>`;
  
  // Optionally collapse the island after 2.5 sec
  setTimeout(() => {
    document.getElementById("dynamicIsland").classList.remove("expanded");
    content.innerHTML = `
      <button onclick="togglePanel()">☰ Options</button>
      <div id="islandOptions" class="island-options">
        <button onclick="openTimer()">⏲️ Set Timer</button>
        <button onclick="showSystemStats()">💻 View System Stats</button>
        <button onclick="getWeatherInfo()">🌦️ Weather Info</button>
        <button onclick="openCodeEditor()">🖥️ Open Code Editor</button>
        <button onclick="quickSystemInfo()">🖧 Quick System Info</button>
      </div>`;
  }, 2500);
}

// Set Timer
function openTimer() {
  const content = document.getElementById("islandContent");
  content.innerHTML = `<p>Set a Timer (in seconds): <input type="number" id="timerInput" placeholder="Enter time" /></p>
                       <button onclick="startTimer()">Start Timer</button>
                       <div id="timerOutput"></div>`;
}

function startTimer() {
  const timerInput = document.getElementById("timerInput");
  const timerOutput = document.getElementById("timerOutput");
  const time = parseInt(timerInput.value);
  if (isNaN(time) || time <= 0) {
    timerOutput.innerHTML = "<p>Please enter a valid number of seconds.</p>";
    return;
  }
  timerOutput.innerHTML = `<p>Timer started for ${time} seconds...</p>`;
  setTimeout(() => {
    timerOutput.innerHTML = "<p>Time's up!</p>";
  }, time * 1000);
}

// View System Stats (Example Placeholder)
function showSystemStats() {
  const content = document.getElementById("islandContent");
  content.innerHTML = `<p>Fetching system stats...</p>`;
  
  // You can replace this part with actual system stats fetching logic if available in your app context.
  setTimeout(() => {
    content.innerHTML = `<ul>
                          <li>CPU Usage: 45%</li>
                          <li>Memory Usage: 70%</li>
                          <li>Disk Space: 60% Free</li>
                        </ul>`;
  }, 2000);
}

// Fetch Weather Info
function getWeatherInfo() {
  const content = document.getElementById("islandContent");
  content.innerHTML = `<p>Fetching weather info...</p>`;
  
  // Example API call to fetch weather data (you can use your own API)
  fetch('https://api.openweathermap.org/data/2.5/weather?q=Delhi&appid=YOUR_API_KEY')
    .then(response => response.json())
    .then(data => {
      const weatherData = data.weather[0];
      const temp = (data.main.temp - 273.15).toFixed(2); // Kelvin to Celsius
      content.innerHTML = `<h4>Weather in ${data.name}</h4>
                           <p>${weatherData.main}: ${weatherData.description}</p>
                           <p>Temperature: ${temp}°C</p>`;
    })
    .catch(() => content.innerHTML = "<p>Could not fetch weather info.</p>");
}

// Open Code Editor
function openCodeEditor() {
  const content = document.getElementById("islandContent");
  content.innerHTML = `<textarea id="codeEditor" placeholder="Write your code here..."></textarea>`;
}

// Quick System Info (for demo purposes)
function quickSystemInfo() {
  const content = document.getElementById("islandContent");
  content.innerHTML = `<ul>
                         <li>Device: ${navigator.userAgent}</li>
                         <li>OS: ${navigator.platform}</li>
                         <li>Browser: ${navigator.appName}</li>
                       </ul>`;
}
