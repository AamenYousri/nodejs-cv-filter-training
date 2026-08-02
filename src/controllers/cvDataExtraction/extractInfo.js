const JOB_TITLES = require("./dictionaries/job_titles");

function extractEmail(text) {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;

    const match = text.match(emailRegex);

    return match ? match[0].toLowerCase() : null;
}


const INVALID_LINES = [
    "curriculum vitae",
    "resume",
    "cv",
    "profile",
    "summary"
];

function extractName(lines) {

    const searchLines = lines.slice(0, 15);

    for (const line of searchLines) {

        const normalized = line.toLowerCase().trim();

        // Empty
        if (!normalized)
            continue;

        // Email
        if (normalized.includes("@"))
            continue;

        // URL
        if (normalized.includes("http") || normalized.includes("www"))
            continue;

        // Contains numbers
        if (/\d/.test(normalized))
            continue;

        // Section headers
        if (INVALID_LINES.includes(normalized))
            continue;

        // Job titles
        if (JOB_TITLES.some(title => title.toLowerCase() === normalized))
            continue;

        const words = line.trim().split(/\s+/);

        // Usually 2–4 words
        if (words.length < 2 || words.length > 4)
            continue;

        // Every word should start with a capital letter
        const looksLikeName = words.every(word =>
            /^[A-Z][a-zA-Z'-]*$/.test(word)
        );

        if (!looksLikeName)
            continue;

        return line.trim();
    }

    return null;
}

module.exports = {
    extractEmail,
    extractName
};