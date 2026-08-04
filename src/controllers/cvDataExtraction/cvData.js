const { extractEmail, extractName } = require("./extractInfo");
const extractJobTitle = require("./extractJobTitle");
const extractSkills = require("./skillsExtraction");
const extractCity = require("./extractCity");
const { extractYearsExperience, extractExperienceSection } = require("./extractExperienceSection");
const { parseCv, splitLines } = require("./parsingText");
const { extractWithGemini } = require("./geminiExtraction");
const logger = require("../../utils/logger");

function extractWithRegex(text, lines) {
    return {
        name: extractName(lines),
        email: extractEmail(text),
        city: extractCity(text),
        jobTitle: extractJobTitle(extractExperienceSection(text)),
        yearsOfExperience: extractYearsExperience(text),
        skills: extractSkills(text)
    };
}

async function extractCvData(filepath) {

    const text = await parseCv(filepath);
    const lines = splitLines(text);

    try {
        return await extractWithGemini(text);
    } catch (error) {
        logger.error("Gemini extraction failed, falling back to regex extraction.", { error: error.message });
        return extractWithRegex(text, lines);
    }
}

module.exports = extractCvData;