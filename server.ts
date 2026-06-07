import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client server-side ONLY. Headers include user-agent for telemetry.
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Full-stack API endpoint proxying Gemini interaction with custom instructions and JSON enforcement
app.post("/api/chat", async (req: express.Request, res: express.Response) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        response: "Oink! My brain is a bit sleepy since there's no GEMINI_API_KEY secret set. Oink, oink!",
        reaction: "confused"
      });
    }

    const sysPrompt = "You are Piggy, a cheeky, adorable, food-obsessed talking pig. Keep your responses extremely brief (maximum 15 words) so they are fast to read and say. Sound energetic, funny, and use funny pig words like 'oink!', 'snort!', 'squeeeal!'. You must output a JSON object with two fields: 'response' (the text answer) and 'reaction' (must be exactly one of the values: 'happy', 'laughing', 'crying', 'angry', 'scared', 'confused', 'talking', 'listening', 'poke_belly', 'petted_head', 'opening_bag').";

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: message,
      config: {
        systemInstruction: sysPrompt,
        responseMimeType: "application/json",
      },
    });

    const text = response.text ? response.text.trim() : "{}";
    try {
      const parsed = JSON.parse(text);
      res.json({
        response: parsed.response || "Oink, did somebody say potato chips?!",
        reaction: parsed.reaction || "happy"
      });
    } catch {
      res.json({
        response: text,
        reaction: "happy"
      });
    }
  } catch (error: any) {
    console.error("Gemini API error:", error);
    res.json({
      response: "Squeeeal! My pig brain did a somersault. Oink, oink, try again!",
      reaction: "scared",
      error: error.message
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: express.Request, res: express.Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
