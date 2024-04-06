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


const config = {
    ALLOWED_TAGS: [], 
    ALLOWED_ATTR: []  
};


//Markdown-feature in Textarea


var simplemde = new SimpleMDE({
    element: document.getElementById("message-el"),
    placeholder: "Write your not so secret message here....",
    hideIcons: ["fullscreen", "side-by-side", "image"],
    indentWithTabs: true,
    showIcons: ["code", "table"],
    renderingConfig: {
        codeSyntaxHighlighting: false,
    },
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


let lastEntryTime = 0;
const timeoutDuration = 5 * 60 * 1000;


const app = initializeApp(appSettings);
const database = getDatabase(app);
const saveMessageToDB = ref(database, "secretMessage");

// HTML elements

const enterEl = document.getElementById("enter-el");
const containerEl = document.getElementById("container-el");
const infoEl = document.getElementById("info");
const closeEl = document.getElementById("close");
let username = document.getElementById('name-input');
let totalEntries = document.getElementById('total-entries');


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
    messageBubble.innerHTML = messageContent;
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
    const currentTime = Date.now();

    if (currentTime - lastEntryTime >= timeoutDuration) {
        const msgValue = simplemde.value();
        const sanitizedContent = DOMPurify.sanitize(msgValue, config);

        if (msgValue.trim() === "") {
            alert("Enter a valid message.");
            location.reload();
            return;
        }

        const usernameValue = username.value.trim();
        const sanitizedUserName = DOMPurify.sanitize(usernameValue, config);

        const name = sanitizedUserName !== "" ? sanitizedUserName : "Anonymous";

        const combinedMessage = {
            sender: name,
            timestamp: formattedMsgTime(),
            content: marked(sanitizedContent)
        };

        push(saveMessageToDB, combinedMessage);

        simplemde.value("");
        username.value = "";

        lastEntryTime = currentTime;
    } else {
        alert(`You must wait ${Math.ceil((timeoutDuration - (currentTime - lastEntryTime)) / 1000)} seconds before submitting another entry.`);
    }



});

// Reloading the existing messages from the database
onValue(saveMessageToDB, function (snapshot) {
    containerEl.innerHTML = "";
    let totalCount = 0;
    if (snapshot.exists()) {
        const messagesInDB = Object.values(snapshot.val());
        totalCount = messagesInDB.length;
        messagesInDB.forEach(message => {
            const sender = message.sender || "Anonymous";
            appendMessagesToLiEl(marked(message.content.replace(/\n/g, "<br>")), message.timestamp, sender);
        });
    } else {
        containerEl.innerHTML = "No messages to be displayed yet...";
    }
    totalEntries.textContent = "Total Entries Made: " + totalCount;
});


// Fetch old entries and their unique IDs from the database

/* onValue(saveMessageToDB, (snapshot) => {
        const entries = snapshot.val();
        if (entries) {
            Object.keys(entries).forEach((entryId) => {
                console.log(`Entry ID: ${entryId}`);
            });
        }
}); */










