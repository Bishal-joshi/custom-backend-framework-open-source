import { QueryHandler } from "../../queryHandler/QueryHandler";
import { QueryBuilder } from "../queryBuilder";

export class UpdateBuilder extends QueryBuilder {
  private table: string;
  private sets: string[];
  private values: any[];
  private whereClause: string;

  constructor(table: string) {
    super();
    this.table = table;
    this.sets = [];
    this.values = [];
    this.whereClause = "";
  }

  set(fields: Record<string, any>): UpdateBuilder {
    Object.entries(fields).forEach(([field, value]) => {
      this.sets.push(`${field} = $${this.values.length + 1}`);
      this.values.push(value);
    });
    return this;
  }

  where(column: string, value: any): UpdateBuilder {
    if (this.whereClause) {
      this.whereClause += ` AND ${column} = $${this.values.length + 1}`;
    } else {
      this.whereClause = `WHERE ${column} = $${this.values.length + 1}`;
    }
    this.values.push(value);
    return this;
  }

  async execute(): Promise<object | object[]> {
    const query = `UPDATE ${this.table} SET ${this.sets.join(", ")} ${
      this.whereClause
    }`;
    const result = await QueryHandler.getInstance().query(query, this.values);
    return result.rows;
  }
}
