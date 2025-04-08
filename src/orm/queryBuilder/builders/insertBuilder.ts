import { QueryHandler } from "../../queryHandler/QueryHandler";
import { QueryBuilder } from "../queryBuilder";

export class InsertBuilder extends QueryBuilder {
  private table: string;
  private fields: string[];
  private values: any[];

  constructor(table: string) {
    super();
    this.table = table;
    this.fields = [];
    this.values = [];
  }

  set(fields: Record<string, any>): InsertBuilder {
    Object.entries(fields).forEach(([field, value]) => {
      this.fields.push(field);
      this.values.push(value);
    });
    return this;
  }

  async execute(): Promise<object | object[]> {
    const fieldList = this.fields.join(", ");
    const valuePlaceholders = this.values.map((_, i) => `$${i + 1}`).join(", ");
    const query = `INSERT INTO ${this.table} (${fieldList}) VALUES (${valuePlaceholders})`;
    const result = await QueryHandler.getInstance().query(query, this.values);
    return result.rows;
  }
}
