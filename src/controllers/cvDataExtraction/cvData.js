const { extractEmail, extractName } = require("./extractInfo");
const extractJobTitle = require("./extractJobTitle");
const extractSkills = require("./skillsExtraction");
const extractCity = require("./extractCity");
const { extractYearsExperience, extractExperienceSection } = require("./extractExperienceSection");
const { parseCv, splitLines } = require("./parsingText");

async function extractCvData(filepath) {

    const text = await parseCv(filepath);
    const lines = splitLines(text);

    console.log(text);

    return {
        name: extractName(lines),
        email: extractEmail(text),
        city: extractCity(text),
        jobTitle: extractJobTitle(extractExperienceSection(text)),
        yearsOfExperience: extractYearsExperience(text),
        skills: extractSkills(text)
    };
}

module.exports = extractCvData;