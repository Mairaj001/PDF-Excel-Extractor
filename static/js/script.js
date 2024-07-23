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

    // Function to hide all content divs
    function hideAllDivs() {
        questionDiv.style.display = 'none';
        settingsDiv.style.display = 'none';
    }

    // Event listener for 'Last Ten Questions' list item
    lastTenQuestionsLi.addEventListener('click', function () {
        hideAllDivs(); // Hide all divs first
        questionDiv.style.display = 'flex'; // Show the question div
    });

    // Event listener for 'Settings' list item
    settingsLi.addEventListener('click', function () {
        hideAllDivs(); // Hide all divs first
        settingsDiv.style.display = 'flex'; // Show the settings div
    });
});