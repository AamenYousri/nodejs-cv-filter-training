const fs = require("fs/promises");
const { PDFParse } = require("pdf-parse");
const mammoth = require("mammoth");
const path = require("path");

async function parsePdf(filePath) {
    const buffer = await fs.readFile(filePath);
    const pdfParser = new PDFParse({ data: buffer });
    const data = await pdfParser.getText();

    return data.text;
}

function calculateQuality(text) {

    const words = text.match(/[A-Za-z]+/g) || [];

    if (!words.length)
        return 0;

    let score = 100;

    // Ski l l s
    const fragmentedLetters =
        text.match(/\b[A-Za-z]{2,}\s+[A-Za-z]\b/g)?.length || 0;

    // Desi gn
    const splitWords =
        text.match(/\b[A-Za-z]{2,}\s+[A-Za-z]{2}\b/g)?.length || 0;

    // I N T E R I O R
    const isolatedLetters =
        text.match(/\b(?:[A-Za-z]\s+){3,}[A-Za-z]\b/g)?.length || 0;

    score -= fragmentedLetters * 2;
    score -= splitWords;
    score -= isolatedLetters * 3;

    return Math.max(0, score);

}

async function parseDocx(filePath) {
    const result = await mammoth.extractRawText({
        path: filePath
    });

    return result.value;
}

function cleanText(text) {
    return text
        .replace(/\r\n/g, "\n")
        .replace(/\t/g, " ")
        .replace(/[ ]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

function normalizeFilePath(filePath) {
    if (!filePath || typeof filePath !== "string") {
        throw new Error("filePath is required.");
    }

    const normalized = filePath.replace(/\\/g, "/");

    return path.isAbsolute(normalized)
        ? normalized
        : path.resolve(process.cwd(), normalized);
}

async function parseCv(filePath) {
    const resolvedPath = normalizeFilePath(filePath);
    const extension = path.extname(resolvedPath).toLowerCase();

    let text;

    switch (extension) {
        case ".pdf":
            text = await parsePdf(resolvedPath);
            break;

        case ".docx":
            text = await parseDocx(resolvedPath);
            break;

        default:
            throw new Error("Unsupported file type.");
    }

    return cleanText(text);
}

function splitLines(text) {
    return text
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.length > 0);
}

module.exports = {
    parseCv,
    splitLines,
};

