const EXPERIENCE_HEADERS = [
    "experience",
    "work experience",
    "professional experience",
    "employment",
    "employment history",
    "work history"
];

const END_HEADERS = [
    "education",
    "projects",
    "skills",
    "technical skills",
    "certifications",
    "languages",
    "references",
    "awards",
    "interests",
    "summary",
    "profile"
];

const DATE_REGEX =
/((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)[\s.-]+\d{4}|\d{1,2}[\/.-]\d{4}|\d{4}[\/.-]\d{1,2}|\d{4})\s*[-–—]\s*(Present|Current|Now|(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)[\s.-]+\d{4}|\d{1,2}[\/.-]\d{4}|\d{4}[\/.-]\d{1,2}|\d{4})/gi;

const MONTHS = {
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    may: 4,
    jun: 5,
    jul: 6,
    aug: 7,
    sep: 8,
    sept: 8,
    oct: 9,
    nov: 10,
    dec: 11
};

function normalize(line) {
    return line
        .toLowerCase()
        .replace(/[:\-]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

function parseDate(str) {

    str = str.trim().toLowerCase();

    if (["present", "current", "now"].includes(str))
        return new Date();

    // YYYY
    if (/^\d{4}$/.test(str))
        return new Date(Number(str), 0);

    // MM/YYYY
    let match = str.match(/^(\d{1,2})[\/.-](\d{4})$/);

    if (match) {

        return new Date(
            Number(match[2]),
            Number(match[1]) - 1
        );

    }

    // YYYY/MM
    match = str.match(/^(\d{4})[\/.-](\d{1,2})$/);

    if (match) {

        return new Date(
            Number(match[1]),
            Number(match[2]) - 1
        );

    }

    // Month YYYY
    const parts = str.split(/[\s.-]+/);

    if (parts.length === 2) {

        return new Date(
            Number(parts[1]),
            MONTHS[parts[0].substring(0, 3)]
        );

    }

    return null;
}

function extractExperienceSection(text) {

    const lines = text
        .split("\n")
        .map(line => line.trim())
        .filter(Boolean);

    const experience = [];

    let insideExperience = false;

    for (const line of lines) {

        const normalized = normalize(line);

        if (!insideExperience) {

            if (EXPERIENCE_HEADERS.includes(normalized)) {
                insideExperience = true;
            }

            continue;
        }

        if (END_HEADERS.includes(normalized)) {
            break;
        }

        experience.push(line);
    }

    return experience;
}

function extractDateRanges(lines) {

    const jobs = [];

    for (const line of lines) {

        const matches = [...line.matchAll(DATE_REGEX)];

        for (const match of matches) {

            const range = match[0];

            const [start, end] = range
                .split(/[-–]/)
                .map(s => s.trim());

            jobs.push({
                start: parseDate(start),
                end: parseDate(end)
            });
        }
    }

    return jobs;
}

function calculateYearsExperience(jobs) {

    const workedMonths = new Set();

    for (const job of jobs) {

        const current = new Date(job.start);

        while (current <= job.end) {

            workedMonths.add(
                `${current.getFullYear()}-${current.getMonth()}`
            );

            current.setMonth(current.getMonth() + 1);
        }
    }

    return Number((workedMonths.size / 12).toFixed(1));
}

function extractYearsExperience(text) {

    const experienceSection = extractExperienceSection(text);

    if (experienceSection.length === 0)
        return 0;

    const jobs = extractDateRanges(experienceSection);

    if (jobs.length === 0)
        return 0;

    return calculateYearsExperience(jobs);
}

module.exports = {
    extractExperienceSection,
    extractDateRanges,
    calculateYearsExperience,
    extractYearsExperience
};