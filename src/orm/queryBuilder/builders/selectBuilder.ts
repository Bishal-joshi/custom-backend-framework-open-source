import { QueryHandler } from "../../queryHandler/QueryHandler";
import { QueryBuilder } from "../queryBuilder";
import { WhereBuilder } from "./whereBuilder";

export class SelectBuilder extends QueryBuilder {
  private query: string;

  constructor(fields: string) {
    super();
    this.query = `SELECT ${fields}`;
  }

  from(table: string): WhereBuilder {
    this.query += ` FROM ${table}`;
    return new WhereBuilder(this.query, this.parameters);
  }

  async execute(): Promise<object | object[]> {
    const result = await QueryHandler.getInstance().query(
      this.query,
      this.parameters
    );
    return result.rows;
  }
}
