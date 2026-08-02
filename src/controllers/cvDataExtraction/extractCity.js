const Fuse = require("fuse.js");
const CITIES = require("./dictionaries/cities.json");

function normalize(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const NORMALIZED_CITIES = CITIES.map(city => ({
    original: city,
    normalized: normalize(city),
    regex: new RegExp(`\\b${escapeRegex(normalize(city))}\\b`, "i")
}));

const fuse = new Fuse(
    NORMALIZED_CITIES.map(city => ({
        original: city.original,
        normalized: city.normalized
    })),
    {
        keys: ["normalized"],
        includeScore: true,
        threshold: 0.2,
        ignoreLocation: true,
        minMatchCharLength: 3
    }
);

function extractCity(text) {

    const normalizedText = normalize(text);

    // ---------- Exact Match ----------
    for (const city of NORMALIZED_CITIES) {

        if (city.regex.test(normalizedText)) {
            return city.original;
        }

    }

    // ---------- Fuzzy Match ----------
    const lines = text
        .split("\n")
        .map(line => line.trim())
        .filter(Boolean)
        .slice(0, 10);

    let bestMatch = null;

    for (const line of lines) {

        const normalizedLine = normalize(line);

        if (!normalizedLine)
            continue;

        const results = fuse.search(normalizedLine);

        if (!results.length)
            continue;

        const result = results[0];

        if (
            !bestMatch ||
            result.score < bestMatch.score
        ) {
            bestMatch = result;
        }

    }

    if (bestMatch && bestMatch.score <= 0.15) {
        return bestMatch.item.original;
    }

    return null;
}

module.exports = extractCity;