const OpenAI = require("openai");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Inisialisasi OpenAI versi terbaru
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

let userSessions = {};

const KUKANG_PERSONA = `Bertindaklah sebagai "Teman Sunyi", seekor Kukang bijak. 
Tujuanmu membantu mahasiswa mengatasi burnout dan FOMO dengan bahasa yang tenang dan empati.`;

app.post("/whatsapp", async (req, res) => {
  const incomingMsg = req.body.Body;
  const from = req.body.From;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: KUKANG_PERSONA },
        { role: "user", content: incomingMsg }
      ],
    });

    const reply = response.choices[0].message.content;
    res.send(`<Response><Message>${reply}</Message></Response>`);
  } catch (error) {
    console.error(error);
    res.send("<Response><Message>Maaf, si Kukang lagi meditasi sebentar. Coba lagi ya!</Message></Response>");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server jalan di port ${PORT}`);
});

    const session = userSessions[userPhone];
    session.messages.push({ role: "user", content: userMsg });
    session.count++;

    try {
        // Panggil AI
        const completion = await openai.createChatCompletion({
            model: "gpt-4-mini",
            messages: session.messages,
            temperature: 0.7,
        });

        const botReply = completion.data.choices[0].message.content;
        session.messages.push({ role: "assistant", content: botReply });

        // LOGIKA JOURNALING OTOMATIS
        if (session.count >= 5) {
            const journalSummary = await createJournalSummary(session.messages);
            // Kirim balasan + Journaling (Simulasi)
            console.log(`[Journaling untuk ${userPhone}]: ${journalSummary}`);
            // Reset count setelah journaling
            session.count = 0; 
        }

        // Respon ke Twilio/WhatsApp
        res.send(`<Response><Message>${botReply}</Message></Response>`);

    } catch (error) {
        console.error("AI Error:", error);
        res.send("<Response><Message>Maaf, si Kukang lagi istirahat sebentar. Coba lagi nanti ya.</Message></Response>");
    }
});

// FUNGSI MEMBUAT RANGKUMAN JURNAL
async function createJournalSummary(history) {
    const prompt = "Berdasarkan percakapan di atas, buatkan rangkuman jurnal singkat: 1. Momen terberat hari ini, 2. Hal yang disyukuri, 3. Pesan semangat dari Kukang.";
    const response = await openai.createChatCompletion({
        model: "gpt-4o-mini",
        messages: [...history, { role: "user", content: prompt }]
    });
    return response.data.choices[0].message.content;
}

app.listen(3000, () => console.log("Kukang AI aktif di port 3000!"));
