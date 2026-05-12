const OpenAI = require("openai");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Inisialisasi OpenAI versi 4
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const KUKANG_PERSONA = `Bertindaklah sebagai "Teman Sunyi", seekor Kukang bijak dari hutan tropis. 
Tujuanmu membantu mahasiswa mengatasi burnout dan FOMO dengan bahasa yang tenang, empati, dan sedikit puitis.`;

// Pintu masuk pesan WhatsApp
app.post("/whatsapp", async (req, res) => {
  const incomingMsg = req.body.Body || "";
  
  try {
    // Meminta jawaban dari OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: KUKANG_PERSONA },
        { role: "user", content: incomingMsg }
      ],
    });

    const reply = response.choices[0].message.content;
    
    // Kirim balasan balik ke WhatsApp
    res.send(`<Response><Message>${reply}</Message></Response>`);
    
  } catch (error) {
    console.error("Error OpenAI:", error);
    res.send("<Response><Message>Maaf, si Kukang lagi meditasi sebentar di pohon. Coba chat lagi nanti ya!</Message></Response>");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Si Kukang bangun di port ${PORT}`);
});
