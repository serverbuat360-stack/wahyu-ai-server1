import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY belum diatur.");
}

if (!process.env.FRONTEND_ORIGIN) {
  throw new Error("FRONTEND_ORIGIN belum diatur.");
}

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.disable("x-powered-by");

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN
}));

app.use(express.json({ limit: "10kb" }));

app.use("/api/", rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false
}));

app.get("/", (req, res) => {
  res.send("WAHYU AI backend aktif.");
});

app.post("/api/chat", async (req, res) => {
  try {
    const message = req.body?.message;

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        error: "Masukkan pertanyaan terlebih dahulu."
      });
    }

    if (message.length > 4000) {
      return res.status(400).json({
        error: "Pertanyaan maksimal 4000 karakter."
      });
    }

    const result = await client.responses.create({
      model: "gpt-4.1-mini",
      instructions:
        "Kamu adalah WAHYU AI, asisten ramah yang menjawab dalam bahasa Indonesia dengan jelas dan bermanfaat.",
      input: message.trim(),
      max_output_tokens: 700
    });

    res.json({
      reply: result.output_text || "Maaf, belum ada jawaban."
    });
  } catch (error) {
    console.error("Permintaan AI gagal:", error.message);

    res.status(500).json({
      error: "AI sedang mengalami gangguan. Coba lagi nanti."
    });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`WAHYU AI backend aktif pada port ${port}`);
});
      
