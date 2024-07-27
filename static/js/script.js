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
        
        if (query && selectedFile == null) {
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





document.addEventListener("DOMContentLoaded", function () {
    const pdfInput = document.getElementById("pdf_file");
    const sendPdfButton = document.getElementById("send-pdf");
    const queryInput = document.getElementById("question-input");
    const resultDiv = document.getElementById("result");
    const qaAnswer = document.getElementById("qa_answer");
    const gptExplanation = document.getElementById("gpt_explanation");

    

    // Open file picker when "Send Pdf" button is clicked
    sendPdfButton.addEventListener("click", function () {
        pdfInput.click();
    });

    // Store the selected file
    pdfInput.addEventListener("change", function () {
        if (pdfInput.files.length > 0) {
            selectedFile = pdfInput.files[0];
            // alert("File selected. Now enter your query and press 'Send' to submit.");
        }
    });

    // Handle form submission
    document.getElementById("send-btn").addEventListener("click", function () {
        // Check if file is selected and query is not empty
        if (!selectedFile) {
            //  alert("Please select a PDF file.");
            return;
        }
        if (queryInput.value.trim() === "") {
            alert("Please enter a query.");
            return;
        }

        const formData = new FormData();
        formData.append("pdf_file", selectedFile);
        formData.append("query", queryInput.value);

        fetch("/process_pdf", {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error(data.error);
            } else {
                console.log(data.response.qa_answer, data.response.gpt_explanation);
                // qaAnswer.textContent = data.response.qa_answer;
                // gptExplanation.textContent = data.response.gpt_explanation;
                // resultDiv.style.display = "block";
                selectedFile=null;
            }
        })
        .catch(error => {
            console.error("An error occurred:", error.message);
        });
    });
});


document.addEventListener("DOMContentLoaded",()=>{
    const submitButton=document.getElementById('send-btn');
    const excel_btn=document.getElementById('send-excel')
    const excel_file=document.getElementById("excel_file");
    
    excel_btn.addEventListener("click",()=>{
        excel_file.click();
    })

    excel_file.addEventListener("change",()=>{
        if(excel_file.files.length > 0){
            selectedFile=excel_file.files[0];
        }
    })
    
    submitButton.addEventListener("click", async ()=>{
        let query=document.getElementById('question-input').value;
        
        if(!selectedFile){
            return
        }
        if(selectedFile && !query){
            alert("Please enter the query");
        }

        const formData = new FormData();
        formData.append('excel_file', selectedFile);
        formData.append('query', query);

        try {
            // Make the POST request using Fetch API
            const response = await fetch('/process_excel', {
                method: 'POST',
                body: formData
            });

            // Parse the JSON response
            const data = await response.json();

            // Check if the response is ok
            if (response.ok) {
                console.log(data.response)
                // document.getElementById('response').innerHTML = '<div class="alert alert-success">' + data.response + '</div>';
            } else {
                console.log(data.error)
                // document.getElementById('response').innerHTML = '<div class="alert alert-danger">Error: ' + data.error + '</div>';
            }
        } catch (error) {
            console.log(error.message);
            // Handle any errors
            // document.getElementById('response').innerHTML = '<div class="alert alert-danger">An unexpected error occurred: ' + error.message + '</div>';
        }
    })


})