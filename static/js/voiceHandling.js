
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

    socket.on('user_message', (data)=>{
        console.log('user:', data.message);
        appendMessage(data.message, 'user-message');

    })
});



function appendMessage(message, className, fullMessage = '') {
    const messageElement = document.createElement('div');
    messageElement.classList.add(className);

    const iconElement = document.createElement('div');
    iconElement.classList.add('icon');

    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');
    messageElement.appendChild(iconElement);
    messageElement.appendChild(messageContent);

    if (className === 'user-message') {
        iconElement.innerHTML = '<i class="fas fa-user"></i>'; // User icon
        messageContent.textContent = message;
    } else {
        iconElement.innerHTML = '<i class="fas fa-robot"></i>'; // Bot icon
        typeWriter(messageContent, fullMessage);
    }

    responseContainer.appendChild(messageElement);
    responseContainer.scrollTop = responseContainer.scrollHeight; // Scroll to bottom
}

function typeWriter(element, text, i = 0, speed = 10) {
    if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(() => typeWriter(element, text, i, speed), speed);
        responseContainer.scrollTop = responseContainer.scrollHeight; // Scroll to bottom
    }
}