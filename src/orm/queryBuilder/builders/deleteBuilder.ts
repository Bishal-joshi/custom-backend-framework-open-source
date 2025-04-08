import { QueryHandler } from "../../queryHandler/QueryHandler";
import { QueryBuilder } from "../queryBuilder";

export class DeleteBuilder extends QueryBuilder {
  private table: string;
  private whereClause: string;

  constructor(table: string) {
    super();
    this.table = table;
    this.whereClause = "";
  }

  where(column: string, value: any): DeleteBuilder {
    if (this.whereClause) {
      this.whereClause += ` AND ${column} = $${this.parameters.length + 1}`;
    } else {
      this.whereClause = `WHERE ${column} = $${this.parameters.length + 1}`;
    }
    this.parameters.push(value);
    return this;
  }

  async execute(): Promise<object | object[]> {
    const query = `DELETE FROM ${this.table} ${this.whereClause}`;
    const result = await QueryHandler.getInstance().query(
      query,
      this.parameters
    );
    return result.rows;
  }
}
