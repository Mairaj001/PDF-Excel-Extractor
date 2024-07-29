import { getActivationDeactivation,add_to_items, get_items, updateActivationDeactivation} from "./db.js";



  export  function displayQuestions(questions) {
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
    
    if (questionText) {
      console.log("send items function ")
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
    setActivationFunctionsToLocalStorage();
  });

  document.getElementById('set-default').addEventListener("click", async ()=>{
    const actviate=document.getElementById('activation')
    const deactive=document.getElementById("deactice");
    
    if(!actviate.value.trim() && !deactive.value.trim()){
      showToast("Please Fill the Activation & Deactivation Function")
      return
    }
    
    
    await updateActivationDeactivation(actviate.value.trim(),deactive.value.trim())
    

     await setActivationFunctionsToLocalStorage();

     showToast("Activation & Deactivation Function are Created")
      actviate.value=""
      deactive.value=""
    
    
     // Retrieve the activation value from localStorage


  })

 
  async function setActivationFunctionsToLocalStorage() {
    try {
        const { activation, deactivation } = await getActivationDeactivation();
        console.log(activation,deactivation)
        // Store activation and deactivation values in local storage
        if (activation !== null) {
            localStorage.setItem('activation', activation);
        } else {
            localStorage.setItem('activation', 'null');
        }

        if (deactivation !== null) {
            localStorage.setItem('deactivation', deactivation);
        } else {
            localStorage.setItem('deactivation', 'null');
        }
        
        console.log('Activation and Deactivation values have been stored in local storage.');
    } catch (error) {
        console.error('Error setting activation and deactivation functions to local storage:', error);
    }
}

// Example of how to call the function
