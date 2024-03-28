import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
    getDatabase,
    ref,
    push,
    onValue,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
const appSettings = {
    databaseURL:
        "https://not-so-secret-diary-default-rtdb.asia-southeast1.firebasedatabase.app/",
};


//Markdown-feature in Textarea


var simplemde = new SimpleMDE({
    element: document.getElementById("message-el")
});
simplemde.isPreviewActive();

//Toggle between dark and light mode

document.addEventListener("DOMContentLoaded", function () {
    const moonIcon = document.querySelector(".moonIcon");
    const sunIcon = document.querySelector(".sunIcon");
    function toggleDarkMode() {
        document.body.classList.toggle("light-mode");
        const isLightMode = document.body.classList.contains("light-mode");
        localStorage.setItem("lightMode", isLightMode);
        if (isDarkMode) {
            moonIcon.style.display = "inline";
            sunIcon.style.display = "none";
            localStorage.setItem("theme", "light");
        } else {
            moonIcon.style.display = "none";
            sunIcon.style.display = "inline";
            localStorage.removeItem("theme");
        }
        
    }

    // Event listener for clicking on the sun icon
    sunIcon.addEventListener("click", toggleDarkMode);
    moonIcon.addEventListener("click", toggleDarkMode);
});




const app = initializeApp(appSettings);
const database = getDatabase(app);
const saveMessageToDB = ref(database, "secretMessage");

// HTML elements

const enterEl = document.getElementById("enter-el");
const containerEl = document.getElementById("container-el");
const infoEl = document.getElementById("info");
const closeEl = document.getElementById("close");
let username = document.getElementById('name-input');

//info tab

infoEl.addEventListener("click", function () {
    const popupContainer = document.getElementById("popupContainer");
    popupContainer.style.display = "flex";
})

// Close Popup Function
closeEl.addEventListener("click", function () {
    const popupContainer = document.getElementById("popupContainer");
    popupContainer.style.display = "none";
})

//Function for Message Timing
function formattedMsgTime() {
    const now = new Date();
    const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    return now.toLocaleString('en-IN', " • " + options).replace(',', '');
}


// Function to append messages to the list
function appendMessagesToLiEl(messageContent, messageTimeStamp, messageUsername) {
    let liEl = document.createElement("div");
    liEl.className = "message-item"; // Apply a class for styling

    // Create and append sender's name
    let senderSpan = document.createElement("div");
    senderSpan.className = "sender-name";
    senderSpan.textContent = messageUsername;
    liEl.appendChild(senderSpan);

    // Create and append message content
    let messageBubble = document.createElement("div");
    messageBubble.className = "message-bubble";
    messageBubble.innerHTML = marked(messageContent.replace(/\n/g, "<br>"));
    liEl.appendChild(messageBubble);

    // Create and append message timestamp
    let timestampSpan = document.createElement("div");
    timestampSpan.className = "message-timestamp";
    timestampSpan.textContent = messageTimeStamp;
    liEl.appendChild(timestampSpan);

    // Append the message element to the container
    containerEl.appendChild(liEl);
}


// Adding message to list function
enterEl.addEventListener("click", function () {
    const msgValue = simplemde.value();
    if (msgValue.trim() === "") {
        alert("Enter a valid message.");
        location.reload();
        return; // Exit the function early if the message is empty
    }

    console.log(msgValue)

    // Get the username from the input field
    const usernameValue = username.value.trim();
    const name = usernameValue !== "" ? usernameValue : "Anonymous";

    // Create the combined message object
    const combinedMessage = {
        sender: name,
        timestamp: formattedMsgTime(),
        content: msgValue
    };

    // Push the message to the database
    push(saveMessageToDB, combinedMessage);

    // Clear the message input field
    simplemde.value("");
    username.value = "";
});

// Reloading the existing messages from the database
onValue(saveMessageToDB, function (snapshot) {
    containerEl.innerHTML = "";
    if (snapshot.exists()) {
        const messagesInDB = Object.values(snapshot.val());
        messagesInDB.forEach(message => {
            const sender = message.sender || "Anonymous";
            appendMessagesToLiEl(message.content, message.timestamp,sender);
        });
    } else {
        containerEl.innerHTML = "No messages to be displayed yet...";
    }
});







