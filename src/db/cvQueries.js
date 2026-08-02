const pool = require('./index');
const logger = require('../utils/logger');

class CVRepository {
  constructor(dbPool, dbLogger) {
    this.pool = dbPool;
    this.logger = dbLogger;
  }

  async getAllCVs() {
    try {
      const query = `
        SELECT
          cv_files.id           AS cv_id,
          cv_files.file_name,
          cv_files.file_path,
          candidates.id         AS candidate_id,
          candidates.name       AS candidate_name,
          candidates.status,
          candidates.created_at
        FROM cv_files
        JOIN candidates ON cv_files.candidate_id = candidates.id
        ORDER BY candidates.created_at DESC
      `;

      const result = await this.pool.query(query);
      this.logger.info('CVRepository: fetched all CVs.', { count: result.rows.length });
      return result.rows;
    } catch (error) {
      this.logger.error('CVRepository: failed to fetch all CVs.', { error: error.message });
      throw error;
    }
  }

  async getCVById(cvId) {
    try {
      const query = `
        SELECT
          cv_files.id           AS cv_id,
          cv_files.file_name,
          cv_files.file_path,
          candidates.id         AS candidate_id,
          candidates.name       AS candidate_name,
          candidates.status,
          candidates.created_at
        FROM cv_files
        JOIN candidates ON cv_files.candidate_id = candidates.id
        WHERE cv_files.id = $1
      `;

      const result = await this.pool.query(query, [cvId]);
      this.logger.info('CVRepository: fetched CV by id.', { cvId, found: !!result.rows[0] });
      return result.rows[0];
    } catch (error) {
      this.logger.error('CVRepository: failed to fetch CV by id.', { cvId, error: error.message });
      throw error;
    }
  }

  async deleteCandidate(candidateId) {
    try {
      const query = `
        DELETE FROM candidates
        WHERE id = $1
        RETURNING id
      `;

      const result = await this.pool.query(query, [candidateId]);
      this.logger.info('CVRepository: deleted candidate.', { candidateId, deleted: !!result.rows[0] });
      return result.rows[0];
    } catch (error) {
      this.logger.error('CVRepository: failed to delete candidate.', { candidateId, error: error.message });
      throw error;
    }
  }
}

module.exports = new CVRepository(pool, logger);