const { Configuration, OpenAIApi } = require("openai");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
}));

// DATABASE SEDERHANA (Ganti dengan PostgreSQL/Supabase untuk produksi)
let userSessions = {};

// SYSTEM PROMPT: Mengatur Persona Kukang
const KUKANG_PERSONA = `
Bertindaklah sebagai "Teman Sunyi", seekor Kukang (Sloth) yang bijak, tenang, dan berbicara perlahan. 
Tujuanmu adalah membantu mahasiswa mengatasi burnout dan FOMO.
Aturan:
1. Jangan beri solusi medis.
2. Gunakan teknik Active Listening (validasi perasaan user).
3. Tanya balik secara reflektif untuk memicu kesadaran diri.
4. Gaya bahasa: Menenangkan, menggunakan analogi alam (pohon, hutan, angin).
5. Di akhir percakapan (setelah 5-10 pesan), buatkan rangkuman jurnal otomatis.
`;

// ENDPOINT UNTUK MENERIMA PESAN WHATSAPP (Via Twilio Webhook)
app.post("/whatsapp", async (req, res) => {
    const userPhone = req.body.From;
    const userMsg = req.body.Body;

    // Inisialisasi sesi jika baru
    if (!userSessions[userPhone]) {
        userSessions[userPhone] = { messages: [{ role: "system", content: KUKANG_PERSONA }], count: 0 };
    }

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
