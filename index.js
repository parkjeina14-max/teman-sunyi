require('dotenv').config();
const express = require('express');
const twilio = require('twilio');
const OpenAI = require('openai');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Inisialisasi Twilio client (opsional, untuk verifikasi)
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Inisialisasi OpenAI client untuk Groq
const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

// Fungsi untuk generate response dari Groq
async function generateGroqResponse(message) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: 'Kamu adalah asisten AI yang ramah dan membantu. Jawab dalam bahasa Indonesia yang natural dan singkat.'
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error Groq API:', error);
    return 'Maaf, saya sedang mengalami masalah teknis. Coba lagi nanti ya!';
  }
}

// Webhook WhatsApp - POST /whatsapp
app.post('/whatsapp', async (req, res) => {
  try {
    // Log incoming message
    console.log('Incoming message:', req.body);

    // Ambil pesan dari user
    const userMessage = req.body.Body;
    const fromNumber = req.body.From;
    const toNumber = req.body.To;

    // Jika pesan kosong, kirim pesan selamat datang
    if (!userMessage || userMessage.trim() === '') {
      const welcomeMsg = 'Halo! 👋 Saya bot AI berbasis Groq. Kirim pesan apa saja, saya akan jawab!';
      const twiml = new twilio.twiml.MessagingResponse();
      twiml.message(welcomeMsg);
      res.type('text/xml');
      res.send(twiml.toString());
      return;
    }

    // Generate response dari Groq
    const aiResponse = await generateGroqResponse(userMessage);

    // Buat TwiML response
    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message(aiResponse);

    // Set header dan kirim response
    res.type('text/xml');
    res.status(200).send(twiml.toString());

  } catch (error) {
    console.error('Error handling webhook:', error);
    
    // Response error TwiML
    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message('Maaf, terjadi kesalahan. Silakan coba lagi.');
    res.type('text/xml');
    res.status(500).send(twiml.toString());
  }
});

// Endpoint health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Endpoint untuk verifikasi ngrok/webhook (GET /whatsapp)
app.get('/whatsapp', (req, res) => {
  res.send('WhatsApp Webhook Active ✅');
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📱 WhatsApp webhook: http://localhost:${port}/whatsapp`);
});

module.exports = app;
