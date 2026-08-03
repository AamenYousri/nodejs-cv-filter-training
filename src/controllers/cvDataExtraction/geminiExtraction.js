const { GoogleGenAI, Type } = require("@google/genai");
const logger = require("../../utils/logger");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const EXTRACTION_PROMPT = `...`; // نفس البرومبت بتاعك، من غير تغيير

const RESPONSE_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, nullable: true },
        email: { type: Type.STRING, nullable: true },
        city: { type: Type.STRING, nullable: true },
        jobTitle: { type: Type.STRING, nullable: true },
        yearsOfExperience: { type: Type.NUMBER, nullable: true },
        skills: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
        },
    },
    required: ["name", "email", "city", "jobTitle", "yearsOfExperience", "skills"],
};

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callGemini(prompt) {
    const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: RESPONSE_SCHEMA,
        },
    });

    const rawOutput = response.text;
    return JSON.parse(rawOutput);
}

async function extractWithGemini(text) {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not set in .env");
    }

    const prompt = EXTRACTION_PROMPT + text + `\n"""`;

    const maxAttempts = 2;
    let lastError;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const parsed = await callGemini(prompt);

            logger.info("Gemini extraction succeeded.", {
                name: parsed.name,
                email: parsed.email,
                attempt,
            });

            return {
                name: parsed.name || null,
                email: parsed.email || null,
                city: parsed.city || null,
                jobTitle: parsed.jobTitle ? { raw: parsed.jobTitle } : null,
                yearsOfExperience: parsed.yearsOfExperience ?? 0,
                skills: Array.isArray(parsed.skills) ? parsed.skills : [],
            };

        } catch (error) {
            lastError = error;
            logger.error("Gemini extraction attempt failed.", {
                attempt,
                error: error.message,
            });

            if (attempt < maxAttempts) {
                await sleep(1000);
            }
        }
    }

    throw lastError;
}

module.exports = { extractWithGemini };