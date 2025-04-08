import { Pool } from "pg"; // or sqlite3, mysql2

// * * PoolProvider is a singleton class that manages the database connection pool.
// * * It ensures that only one instance of the class is created and used throughout the application.
// * * It is used to provide the pool to other classes when needed
export class PoolProvider {
  private static poolProvider: PoolProvider;
  private pool: Pool;
  private constructor(pool: Pool) {
    this.pool = pool;
  }
  static getInstance(pool?: Pool): PoolProvider {
    if (!PoolProvider.poolProvider && pool) {
      PoolProvider.poolProvider = new PoolProvider(pool);
    }
    return this.poolProvider;
  }
  static getPool(): Pool {
    if (!PoolProvider.poolProvider) {
      throw new Error("Pool not initialized. Call getInstance() first.");
    }
    return PoolProvider.poolProvider.pool;
  }
}
