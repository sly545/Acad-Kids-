// Importation des modules nécessaires
const fs = require('fs'); // Module pour interagir avec le système de fichiers
const path = require('path'); // Module pour gérer les chemins de fichiers
const express = require('express'); // Framework pour créer des applications web
const axios = require('axios'); // Module pour effectuer des requêtes HTTP
const cors = require('cors'); // Middleware pour gérer les autorisations CORS

// Configuration des variables d'environnement
require('dotenv').config();

// Initialisation de l'application Express
const app = express();

// Activation de CORS pour permettre les requêtes depuis http://127.0.0.1:5501
app.use(cors({
  origin: 'http://127.0.0.1:5501',
  optionsSuccessStatus: 200
}));

// Middleware pour analyser les corps des requêtes en JSON
app.use(express.json());

// Chemin du répertoire où seront stockés les fichiers audio
const audioDirPath = path.join(__dirname, 'audio');

// Vérification et création du répertoire s'il n'existe pas déjà
if (!fs.existsSync(audioDirPath)) {
  fs.mkdirSync(audioDirPath);
}

// Middleware pour servir les fichiers audio statiques
app.use('/audio', express.static(audioDirPath));

// Endpoint pour envoyer un message à l'API de Mistral
app.post('/sendMessage', async (req, res) => {
  const { message } = req.body; // Extraction du message depuis le corps de la requête

  // Vérification si le message est présent dans la requête
  if (!message) {
    return res.status(400).json({ error: 'No message provided.' });
  }

  try {
    console.log('Sending message to Mistral:', message);
    
    // Contexte à envoyer à l'API de Mistral c''est cette ligne qui donnerat la personaliter du professeur et sa facon d'interagire avec l'utilisateur
    const lapieContext = [
      { 
        "role": "system", 
        "content": "tu est lapie un personnage fictif qui aide les enfant a fair leur devoir"
      },
    ];
    
    // Envoi de la requête à l'API de Mistral
    const response = await axios.post(
      'https://api.mistral.ai/v1/chat/completions', // URL de l'API de Mistral
      {
        model: "mistral-medium", // Modèle utilisé pour la réponse
        messages: lapieContext.concat([{ role: "user", content: message }]), // Contexte de la conversation
        safe_prompt: false
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}` // Clé API de Mistral
        }
      }
    );

    // Récupération de la réponse de l'API de Mistral
    const lapieResponse = response.data.choices[0].message.content;
    console.log('Received response from Mistral:', lapieResponse);

    // Envoi de la réponse de l'API après nettoyage et suppression des mots "l'utilisateur"
    res.json({ message: lapieResponse });
  } catch (error) {
    // Gestion des erreurs
    console.error("Error caught in /sendMessage:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint pour synthétiser un texte en discours audio
app.post('/synthesizeSpeech', async (req, res) => {
  const { text } = req.body; // Extraction du texte depuis le corps de la requête

  // Vérification si le texte est présent dans la requête
  if (!text) {
    return res.status(400).json({ error: 'No text provided.' });
  }

  // Options de la requête vers l'API d'Eleven Labs
  const options = {
    method: 'POST',
    headers: {
      'xi-api-key': process.env.ELEVENLABS_API_KEY,
      'Content-Type': 'application/json'
    },
    data: JSON.stringify({
      text: text,
      voice_settings: {"similarity_boost":1,"stability":1,"style":0,"use_speaker_boost":true},
      model_id: "eleven_multilingual_v1",
    }),
    url: 'https://api.elevenlabs.io/v1/text-to-speech/Gg6guWsWupUVFCWFzqr2?optimize_streaming_latency=1&output_format=mp3_22050_32',
    responseType: 'arraybuffer', // Définition du type de réponse attendu comme ArrayBuffer pour la requête HTTP
    // Cela permet de traiter directement les données binaires de la réponse, utile pour les fichiers audio
  };

  try {
    // Envoi de la requête à l'API d'Eleven Labs
    const response = await axios(options);
    const audioBuffer = response.data; // Contenu du fichier audio en tant que Buffer

    // Génération d'un nom de fichier unique pour le fichier audio
    const audioFileName = `audio-${Date.now()}.mp3`;
    const audioFilePath = path.join(audioDirPath, audioFileName);
    
    // Écriture du fichier audio sur le disque
    fs.writeFileSync(audioFilePath, audioBuffer);

    // Construction de l'URL pour accéder au fichier audio
    const audioUrl = `${req.protocol}://${req.get('host')}/audio/${audioFileName}`;
   
    // Envoi de l'URL du fichier audio en réponse
    res.json({ audioUrl: audioUrl });
    console.log(audioUrl,audioBuffer);
    
  } catch (error) {
    // Gestion des erreurs
    console.error('Error synthesizing speech:', error);
    res.status(500).json({ error: 'Failed to synthesize speech' });
  }
});

// Configuration du port d'écoute du serveur
const PORT = process.env.PORT || 5000;
// Démarrage du serveur
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


