document.getElementById('mic-button').addEventListener('click', function() {
    const micButton = document.getElementById('mic-button');
    const icon = micButton.querySelector('i');
    const label = document.getElementById('mic-label');
    if (icon.classList.contains('fa-microphone')) {
        icon.classList.remove('fa-microphone');
        icon.classList.add('fa-microphone-slash');
        label.innerText = 'Unmute';
    } else {
        icon.classList.remove('fa-microphone-slash');
        icon.classList.add('fa-microphone');
        label.innerText = 'Mute';
    }
});


document.addEventListener('DOMContentLoaded', function () {
    // Get references to the list items and content divs
    const lastTenQuestionsLi = document.getElementById('last-ten-q');
    const settingsLi = document.getElementById('Settings');
    const questionDiv = document.getElementById('question_div');
    const settingsDiv = document.getElementById('settings_div');
    const dash=document.getElementById('toggle-divs');
    // Function to hide all content divs
    const back_btn=document.getElementById('back-btn');
    const back_btn1=document.getElementById('back-btn1');
    function hideAllDivs() {
        questionDiv.style.display = 'none';
        settingsDiv.style.display = 'none';
    }
    dash.classList.add('active')

    // Function to reset all list items to default color
    function resetActiveClass() {
        lastTenQuestionsLi.classList.remove('active');
        settingsLi.classList.remove('active');
        dash.classList.remove('active')
    }

    // Event listener for 'Last Ten Questions' list item
    lastTenQuestionsLi.addEventListener('click', function () {
        hideAllDivs(); // Hide all divs first
        questionDiv.style.display = 'flex'; // Show the question div
        resetActiveClass(); // Reset all list items to default
        lastTenQuestionsLi.classList.add('active'); // Highlight selected item
    });

    // Event listener for 'Settings' list item
    settingsLi.addEventListener('click', function () {
        hideAllDivs(); // Hide all divs first
        settingsDiv.style.display = 'flex'; // Show the settings div
        resetActiveClass(); // Reset all list items to default
        settingsLi.classList.add('active'); // Highlight selected item
    });

    dash.addEventListener('click',()=>{
        hideAllDivs();
        resetActiveClass()
        dash.classList.add('active')
    })
    back_btn.addEventListener('click',()=>{
        hideAllDivs();
        resetActiveClass();
        dash.classList.add('active')
    })
    back_btn1.addEventListener('click',()=>{
        hideAllDivs();
        resetActiveClass();
        dash.classList.add('active')
    })
});



document.addEventListener('DOMContentLoaded', function() {
    const sendBtn = document.getElementById('send-btn');
    const userInput = document.getElementById('question-input');
    const responseContainer = document.getElementById('ai-response-content');
    
    sendBtn.addEventListener('click', sendMessage);

    userInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    function sendMessage() {
        const query = userInput.value.trim();
        
        if (query) {
            // Append user's message with icon
            appendMessage(query, 'user-message');
            userInput.value = ''; // Clear input field

            // Send a POST request to the Flask server
            fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: query }),
            })
            .then(response => response.json())
            .then(data => {
                // Append bot's response with typewriter effect
                appendMessage('', 'bot-message',  data.response.replace(/^ChatGPT:\s*/, ''));
            })
            .catch(error => {
                console.error('Error:', error);
                appendMessage('Sorry, something went wrong.', 'bot-message');
            });
        }
    }

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
});
