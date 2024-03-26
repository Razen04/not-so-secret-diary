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

    // Function to toggle dark mode and update icons
    function toggleDarkMode() {
        document.body.classList.toggle("dark-mode");
        const isDarkMode = document.body.classList.contains("dark-mode");
        localStorage.setItem("darkMode", isDarkMode);

        // Update icons based on dark mode state
        if (isDarkMode) {
            // Dark mode is active, display sun icon
            moonIcon.style.display = "none";
            sunIcon.style.display = "inline";
        } else {
            // Dark mode is inactive, display moon icon
            moonIcon.style.display = "inline";
            sunIcon.style.display = "none";
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
const closeEl = document.getElementById("close")

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

    return now.toLocaleString('en-IN', options).replace(',', '');
}

//Function to add elements to li

function appendMessagesToLiEl() {
    const msgValue = simplemde.value();
    if (msgValue === "") {
        alert("Enter a valid message.");
        location.reload();
    } else {
        let liEl = document.createElement("li");
        liEl.className = "outside-li";
        let dateSpan = document.createElement("span");
        dateSpan.className = "message-date";
        dateSpan.textContent = formattedMsgTime();
        liEl.appendChild(dateSpan);
        liEl.appendChild(document.createElement("br"));
        liEl.appendChild(document.createTextNode(msgValue));
        containerEl.appendChild(liEl);
    }
}

//Adding message to list function
enterEl.addEventListener("click", function () {
    appendMessagesToLiEl();

});

//Adding input Field to database

document.addEventListener("DOMContentLoaded", function () {
    // Your existing code
    enterEl.addEventListener("click", function () {
        containerEl.textContent = "";
        let msgValue = simplemde.value();
        const combinedMessage = {
            timestamp: formattedMsgTime(),
            content: marked.parse(msgValue)
        };
        if (msgValue.trim() !== "") {
            push(saveMessageToDB, combinedMessage);
            simplemde.value("");
        } else {
            location.reload();
        }
    });
});



//Reloading the existing messages from database

onValue(saveMessageToDB, function (snapshot) {
    containerEl.innerHTML = "";
    if (snapshot.exists()) {
        let messagesInDB = Object.values(snapshot.val());
        for (let i = 0; i < messagesInDB.length; i++) {
            let messageValue = messagesInDB[i];
            let messageContent = messageValue.content;
            let messageTimeStamp = messageValue.timestamp;
            let liEl = document.createElement("li");
            liEl.className = "outside-li";
            let dateSpan = document.createElement("span");
            dateSpan.className = "message-date";
            dateSpan.textContent = messageTimeStamp;
            liEl.appendChild(dateSpan);
            liEl.appendChild(document.createElement("br"));
            liEl.innerHTML += messageContent;
            containerEl.appendChild(liEl);
        }
    } else {
        containerEl.innerHTML = "No messages to be displayet yet..."
    }
}
);







