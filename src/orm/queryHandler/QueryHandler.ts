import { Pool } from "pg"; // or sqlite3, mysql2

/**
 * * QueryHandler is a singleton class that manages the database connection pool and executes queries.
 *   It close the pool after each query execution.
 * * It is designed to be used with the QueryBuilder class to execute queries on the database.
 * * It ensures that only one instance of the class is created and used throughout the application.
 */
export class QueryHandler {
  private static queryHandler: QueryHandler;
  private pool: Pool;
  private constructor(pool: Pool) {
    this.pool = pool;
  }
  static getInstance(pool?: Pool): QueryHandler {
    if (!QueryHandler.queryHandler && pool) {
      QueryHandler.queryHandler = new QueryHandler(pool);
    }
    return this.queryHandler;
  }
  async query(query: string, params?: any[]): Promise<any> {
    const result = await this.pool.query(query, params);
    // await this.pool.end(); // Close the pool after each query
    return result;
  }
}
