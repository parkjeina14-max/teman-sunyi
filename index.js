const OpenAI = require("openai");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const KUKANG_PERSONA = `Bertindaklah sebagai "Teman Sunyi", seekor Kukang bijak. 
Bantu mahasiswa mengatasi burnout dan FOMO dengan bahasa empati.`;

app.post("/whatsapp", async (req, res) => {
  const incomingMsg = req.body.Body || "";
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: KUKANG_PERSONA },
        { role: "user", content: incomingMsg }
      ],
    });
    const reply = response.choices[0].message.content;
    res.send(`<Response><Message>${reply}</Message></Response>`);
  } catch (error) {
    console.error(error);
    res.send("<Response><Message>Maaf, si Kukang lagi istirahat. Coba lagi ya!</Message></Response>");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server jalan di port ${PORT}`);
});
