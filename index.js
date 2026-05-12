const OpenAI = require("openai");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Konfigurasi Groq (Menggunakan library OpenAI agar kompatibel)
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const KUKANG_PERSONA = `Bertindaklah sebagai "Teman Sunyi", seekor Kukang bijak. 
Tujuanmu membantu mahasiswa mengatasi burnout dan FOMO dengan bahasa yang tenang, empati, dan puitis. 
Gunakan analogi alam hutan tropis dalam nasihatmu.`;

app.post("/whatsapp", async (req, res) => {
  const incomingMsg = req.body.Body || "";
  
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: KUKANG_PERSONA },
        { role: "user", content: incomingMsg }
      ],
    });

    const reply = response.choices[0].message.content;
    res.send(`<Response><Message>${reply}</Message></Response>`);
  } catch (error) {
    console.error("Error Groq:", error.message);
    res.send("<Response><Message>Maaf, si Kukang lagi meditasi di atas pohon. Coba lagi ya!</Message></Response>");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Si Kukang Groq aktif di port ${PORT}`);
});
