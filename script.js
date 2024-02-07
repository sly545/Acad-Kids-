document.addEventListener('DOMContentLoaded', function() {
  const sendButton = document.getElementById('sendButton');
  const messageInput = document.getElementById('messageInput');
  const chatBox = document.getElementById('chatBox');
  const playAudioButton = document.getElementById('playAudioButton'); // Bouton pour la synthèse vocale

  sendButton.addEventListener('click', function() {
      const messageText = messageInput.value.trim();
      if (messageText) {
          // Affiche le message de l'utilisateur
          displayMessage(messageText, 'user');
          // Envoie le message au serveur
          sendMessageToServer(messageText);
          // Vide le champ de saisie
          messageInput.value = '';
      }
  });

  playAudioButton.addEventListener('click', function() {
    // Assuming you have a function to get the latest audio file URL
    // This URL should be the one your backend provides after generating the audio file
    var audioUrl = 'http://localhost:5000/audio/audio-1707224102408.mp3';
    var audioPlayer = document.getElementById('audioPlayer');
    audioPlayer.src = audioUrl;
    audioPlayer.play();
});

  function sendMessageToServer(message) {
      fetch('http://localhost:5000/sendMessage', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ message: message })
      })
      .then(response => response.json())
      .then(data => {
          displayMessage(data.message, 'bot');
      })
      .catch(error => {
          console.error('Error:', error);
          displayMessage('Une erreur est survenue.', 'bot');
      });
  }

  function displayMessage(message, sender) {
      const messageDiv = document.createElement('div');
      messageDiv.textContent = message;
      messageDiv.classList.add('message', sender);
      chatBox.appendChild(messageDiv);
      // Fait défiler jusqu'en bas de la zone de chat
      chatBox.scrollTop = chatBox.scrollHeight;
  }

  function synthesizeSpeech(text) {
    fetch('http://localhost:5000/synthesizeSpeech', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: text })
    })
    .then(response => response.json())
    .then(data => {
        const audioPlayer = document.getElementById('audioPlayer'); // Ensure you have an <audio id="audioPlayer"> element in your HTML
        audioPlayer.src = data.audioUrl; // Assuming data.audioUrl is the URL to the mp3 file
        audioPlayer.play();
    })
    .catch(error => {
        console.error('Error synthesizing speech:', error);
        alert('Une erreur est survenue lors de la synthèse vocale.');
    });
  }
  

  // Reste du code pour l'affichage des images et la modal
});

// Code pour l'affichage des images et la gestion de la modal
function displayImage(imageUrl) {
  const image = new Image();
  image.src = imageUrl;
  image.classList.add('generated-image');
  image.onclick = function() {
      modal.style.display = "block";
      modalImg.src = this.src;
      captionText.innerHTML = this.alt;
  }
  chatBox.appendChild(image);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Obtenez les éléments de la modal
var modal = document.getElementById("myModal");
var modalImg = document.getElementById("img01");
var captionText = document.getElementById("caption");

// Obtenez l'élément <span> qui ferme la modal
var span = document.getElementsByClassName("close")[0];

// Quand l'utilisateur clique sur <span> (x), fermez la modal
span.onclick = function() { 
  modal.style.display = "none";
}
