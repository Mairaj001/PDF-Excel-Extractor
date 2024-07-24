document.addEventListener('DOMContentLoaded', () => {
    const socket = io();  // Connect to the server

    const micButton = document.getElementById('mic-button');
    const label = document.getElementById('mic-label');
    let isActive = false;

    micButton.addEventListener('click', () => {
        fetch(isActive ? '/stop-voice-activation' : '/start-voice-activation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(result => {
            if (result.error) {
                console.error('Error:', result.error);
            } else {
                isActive = !isActive;
                updateButtonState();
                console.log(`${isActive ? 'Started' : 'Stopped'} voice activation.`);
            }
        })
        .catch(error => console.error('Error toggling voice activation:', error));
    });

    function updateButtonState() {
        if (isActive) {
            micButton.classList.add('active');
            label.textContent = 'Mute';
        } else {
            micButton.classList.remove('active');
            label.textContent = 'Unmute';
        }
    }

    socket.on('assistant_message', (data) => {
        const messagesDiv = document.getElementById('messages');
        const messageElement = document.createElement('div');
        messageElement.textContent = data.message;
        messagesDiv.appendChild(messageElement);
    });
});