// Attend que le DOM soit entièrement chargé avant d'exécuter le script
document.addEventListener('DOMContentLoaded', function() {
    // Récupération des éléments du DOM
    const sendButton = document.getElementById('sendButton');
    const messageInput = document.getElementById('messageInput');
    const chatBox = document.getElementById('chatBox');
    const playAudioButton = document.getElementById('playAudioButton');
    const audioPlayer = document.getElementById('audioPlayer');
    
    // Gestion de l'événement de clic sur le bouton d'envoi de message
    sendButton.addEventListener('click', function() {
        const messageText = messageInput.value.trim();
        if (messageText) {
            displayMessage(messageText, 'user'); // Affiche le message de l'utilisateur dans la boîte de chat
            sendMessageToServer(messageText); // Envoie le message au serveur
            messageInput.value = ''; // Efface le champ de saisie
        }
        console.log(messageText);
    });

    // Envoie le message au serveur via une requête fetch
    function sendMessageToServer(message) {
        fetch('http://localhost:5000/sendMessage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: message }) // Envoie le message sous forme de JSON
        })
        .then(response => response.json())
        .then(data => {
            displayMessage(data.message, 'bot'); // Affiche la réponse du serveur dans la boîte de chat
        })
        .catch(error => {
            console.error('Error:', error);
            displayMessage('Une erreur est survenue.', 'bot'); // Affiche un message d'erreur en cas de problème
        });
    }

    // Gestion de l'événement de clic sur le bouton de lecture audio
    playAudioButton.addEventListener('click', function() {
        // Récupère le texte du dernier message dans la boîte de chat
        const lastMessage = chatBox.lastElementChild ? chatBox.lastElementChild.textContent : 'Pas de message';
        fetch('http://localhost:5000/synthesizeSpeech', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: "lastMessage" }) // Envoie le texte au serveur pour synthétiser le discours ps j'ai mis des guillemet pour pas que sa ùme crame mes carcther pour l'api
        })
        .then(response => response.json())
        .then(data => {
            audioPlayer.src = data.audioUrl; // Définit la source du lecteur audio avec l'URL retournée par le serveur
            audioPlayer.play(); // Joue le fichier audio
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });

    // Fonction pour afficher les messages dans la boîte de chat
    function displayMessage(message, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.textContent = message;
        messageDiv.classList.add('message', sender); // Ajoute une classe CSS pour le style du message
        chatBox.appendChild(messageDiv); // Ajoute le message à la boîte de chat
        chatBox.scrollTop = chatBox.scrollHeight; // Fait défiler la boîte de chat vers le bas pour afficher le nouveau message
    }
});









