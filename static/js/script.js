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

let selectedFile = null;
let excelFile=null;
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


const responseContainer = document.getElementById('ai-response-content');
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
        
        if (query && selectedFile == null  && excelFile==null) {
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

        const formattedMessage = formatResponse(fullMessage); // Format the message
        typeWriter(textContainer, formattedMessage, 0, 10, true); // Use typewriter with HTML

        // Append speaker icon to the messageContent
        messageContent.appendChild(speakerIcon);

        // Add click event for text-to-speech
        speakerIcon.addEventListener('click', () => {
           fetchAndPlaySpeech(fullMessage)
        });
    }

    // Append messageElement to the response container
    responseContainer.appendChild(messageElement);
    responseContainer.scrollTop = responseContainer.scrollHeight; // Scroll to bottom
}

// Typewriter effect function for appending text or HTML content to an element
function typeWriter(element, text, i = 0, speed = 10, isHTML = false) {
    if (i < text.length) {
        if (isHTML) {
            // Append HTML character by character for HTML content
            element.innerHTML = text.substring(0, i + 1);
        } else {
            // Append plain text character by character
            element.textContent += text.charAt(i);
        }
        i++;
        setTimeout(() => typeWriter(element, text, i, speed, isHTML), speed);
        responseContainer.scrollTop = responseContainer.scrollHeight; // Scroll to bottom
    }
}

function fetchAndPlaySpeech(text) {
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
        audio.play();
    })
    .catch(error => {
        console.error('Error fetching or playing the speech:', error);
    });
}


// Function to format the response text fetched from the server header
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





        const pdfFileInput = document.getElementById('pdf_file');
        const queryInput = document.getElementById('question-input');
        const sendButton = document.getElementById('send-btn');
        const pdfButton = document.getElementById('send-pdf');
        const excelInputFile=document.getElementById('excel_file')
       const excelBtn=document.getElementById('send-excel')
        // const responseDiv = document.getElementById('response');

        // Open file dialog when the button is clicked
        pdfButton.addEventListener('click', () => {
            pdfFileInput.click();
        });

    

        // Display the selected file name (optional)
        pdfFileInput.addEventListener('change', () => {
            if (pdfFileInput.files.length > 0) {
                // pdfButton.textContent = `Selected: ${pdfFileInput.files[0].name}`;
                appendMessage(pdfFileInput.files[0].name, 'user-message');
                selectedFile = pdfFileInput.files[0];
            }
            
        });

        sendButton.addEventListener('click', async () => {
            
            const query = queryInput.value.trim();
            
            console.log("selectedFile",selectedFile)
            if (selectedFile==null && !query) {
                // errorMessageDiv.textContent = 'Please select a PDF file and enter a query.';
                return;
            }

            if (selectedFile==null) {
                // errorMessageDiv.textContent = 'Please select a PDF file.';
                return;
            }

            if (!query) {
                // errorMessageDiv.textContent = 'Please enter a query.';
                return;
            }
            
            appendMessage(query, 'user-message');
            console.log("pdf click")
            // Create FormData object
            const formData = new FormData();
            formData.append('pdf_file', selectedFile);
            formData.append('query', query);

            try {
                // responseDiv.textContent = 'Processing...';
                // responseDiv.classList.remove('error');

                // Send POST request to the Flask server
                const response = await fetch('/process', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log(data.response)
                    selectedFile=null;
                    pdfFileInput.files = null
                    
                    appendMessage('', 'bot-message',  data.response.replace(/^ChatGPT:\s*/, ''));
                    
                    
                    // responseDiv.textContent = data.response;
                } else {
                    const errorData = await response.json();
                    console.log(errorData.error);
                }
            } catch (error) {
                console.log(error.message);
            }
        });
    

        excelBtn.addEventListener('click',()=>{
            excelInputFile.click()
        })
        
        excelInputFile.addEventListener('change', () => {
            if (excelInputFile.files.length > 0) {
                // pdfButton.textContent = `Selected: ${pdfFileInput.files[0].name}`;
                appendMessage(excelInputFile.files[0].name, 'user-message');
                excelFile = excelInputFile.files[0];
            }
            
        });

        sendButton.addEventListener('click', async () => {
            
            const query = queryInput.value.trim();
            
            console.log("excelFile",excelFile)
            if (excelFile==null && !query) {
                // errorMessageDiv.textContent = 'Please select a PDF file and enter a query.';
                return;
            }

            if (excelFile==null) {
                // errorMessageDiv.textContent = 'Please select a PDF file.';
                return;
            }

            if (!query) {
                // errorMessageDiv.textContent = 'Please enter a query.';
                showToast("please enter any query")
                return;
            }
            
            appendMessage(query, 'user-message');
            console.log("excel click")
            // Create FormData object
            const formData = new FormData();
            formData.append('file', excelFile);
            formData.append('query', query);

            try {
                // responseDiv.textContent = 'Processing...';
                // responseDiv.classList.remove('error');

                // Send POST request to the Flask server
                const response = await fetch('/process_excel', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log(data.response)
                    excelFile=null;
                    pdfFileInput.files = null
                    excelInputFile.files=null;
                    appendMessage('', 'bot-message',  data.response.replace(/^ChatGPT:\s*/, ''));
                    
                    
                    // responseDiv.textContent = data.response;
                } else {
                    const errorData = await response.json();
                    console.log(errorData.error);
                }
            } catch (error) {
                console.log(error.message);
            }
        });
        
        function showToast(message){
            let snackbar = document.getElementById("snackbar");
          
            snackbar.classList.add("show");
             snackbar.innerHTML=message
            // Remove the 'show' class after 3 seconds to hide the snackbar
            setTimeout(function() {
                snackbar.classList.remove("show");
            }, 3000);
          }

