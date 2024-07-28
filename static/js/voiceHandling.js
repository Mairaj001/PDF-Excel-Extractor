import { add_to_items , get_items} from "./db.js";
import { displayQuestions } from "./Dbhandler.js";
const responseContainer = document.getElementById('ai-response-content');
document.addEventListener("DOMContentLoaded", function() {
    const socket = io.connect('http://localhost:5000');
    
    let isListening = false;

    fetch('/stop-voice-activation', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            console.log(data.message);
            
        })
        .catch(error => console.error('Error during stop activation:', error));

    
    
    document.getElementById('mic-button').addEventListener('click', function() {
        if (isListening) {
            
            fetch('/stop-voice-activation', { method: 'POST' })
                .then(response => response.json())
                .then(data => {
                    console.log(data.message);
                    
                })
                .catch(error => console.error('Error:', error));
        } else {
            const activation = localStorage.getItem('activation') || null;
            const deactivation = localStorage.getItem('deactivation') || null;

            if(activation==null && deactivation==null){
                alert("plaease set the actvation and deactivation word");
                return
            }
            
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
                    
                })
                .catch(error => console.error('Error:', error));
        }
        isListening = !isListening;
    });

    socket.on('assistant_message', function(data) {
        console.log('Assistant:', data.message);
        if (data.message !== "Could not understand audio."){
        appendMessage('', 'bot-message',  data.message.replace(/^ChatGPT:\s*/, ''));
        }
    });

    socket.on('user_message', async (data) => {
        console.log('user:', data.message);
    
        // Retrieve activation word from local storage
        const activation_word = localStorage.getItem('activation');
    
        // Debugging: Check what the activation word and message are
        console.log('Activation word from localStorage:', activation_word);
        console.log('Received message:', data.message);
    
        // Ensure activation_word is not null
        if (activation_word === null) {
            console.warn('Activation word is not set in local storage.');
            return; // Or handle the null case appropriately
        }
    
        // Trim whitespace and convert both to lowercase for case-insensitive comparison
        if (activation_word.trim().toLowerCase() === data.message.trim().toLowerCase()) {
            showToast("actvation word activated")
            return;
        }
    
        // If the message doesn't match the activation word, proceed
        appendMessage(data.message, 'user-message');
       await  add_to_items(data.message);
       const questions = await get_items(); // Fetch items from Firebase
         console.log(questions)
        displayQuestions(questions);
    });
});



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
        iconElement.innerHTML = '<i class="fas fa-robot"></i>'; // Bot icon
        typeWriter(textContainer, fullMessage); // Use typewriter for bot messages

        // Append speaker icon to the messageContent
        messageContent.appendChild(speakerIcon);

        // Add click event for text-to-speech
        speakerIcon.addEventListener('click', () => {
            const utterance = new SpeechSynthesisUtterance(fullMessage);
            speechSynthesis.speak(utterance);
        });
    }

    // Append messageElement to the response container
    responseContainer.appendChild(messageElement);
    responseContainer.scrollTop = responseContainer.scrollHeight; // Scroll to bottom
}

function typeWriter(element, text, i = 0, speed = 10) {
    if (i < text.length) {
        element.textContent += text.charAt(i); // Append each character
        i++;
        setTimeout(() => typeWriter(element, text, i, speed), speed);
        responseContainer.scrollTop = responseContainer.scrollHeight; // Scroll to bottom
    }
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