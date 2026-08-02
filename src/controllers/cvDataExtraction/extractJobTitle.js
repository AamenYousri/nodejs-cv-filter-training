const ROLE_NOUNS = require("./dictionaries/job_nouns.json");

const ACTION_VERBS = [
    "developed",
    "built",
    "created",
    "designed",
    "implemented",
    "managed",
    "worked",
    "responsible",
    "using",
    "maintained",
    "performed",
    "collaborated",
    "assisted",
    "supported",
    "participated",
    "led",
    "tested",
    "improved",
    "optimized",
    "configured",
    "installed",
    "deployed",
    "analyzed",
    "documented",
    "planned",
    "organized",
    "provided",
    "handled",
    "trained",
    "coordinated",
    "monitored"
];

function normalize(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

const ROLE_WORDS = ROLE_NOUNS.map(normalize);

// Detect any common date range
const dateRegex =
/((jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)?\s*(19|20)\d{2}).{0,20}(present|current|now|(19|20)\d{2})/i;

function containsRoleNoun(text) {

    const normalized = normalize(text);

    return ROLE_WORDS.some(noun => {

        const regex = new RegExp(`\\b${noun}\\b`, "i");

        return regex.test(normalized);

    });

}

function isGarbage(line) {

    if (!line)
        return true;

    const text = line.trim();

    if (!text)
        return true;

    if (/^[•\-*]/.test(text))
        return true;

    if (/@/.test(text))
        return true;

    if (/https?:\/\/|www\./i.test(text))
        return true;

    if (/\+?\d[\d\s()-]{7,}/.test(text))
        return true;

    const words = text.split(/\s+/);

    if (words.length > 8)
        return true;

    const first = words[0].toLowerCase();

    if (ACTION_VERBS.includes(first))
        return true;

    return false;

}

function splitCandidate(candidate) {

    return candidate
        .split(/\bat\b|\||\/|,| - |\u2013|\u2014/i)
        .map(part => part.trim())
        .filter(Boolean);

}

function extractJobTitle(experienceSection) {

    for (let i = 0; i < experienceSection.length; i++) {

        const line = experienceSection[i];

        if (!dateRegex.test(line))
            continue;

        // ----------------------------------------------------
        // 1. Same line
        // ----------------------------------------------------

        const beforeDate = line
            .replace(dateRegex, "")
            .replace(/[()]/g, "")
            .trim();

        const segments = splitCandidate(beforeDate);

        for (const segment of segments) {

            if (containsRoleNoun(segment)) {

                return {
                    raw: segment,
                    normalized: segment.trim(),
                    method: "same-line"
                };

            }

        }

        // ----------------------------------------------------
        // 2. Nearby lines
        // ----------------------------------------------------

        const candidates = [];

        if (i >= 2)
            candidates.push(experienceSection[i - 2]);

        if (i >= 1)
            candidates.push(experienceSection[i - 1]);

        if (i + 1 < experienceSection.length)
            candidates.push(experienceSection[i + 1]);

        for (const candidate of candidates) {

            if (isGarbage(candidate))
                continue;

            const parts = splitCandidate(candidate);

            for (const part of parts) {

                if (containsRoleNoun(part)) {

                    return {
                        raw: part,
                        normalized: part.trim(),
                        method: "near-date"
                    };

                }

            }

        }

        // ----------------------------------------------------
        // 3. Fallback
        // ----------------------------------------------------

        for (const candidate of candidates) {

            if (!isGarbage(candidate)) {

                return {
                    raw: candidate,
                    normalized: candidate.trim(),
                    method: "fallback"
                };

            }

        }

    }

    return null;

}

module.exports = extractJobTitle;