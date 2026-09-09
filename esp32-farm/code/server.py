import dotenv from "dotenv";
dotenv.config(); // MUST BE AT THE ABSOLUTE TOP

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import axios from "axios";
import fs from "fs";
import path from "path";
import twilio from "twilio";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Create a folder to temporarily store the generated speech audio files
const AUDIO_DIR = path.join(process.cwd(), "public_audio");
if (!fs.existsSync(AUDIO_DIR)) {
    fs.mkdirSync(AUDIO_DIR);
}
// Expose the audio folder publicly so Twilio can access the MP3s
app.use("/audio", express.static(AUDIO_DIR));

// --- CONFIGURATION KEYS ---
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY || "****************************";
const ELEVENLABS_KEY = process.env.ELEVENLABS_API_KEY || "s***************************";
const ELEVENLABS_VOICE_ID = "JBFqnCBsd6RMkjVDRZzb"; 

const VoiceResponse = twilio.twiml.VoiceResponse;

// Initialize ElevenLabs Client
const elevenlabs = new ElevenLabsClient({
    apiKey: ELEVENLABS_KEY,
});

// 🧠 IN-MEMORY SESSION STORE FOR CALL CONVERSATION HISTORY
const callSessions = {};

// --- 1. GET STATUS ENDPOINT ---
app.get("/status", (req, res) => {
    try {
        const plants = JSON.parse(fs.readFileSync("data.json", "utf8"));
        res.json(plants);
    } catch (err) {
        res.json(Array(9).fill({ health: "missing" }));
    }
});

// --- 2. TWILIO INCOMING CALL ENTRYPOINT ---
app.all("/voice", (req, res) => {
    const twiml = new VoiceResponse();
    
    twiml.say({ voice: "alice" }, "CyberHUD Core online. System initialized.");
    
    // Listen for the user speaking into their Nokia phone
    const gather = twiml.gather({
        input: "speech",
        action: "/twilio-speech", 
        method: "POST",
        speechTimeout: "auto",
        enhanced: true 
    });
    
    gather.say({ voice: "alice" }, "How can I assist you today?");

    res.type("text/xml");
    res.send(twiml.toString());
});

// --- 3. MULTI-MODEL SPEECH PIPELINE WITH SYSTEM MEMORY ---
app.post("/twilio-speech", async (req, res) => {
    const twiml = new VoiceResponse();
    const userSpeechText = req.body.SpeechResult;
    const callSid = req.body.CallSid; // 🔑 Unique tracking ID provided by Twilio per call session

    if (!userSpeechText) {
        console.log("No speech detected. Asking user again.");
        twiml.say({ voice: "alice" }, "I didn't catch that. Please try speaking again.");
        twiml.redirect("/voice");
        res.type("text/xml");
        return res.send(twiml.toString());
    }

    try {
        console.log("\n=============================");
        console.log(`☎️ NOKIA USER [${callSid.slice(-6)}]: ${userSpeechText}`);

        let plants = [];
        try {
            plants = JSON.parse(fs.readFileSync("data.json", "utf8"));
        } catch {
            plants = Array(9).fill({ health: "missing" });
        }

        // 🧠 Initialize memory for this specific active phone call if it doesn't exist
        if (!callSessions[callSid]) {
            callSessions[callSid] = [
                {
                    role: "system",
                    content: `
You are a witty, futuristic AI agriculture assistant operating the CyberHUD v4.0.

Current Farm Status Matrix (9 slots):
${JSON.stringify(plants, null, 2)}

Health Parameter Mapping:
- darkgreen = healthy and flourishing
- lightgreen = early warning / slight discoloration
- yellow = unhealthy / disease detected (action required)
- missing = plant slot is empty or undetected

DRONE SYSTEM CONTROL RULES: 
If the user asks to scan, perform a routine check, deploy/fly the drone, or do an aerial visualization, you MUST append the exact string '[GET]' to your message response payload. If they are just greeting you or checking general text metrics, do NOT include the tag.

Keep answers conversational, brief (1 to 2 sentences maximum), and optimized for text-to-speech.
`
                }
            ];
        }

        // Add the user's new phrase to the session history array
        callSessions[callSid].push({ role: "user", content: userSpeechText });

        // STEP A: AI Intent Evaluation (OpenRouter with Session Memory)
        console.log("--> Requesting context from OpenRouter with conversational history...");
        const aiResponse = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "openai/gpt-4o-mini",
                messages: callSessions[callSid] // ⚡ Now passing the whole memory array!
            },
            {
                headers: {
                    "Authorization": `Bearer ${OPENROUTER_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        let replyText = aiResponse.data.choices[0].message.content;
        console.log("AI SYSTEM TEXT:", replyText);

        // STEP B: Process Intent Token Verification for Drone Launch
        if (replyText.includes("[GET]")) {
            console.log("🚀 Drone action requested.");
            replyText = replyText.replace("[GET]", "").trim();
            // Optional: You can fire your Arduino trigger code here!
        }

        // Save the AI's response to memory so it remembers its own words on the next turn
        callSessions[callSid].push({ role: "assistant", content: replyText });

        // STEP C: Render Speech Audio Profile (ElevenLabs)
        console.log("--> Compiling voice synthesis from ElevenLabs...");
        const audioStream = await elevenlabs.textToSpeech.convert(ELEVENLABS_VOICE_ID, {
            outputFormat: "mp3_44100_128",
            text: replyText,
            modelId: "eleven_multilingual_v2",
        });

        const chunks = [];
        for await (const chunk of audioStream) {
            chunks.push(chunk);
        }
        const audioBuffer = Buffer.concat(chunks);
        
        const audioFilename = `speech_${Date.now()}.mp3`;
        const audioFilePath = path.join(AUDIO_DIR, audioFilename);
        fs.writeFileSync(audioFilePath, audioBuffer);
        console.log(`--> Audio saved to local cache: ${audioFilename}`);

        // 🛠️ CRITICAL FIX: Explicitly enforce your active Cloudflare domain so Twilio can pull the MP3
        // If req.get('host') evaluates to localhost:3000, Twilio won't find it.
        const hostUrl = "https://trycloudflare.com";
        const twilioAudioUrl = `${hostUrl}/audio/${audioFilename}`;

        // STEP D: Generate TwiML to play back to the phone call
        twiml.play(twilioAudioUrl);
        
        // Loop back to listen to the next sentence from the user
        twiml.gather({
            input: "speech",
            action: "/twilio-speech",
            method: "POST",
            speechTimeout: "auto",
            enhanced: true
        });

        res.type("text/xml");
        res.send(twiml.toString());

        // Background cleanup: Delete the audio file after 45 seconds to stay clean
        setTimeout(() => {
            try { if (fs.existsSync(audioFilePath)) fs.unlinkSync(audioFilePath); } catch (e) {}
        }, 45000);

    } catch (err) {
        console.error("Pipeline Failure Error:", err.response?.data || err.message);
        twiml.say({ voice: "alice" }, "System communication failure. Please try again later.");
        res.type("text/xml");
        res.send(twiml.toString());
    }
});

app.listen(3000, () => {
    console.log("\n=======================================================");
    console.log("CyberHUD Core initialized on port 3000");
    console.log("Streaming real-time pipeline to OpenRouter & ElevenLabs");
    console.log("=======================================================");
});
