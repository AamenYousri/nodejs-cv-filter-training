const pool = require("../db/index");
const CvLibraryRepository = require("../repositories/CvLibraryRepository");
const CvLibraryService = require("../services/CvLibraryService");

// ======================================================
// CvLibraryController
// ------------------------------------------------------
// Responsibility (SRP): HTTP layer only.
// - Reads query params from the request
// - Calls the service
// - Sends the response
// It must NOT contain SQL, and must NOT contain business
// logic like "how do I figure out the document type".
// ======================================================

class CvLibraryController {
  constructor(cvLibraryService) {
    this.cvLibraryService = cvLibraryService;

    // Bind so `this` stays correct when Express calls
    // this method directly as a route handler.
    this.getLibrary = this.getLibrary.bind(this);
  }

  async getLibrary(req, res) {
    try {
      const { search, status, from_date, to_date } = req.query;

      const library = await this.cvLibraryService.getLibrary({
        search,
        status,
        from_date,
        to_date,
      });

      return res.status(200).json({
        success: true,
        count: library.length,
        library,
      });
    } catch (error) {
      console.error("CV Library Error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to get CV library",
        error: error.message,
      });
    }
  }
}

// ======================================================
// Composition Root
// ------------------------------------------------------
// This is the ONLY place where we wire the concrete pieces
// together (pool -> repository -> service -> controller).
// Every class above stays decoupled from this wiring.
// ======================================================

const cvLibraryRepository = new CvLibraryRepository(pool);
const cvLibraryService = new CvLibraryService(cvLibraryRepository);
const cvLibraryController = new CvLibraryController(cvLibraryService);

module.exports = cvLibraryController;