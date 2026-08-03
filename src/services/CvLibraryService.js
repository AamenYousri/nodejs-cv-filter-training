const path = require("path");

// ======================================================
// CvLibraryService
// ------------------------------------------------------
// Responsibility (SRP): business logic + shaping data for
// the frontend. Knows NOTHING about SQL/Postgres — it only
// knows it has a "repository" with a findAll() method.
// (Dependency Inversion: Service depends on an abstraction,
// not on the database directly.)
// ======================================================

// Map of file extensions -> human-readable document type,
// matching what the "CV Library" table expects (Pdf / Docx).
const DOCUMENT_TYPE_BY_EXTENSION = {
  ".pdf": "Pdf",
  ".docx": "Docx",
  ".doc": "Doc",
};

class CvLibraryService {
  constructor(cvLibraryRepository) {
    this.cvLibraryRepository = cvLibraryRepository;
  }

  // ====================================================
  // getLibrary
  // ----------------------------------------------------
  // Fetches raw rows from the repository and transforms
  // each one into the exact shape the CV Library table needs.
  // ====================================================
  async getLibrary(filters) {
    const rows = await this.cvLibraryRepository.findAll(filters);

    return rows.map((row) => this._toLibraryItem(row));
  }

  // ====================================================
  // _toLibraryItem (private helper)
  // ----------------------------------------------------
  // One row -> one table row for the frontend.
  // ====================================================
  _toLibraryItem(row) {
    return {
      id: row.id,
      candidateId: row.candidate_id,
      fileName: row.file_name,
      documentType: this._resolveDocumentType(row.file_name),
      candidateName: row.candidate_name,
      status: row.status,
      uploadedAt: row.uploaded_at,
      filePath: row.file_path,
    };
  }

  // ====================================================
  // _resolveDocumentType (private helper)
  // ----------------------------------------------------
  // Derives "Pdf" / "Docx" from the file extension, since
  // this is NOT stored in the database as its own column.
  // ====================================================
  _resolveDocumentType(fileName) {
    if (!fileName) return "Unknown";

    const extension = path.extname(fileName).toLowerCase();

    return DOCUMENT_TYPE_BY_EXTENSION[extension] || "Unknown";
  }
}

module.exports = CvLibraryService;