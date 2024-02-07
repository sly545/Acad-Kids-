const fs = require('fs');
const path = require('path');
const express = require('express');
const axios = require('axios');
const cors = require('cors');

require('dotenv').config();
const app = express();

app.use(cors({
  origin: 'http://127.0.0.1:5501',
  optionsSuccessStatus: 200
}));
app.use(express.json());

const audioDirPath = path.join(__dirname, 'audio');
if (!fs.existsSync(audioDirPath)) {
  fs.mkdirSync(audioDirPath);
}

app.use('/audio', express.static(audioDirPath));
app.post('/sendMessage', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'No message provided.' });
  }

  try {
    console.log('Sending message to Mistral:', message);
    
    const lapieContext = [
      { 
        "role": "system", 
        "content": "tu est la pour que je test une api tu repondra salut ne mes aucune note de plus"
      },
  
    ];
    
    // Envoi de la requête à l'API de Mistral avec le contexte de Linda
    const response = await axios.post(
      'https://api.mistral.ai/v1/chat/completions', // URL de l'API de Mistral
      {
        model: "mistral-medium", // ou autre modèle selon votre abonnement
        messages: lapieContext.concat([{ role: "user", content: message }]),
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
    console.error("Error caught in /sendMessage:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post('/synthesizeSpeech', async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'No text provided.' });
  }

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
    responseType: 'arraybuffer', // Important pour recevoir le flux en tant que Buffer
  };

  try {
    const response = await axios(options);
    const audioBuffer = response.data; // C'est un Buffer contenant les données audio

    // Générer un nom de fichier unique pour le fichier audio
    const audioFileName = `audio-${Date.now()}.mp3`;
    const audioFilePath = path.join(audioDirPath, audioFileName);
    
    // Écrire le fichier audio sur le disque
    fs.writeFileSync(audioFilePath, audioBuffer);
    
    // Envoyer l'URL du fichier audio au client
    res.json({ audioUrl: `/audio/${audioFileName}` });
  } catch (error) {
    console.error('Error synthesizing speech:', error);
    res.status(500).json({ error: 'Failed to synthesize speech' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
