const Fuse = require("fuse.js");
const SKILLS = require("./dictionaries/skills.json");

function normalize(text) {
    return text
        .toLowerCase()
        .replace(/[^\w+#.]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const NORMALIZED_SKILLS = SKILLS.map(skill => ({
    original: skill,
    normalized: normalize(skill),
    regex: new RegExp(
        `\\b${escapeRegex(normalize(skill))}\\b`,
        "i"
    )
}));

const fuse = new Fuse(
    NORMALIZED_SKILLS.map(skill => ({
        original: skill.original,
        normalized: skill.normalized
    })),
    {
        keys: ["normalized"],
        includeScore: true,
        threshold: 0.1,
        ignoreLocation: true,
        minMatchCharLength: 3
    }
);

function extractSkills(text) {

    const found = new Set();

    const normalizedText = normalize(text);

    // ---------- Exact Match ----------
    for (const skill of NORMALIZED_SKILLS) {

        if (skill.regex.test(normalizedText)) {
            found.add(skill.original);
        }

    }

    // ---------- Generate Candidate Phrases ----------
    const candidates = new Set();

    const lines = text
        .split("\n")
        .map(line => normalize(line))
        .filter(Boolean);

    for (const line of lines) {

        const words = line.split(" ");

        for (let size = 1; size <= 5; size++) {

            for (let i = 0; i <= words.length - size; i++) {

                const phrase = words
                    .slice(i, i + size)
                    .join(" ")
                    .trim();

                if (phrase)
                    candidates.add(phrase);

            }

        }

    }

    // ---------- Fuzzy Match ----------
    for (const phrase of candidates) {

        // Don't fuzzy-match tiny phrases
        if (
            phrase.split(" ").length === 1 &&
            phrase.length <= 3
        ) {
            continue;
        }

        const results = fuse.search(phrase);

        if (!results.length)
            continue;

        const best = results[0];

        if (
            best.score <= 0.15 &&
            !found.has(best.item.original)
        ) {
            found.add(best.item.original);
        }

    }

    return [...found].sort();
}

module.exports = extractSkills;