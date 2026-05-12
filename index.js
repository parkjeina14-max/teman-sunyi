const OpenAI = require("openai"); // Groq pakai library yang sama dengan OpenAI
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Pakai alamat Groq tapi cara pakainya mirip OpenAI
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const KUKANG_PERSONA = `Bertindaklah sebagai "Teman Sunyi", seekor Kukang bijak. 
Tujuanmu membantu mahasiswa mengatasi burnout dan FOMO dengan empati.`;

app.post("/whatsapp", async (req, res) => {
  const incomingMsg = req.body.Body || "";
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant", // Model gratisan Groq yang super kencang
      messages: [
        { role: "system", content: KUKANG_PERSONA },
        { role: "user", content: incomingMsg }
      ],
    });

    const reply = response.choices[0].message.content;
    res.send(`<Response><Message>${reply}</Message></Response>`);
  } catch (error) {
    console.error(error);
    res.send("<Response><Message>Aduh, si Kukang lagi ngantuk. Coba chat lagi ya!</Message></Response>");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Si Kukang Groq bangun di port ${PORT}`);
});
