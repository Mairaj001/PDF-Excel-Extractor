import { add_to_items, get_items} from "./db.js";



  function displayQuestions(questions) {
    const container = document.getElementById('questions-container');
    container.innerHTML = ''; // Clear existing content
  
    // Sort questions by timestamp in descending order
    
     questions.reverse()
    // Append questions to the container
    questions.forEach(question => {
      const questionElement = document.createElement('div');
      questionElement.className = 'question';
  
      const imgElement = document.createElement('div');
      imgElement.className = 'img';
      const img = document.createElement('img');
      img.src = '/static/images/light-bulb.png'; // Path to the image
      img.alt = '';
      imgElement.appendChild(img);
  
      const span = document.createElement('span');
      span.textContent = question;
  
      questionElement.appendChild(imgElement);
      questionElement.appendChild(span);
  
      container.appendChild(questionElement);
    });
  }
  
  // Function to handle the submit button click
  document.getElementById('send-btn').addEventListener('click', async () => {
    const input = document.getElementById('question-input');
    const questionText = input.value.trim();
    console.log("send")
    if (questionText) {
      await add_to_items(questionText); // Add item to Firebase
      input.value = ''; // Clear the input field
      const questions = await get_items(); // Fetch updated items
      displayQuestions(questions); // Update the display
    }
  });
  
  // Initial display when page loads
  document.addEventListener('DOMContentLoaded', async () => {
    const questions = await get_items(); // Fetch items from Firebase
    console.log(questions)
    displayQuestions(questions); // Display questions on page load
  });