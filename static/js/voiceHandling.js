import { add_to_items , get_items} from "./db.js";
import { displayQuestions } from "./Dbhandler.js";
const responseContainer = document.getElementById('ai-response-content');



document.addEventListener("DOMContentLoaded", function() {
    const socket = io.connect('http://localhost:5000');
    
    let isListening = false;
    window.onload = () => {
        
         isListening = false;
         disableChatActivation();
    };

    // Function to disable chat activation
    function disableChatActivation() {
        localStorage.setItem('chat_activated', 'false'); // Ensure chat_activated is set to false
    
    }
   

    // Function to handle the mic button click
    document.getElementById('mic-button').addEventListener('click', function() {
        if (isListening) {
            stopVoiceActivation();
            disableChatActivation();
        } else {
            startVoiceActivation();
        }
        isListening = !isListening;
    });

    // Function to start voice activation
    function startVoiceActivation() {
        const activation = localStorage.getItem('activation') || null;
        const deactivation = localStorage.getItem('deactivation') || null;

        if (activation === null || deactivation === null) {
            alert("Please set the activation and deactivation words.");
            return;
        }

        document.getElementById('mic-label').textContent = "Mute";
        document.getElementById('mic').classList.remove('fa-microphone-slash');
        document.getElementById('mic').classList.add('fa-microphone');
        

        fetch('/start-voice-activation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ activation, deactivation })
        })
            .then(response => response.json())
            .then(data => {
                console.log(data.message);
                // Update UI for mic button
               
            })
            .catch(error => console.error('Error:', error));
    }

    // Function to stop voice activation
    function stopVoiceActivation() {
        fetch('/stop-voice-activation', { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                console.log(data.message);
                // Disable chat activation when stopping voice activation
                disableChatActivation();
                // Update UI for mic button
                document.getElementById('mic-label').textContent = "Unmute";
                document.getElementById('mic').classList.remove('fa-microphone');
                document.getElementById('mic').classList.add('fa-microphone-slash');
            })
            .catch(error => console.error('Error during stop activation:', error));
    }

    // Function to handle the incoming assistant message
    socket.on('assistant_message', async function(data) {
        console.log('Assistant:', data.message);
        // Check if chat is activated before showing the assistant message
        const chatActivated = localStorage.getItem('chat_activated') === 'true';
        if (chatActivated && data.message !== "Could not understand audio.") {
            appendMessage('', 'bot-message', data.message.replace(/^ChatGPT:\s*/, ''));
        }
        if(data.message=="Goodbye!"){
            stopVoiceActivation();
        }
    });

    // Function to handle the incoming user message
    socket.on('user_message', async (data) => {
        console.log('User:', data.message);
        
        // Retrieve activation and deactivation words from local storage
        const activationWord = localStorage.getItem('activation');
        const deactivationWord = localStorage.getItem('deactivation');
        const chatActivated = localStorage.getItem('chat_activated') === 'true';

        // Debugging: Check what the activation and deactivation words and message are
        console.log('Activation word from localStorage:', activationWord);
        console.log('Deactivation word from localStorage:', deactivationWord);
        console.log('Received message:', data.message);

        // Ensure activation_word is not null
        if (activationWord === null) {
            console.warn('Activation word is not set in local storage.');
            return; // Or handle the null case appropriately
        }

        // Ensure deactivation_word is not null
        if (deactivationWord === null) {
            console.warn('Deactivation word is not set in local storage.');
            return; // Or handle the null case appropriately
        }

        // Trim whitespace and convert both to lowercase for case-insensitive comparison
        const normalizedActivationWord = activationWord.trim().toLowerCase();
        const normalizedDeactivationWord = deactivationWord.trim().toLowerCase();
        const normalizedMessage = data.message.trim().toLowerCase();

        // Check for activation word
        if (normalizedActivationWord === normalizedMessage) {
            showToast("Activation word is enabled");
            // Set flag in local storage indicating that the chat is now activated
            localStorage.setItem('chat_activated', 'true');
            return;
        }

        // Check for deactivation word
        if (normalizedDeactivationWord === normalizedMessage) {
            showToast("Deactivation Word is enabled");
            // Set flag in local storage indicating that the chat is now deactivated
            localStorage.setItem('chat_activated', 'false');
            stopVoiceActivation(); // Ensure we call the stop function to handle UI and backend
            isListening = !isListening; // Explicitly set isListening to false
            return;
        }

        // Check if chat is activated
        if (!chatActivated) {
            showToast("No match with the activation word");
            return;
        }

        // If the message doesn't match the activation word, but chat is activated, proceed
        appendMessage(data.message, 'user-message');
        await add_to_items(data.message);
        const questions = await get_items(); // Fetch items from Firebase
        console.log(questions);
        displayQuestions(questions);
    });
});

window.onload = function() {
    if (performance.navigation.type === 1) {
      // Page was reloaded
      console.log('Page reloaded!');
      // Execute your action here
    }
  };
function appendMessage(message, className, fullMessage = '') {
    const messageElement = document.createElement('div');
    messageElement.classList.add(className);

    const iconElement = document.createElement('div');
    iconElement.classList.add('icon');

    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');

    // Separate text container within messageContent
    const textContainer = document.createElement('div');
    textContainer.classList.add('text-container');

    const speakerIcon = document.createElement('div');
    speakerIcon.classList.add('speaker-icon');
    speakerIcon.innerHTML = '<i class="fas fa-volume-up"></i>'; // Speaker icon
    
    const spinner = document.createElement('div');
    spinner.classList.add('spinner'); // Spinner element
    spinner.id="spinner"
    // Append elements based on the message type
    messageElement.appendChild(iconElement);
    messageElement.appendChild(messageContent);
    messageContent.appendChild(textContainer);

    if (className === 'user-message') {
        // User message configuration
        iconElement.innerHTML = '<i class="fas fa-user"></i>'; // User icon
        textContainer.textContent = message; // Add text directly to textContainer
    } else {
        // Bot message configuration
        const botImage = document.createElement('img');
        botImage.classList.add("bot-image")
        botImage.src = 'static/images/logo.png'; // Replace with the path to your bot image
        botImage.alt = 'Bot Icon';
        iconElement.appendChild(botImage);
        const formattedMessage = formatResponse(fullMessage);
        typeWriter(textContainer, formattedMessage, 0, 10, true, () => {
            // Re-enable input and button once typewriter effect is done
            document.getElementById('question-input').disabled = false;
            document.getElementById('send-btn').disabled = false;
            document.getElementById('send-pdf').disabled=false;
            document.getElementById('send-excel').disabled=false;
        }); // Use typewriter with HTML // Use typewriter for bot messages

        // Append speaker icon to the messageContent
        messageContent.appendChild(speakerIcon);
        messageContent.appendChild(spinner)
        // Add click event for text-to-speech
        speakerIcon.addEventListener('click', () => {
            spinner.style.display = 'inline-block';
            fetchAndPlaySpeech(fullMessage)
        });
    }

    // Append messageElement to the response container
    responseContainer.appendChild(messageElement);
    responseContainer.scrollTop = responseContainer.scrollHeight; // Scroll to bottom
}

function typeWriter(element, text, i = 0, speed = 10, isHTML = false, callback = null) {
    if (i < text.length) {
        if (isHTML) {
            // Append HTML character by character for HTML content
            element.innerHTML = text.substring(0, i + 1);
        } else {
            // Append plain text character by character
            element.textContent += text.charAt(i);
        }
        i++;
        setTimeout(() => typeWriter(element, text, i, speed, isHTML, callback), speed);
        responseContainer.scrollTop = responseContainer.scrollHeight; // Scroll to bottom
    } else {
        // Call the callback function if provided once the typing animation is complete
        if (typeof callback === 'function') {
            callback();
        }
    }
}

function fetchAndPlaySpeech(text, spinner) {
    
    fetch('/generate_speech', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: text })
    })
    .then(response => response.blob())  // Handle the response as a blob
    .then(blob => {
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        
        // Hide the spinner when the audio starts playing
        audio.onplaying = () => {
            document.getElementById('spinner').style.display = 'none';
        };

        // Hide the spinner if there's an error
        audio.onerror = () => {
            document.getElementById('spinner').style.display = 'none';
            console.error('Error playing audio.');
        };

        audio.play();
    })
    .catch(error => {
        console.error('Error fetching or playing the speech:', error);
        // Hide the spinner if there's an error
        spinner.style.display = 'none';
    });
}

function showToast(message){
  let snackbar = document.getElementById("snackbar");

  snackbar.classList.add("show");
   snackbar.innerHTML=message
  // Remove the 'show' class after 3 seconds to hide the snackbar
  setTimeout(function() {
      snackbar.classList.remove("show");
  }, 3000);
}


function formatResponse(text) {
    // Split the text into lines for easier processing
    const lines = text.split('\n');

    // Process each line
    const formattedLines = lines.map(line => {
        // Handle bold text markers (e.g., wrapping text with asterisks `*`)
        let formattedLine = handleBold(line);

        // Format headers and subheadings
        if (line.startsWith('### ')) {
            // Main heading (Level 3)
            formattedLine = `<h3>${formattedLine.slice(4).trim()}</h3>`;
        } else if (line.startsWith('#### ')) {
            // Subheading (Level 4)
            formattedLine = `<h4>${formattedLine.slice(5).trim()}</h4>`;
        } else if (line.startsWith('##### ')) {
            // Sub-subheading (Level 5)
            formattedLine = `<h5>${formattedLine.slice(6).trim()}</h5>`;
        } else if (line.startsWith('- ')) {
            // List item
            formattedLine = `<li>${formattedLine.slice(2).trim()}</li>`;
        } else if (line.startsWith('1. ')) {
            // Ordered list item
            formattedLine = `<li>${formattedLine.slice(3).trim()}</li>`;
        } else {
            // Convert inline math to HTML entities
            formattedLine = formattedLine.replace(/\[(.*?)\]/g, '&#91;$1&#93;');
        }

        return formattedLine;
    });

    // Join the formatted lines into a single formatted response
    const formattedResponse = formattedLines.join('\n');

    // If there are list items, wrap them in <ul> or <ol> tags
    return wrapListItems(formattedResponse);
}

// Convert markers for bold text in the response string into HTML <strong> tags
function handleBold(text) {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

// Wrap list items with <ul> or <ol> tags based on the content
function wrapListItems(text) {
    const unorderedListRegex = /(?:^|\n)- (.*?)(?=\n|$)/g;
    const orderedListRegex = /(?:^|\n)\d+\. (.*?)(?=\n|$)/g;

    // Replace unordered list items with <ul> and <li> tags
    if (unorderedListRegex.test(text)) {
        text = text.replace(unorderedListRegex, '<li>$1</li>');
        text = `<ul>${text}</ul>`;
    }

    // Replace ordered list items with <ol> and <li> tags
    if (orderedListRegex.test(text)) {
        text = text.replace(orderedListRegex, '<li>$1</li>');
        text = `<ol>${text}</ol>`;
    }

    return text;
}

